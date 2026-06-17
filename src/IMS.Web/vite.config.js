import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: "localhost",
    // Mirror the nginx reverse proxy in Docker: forward /api/* to the
    // backend running on the host. With this in place, axiosInstance.js
    // can use an empty baseURL in both `npm run dev` and the Docker
    // image — the browser only sees same-origin requests either way.
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
