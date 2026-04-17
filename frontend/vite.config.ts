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
    host: "[IP_ADDRESS]",
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "https://canteen-f0rq.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
