import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5174,
    strictPort: true,
    // 개발 중 /api 요청은 로컬 FastAPI 서버로 전달
    proxy: { "/api": "http://127.0.0.1:8000" },
  },
});
