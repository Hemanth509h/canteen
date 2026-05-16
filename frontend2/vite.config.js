import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const RESEND_API_KEY = env.RESEND_API_KEY;
  const RESEND_FROM_EMAIL = env.RESEND_FROM_EMAIL;

  return {
    plugins: [
      react(),
      {
        name: "vite-plugin-resend-api",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.method === "POST" && req.url?.startsWith("/api/send-email")) {
              try {
                let body = "";
                await new Promise((resolve, reject) => {
                  req.on("data", (chunk) => {
                    body += chunk;
                  });
                  req.on("end", resolve);
                  req.on("error", reject);
                });

                const payload = body ? JSON.parse(body) : {};
                const { to, subject, text, html } = payload;

                if (!Array.isArray(to) || to.length === 0) {
                  res.statusCode = 400;
                  res.setHeader("Content-Type", "application/json");
                  return res.end(JSON.stringify({ error: "`to` must be a non-empty array." }));
                }

                if (!subject || (!text && !html)) {
                  res.statusCode = 400;
                  res.setHeader("Content-Type", "application/json");
                  return res.end(JSON.stringify({ error: "`subject` and `text` or `html` are required." }));
                }

                if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  return res.end(JSON.stringify({ error: "Resend API credentials are not configured." }));
                }

                const resendResponse = await fetch("https://api.resend.com/emails", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${RESEND_API_KEY}`,
                  },
                  body: JSON.stringify({ from: RESEND_FROM_EMAIL, to, subject, text, html }),
                });

                const responseBody = await resendResponse.text();
                res.statusCode = resendResponse.status;
                res.setHeader("Content-Type", "application/json");
                return res.end(responseBody);
              } catch (error) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                return res.end(JSON.stringify({ error: error?.message || "Unknown server error." }));
              }
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5000,
      host: "0.0.0.0",
      allowedHosts: true,
      proxy: {
        "/socket.io": {
          target: "http://localhost:3000",
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
