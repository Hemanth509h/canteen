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

// Debug log for incoming requests
app.use((req, res, next) => {
  log(`Request: ${req.method} ${req.url}`);
  next();
});

// Enable CORS for frontend communication
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
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

// Database connection management for serverless
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  const { connectToDatabase } = await import("./db.js");
  await connectToDatabase();
  isConnected = true;
};

// Handle routes registration once
let isRoutesRegistered = false;
const initApp = async () => {
  if (isRoutesRegistered) return;
  const { registerRoutes } = await import("./routes.js");
  await registerRoutes(app);
  isRoutesRegistered = true;
};

// Global Middleware to ensure DB and Routes are ready
app.use(async (req, res, next) => {
  try {
    await connectDB();
    await initApp();
    next();
  } catch (error) {
    console.error("Initialization error:", error);
    res.status(500).json({ error: "Failed to initialize API" });
  }
});

// Remove old environment-specific middleware and listeners
// ALWAYS start the local server
const port = 3000;
app.listen(port, "0.0.0.0", () => {
  log(`API server listening on port ${port}`);
});

export default app;
