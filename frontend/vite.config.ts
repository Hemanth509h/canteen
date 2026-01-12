import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
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
      "/api": {
        target: "http://0.0.0.0:3000",
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            // Re-apply critical CORS headers for the proxied response
            proxyRes.headers['access-control-allow-origin'] = '*';
            proxyRes.headers['access-control-allow-credentials'] = 'true';
            proxyRes.headers['cross-origin-resource-policy'] = 'cross-origin';
            proxyRes.headers['cross-origin-embedder-policy'] = 'unsafe-none';
            proxyRes.headers['cross-origin-opener-policy'] = 'unsafe-none';
          });
        },
      },
    },
  },
});
