import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => `/JP2Sched${path}`,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            console.log("[proxy] sending to Apache:", proxyReq.path);
          });
        },
      },
    },
  },
});