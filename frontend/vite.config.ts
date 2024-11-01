import { defineConfig } from "vite";
import path from "path";
import dotenv from "dotenv";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
dotenv.config();
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "process.env": process.env,
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: `${process.env.BACKEND_URL}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
