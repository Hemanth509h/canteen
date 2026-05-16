import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import { registerRoutes } from "./routes.js";
import { connectToDatabase, getStorage } from "./db.js";
import { seedBrandingFromFile } from "./branding.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
  }
});

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));

// Global API rate limiter (200 req / 15 min per IP)
const globalApiRateLimit = (() => {
  const buckets = new Map();
  return (req, res, next) => {
    if (!req.path.startsWith("/api")) return next();
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const max = 200;
    const bucket = buckets.get(ip) || { count: 0, resetAt: now + windowMs };
    if (bucket.resetAt <= now) { bucket.count = 0; bucket.resetAt = now + windowMs; }
    bucket.count += 1;
    buckets.set(ip, bucket);
    if (bucket.count > max) {
      res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
      return res.status(429).json({ success: false, data: null, error: "Too many requests. Please slow down.", timestamp: new Date().toISOString() });
    }
    next();
  };
})();
app.use(globalApiRateLimit);

// Share io instance with requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  log(`Client connected: ${socket.id}`, "socket.io");
  socket.on("disconnect", () => {
    log(`Client disconnected: ${socket.id}`, "socket.io");
  });
});

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

// Set headers manually for Replit environment
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Allow-Private-Network');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Replit-specific fix for NotSameOrigin errors in webview
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Opener-Policy', 'unsafe-none');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware to log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[DEBUG] Incoming Request: ${req.method} ${req.url}`);
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

// Initialize database and start server
const startServer = async () => {
  try {
    await connectToDatabase();
    await seedBrandingFromFile(getStorage());
    await registerRoutes(app);

    const port = process.env.PORT || 3000;
    httpServer.listen(port, "0.0.0.0", () => {
      log(`API server listening on http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
