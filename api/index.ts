import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { connectToDatabase } from "../server/db";
import path from "path";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

let isInitialized = false;

async function initializeApp() {
  if (isInitialized) return;
  
  await connectToDatabase();
  await registerRoutes(app);
  
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  
  isInitialized = true;
}

const handler = async (req: Request, res: Response) => {
  await initializeApp();
  return app(req, res);
};

export default handler;
