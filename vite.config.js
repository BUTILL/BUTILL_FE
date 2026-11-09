import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 개발 중 /api 요청은 로컬 FastAPI 서버로 전달 (CORS 설정 불필요)
    proxy: { '/api': 'http://127.0.0.1:8000' },
  },
})
