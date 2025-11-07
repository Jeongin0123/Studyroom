// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  // 예) .env.local 에서 VITE_BACKEND=http://127.0.0.1:8000
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_BACKEND || "http://127.0.0.1:8000";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
      alias: {
        // ✅ Radix UI 모듈 버전 제거용 별칭
        "@radix-ui/react-slot": "@radix-ui/react-slot",
        "@radix-ui/react-progress": "@radix-ui/react-progress",
        "@radix-ui/react-label": "@radix-ui/react-label",
        "@radix-ui/react-scroll-area": "@radix-ui/react-scroll-area",
        "@radix-ui/react-dialog": "@radix-ui/react-dialog",
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: "esnext",
      outDir: "build",
    },
    server: {
      port: 5173, // ✅ 기본 개발 포트 (3000 → 5173)
      open: true,
      strictPort: true,
      proxy: {
        // ✅ /api → 백엔드 8000번 포트로 프록시
        "/api": {
          target,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
    preview: {
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  };
});
