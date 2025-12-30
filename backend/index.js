import express from "express";
import { registerRoutes } from "./routes.js";

const app = express();

function log(message, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Enable CORS for frontend communication
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Allow the specific Vercel domain or all origins for debugging
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({
  limit: '50mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Database connection middleware for serverless
const dbMiddleware = async (req, res, next) => {
  try {
    const { connectToDatabase } = await import("./db.js");
    await connectToDatabase();
    next();
  } catch (error) {
    console.error("Database connection middleware error:", error);
    res.status(500).json({ error: "Internal Server Error (Database Connection Failed)" });
  }
};

// Handle initialization for serverless
let routesRegistered = false;
const initServerless = async (req, res, next) => {
  if (!routesRegistered) {
    const { registerRoutes } = await import("./routes.js");
    await registerRoutes(app);
    routesRegistered = true;
  }
  next();
};

if (process.env.VERCEL) {
  app.use(initServerless);
  app.use("/api", dbMiddleware);
}

// ALWAYS start the local server if not on Vercel
if (!process.env.VERCEL) {
  const port = 3000;
  (async () => {
    try {
      const { connectToDatabase } = await import("./db.js");
      await connectToDatabase();
      const { registerRoutes } = await import("./routes.js");
      await registerRoutes(app);
      app.listen({
        port,
        host: "0.0.0.0",
      }, () => {
        log(`serving on port ${port}`);
      });
    } catch (err) {
      console.error("Failed to start local server:", err);
    }
  })();
}

export default app;
