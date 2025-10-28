"# Studyroom" 

```bash
# front-end // react setting
git https://github.com/Jeongin0123/Studyroom.git

cd front-end # .../Studyroom/front-end
npm install # 의존성 주입 (node_modules 파일 생성)
npm install tailwindcss @tailwindcss/vite # tailwindcss

# 기본 유틸 관련
npm install clsx tailwind-merge class-variance-authority

# Radix UI 기반 컴포넌트들 (`npm i` to install the dependencies.)
npm install @radix-ui/react-slot
npm install @radix-ui/react-progress
npm install @radix-ui/react-scroll-area
npm install @radix-ui/react-switch
npm install @radix-ui/react-select
npm install @radix-ui/react-label

# 아이콘 관련 (lucide-react)
npm install lucide-react


npm run dev # 실행

```bash
# vite.config.ts 파일 설정
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})

```bash
# index.css에 @tailwindcss 지시문 추가
@import "tailwindcss";

```bash
#VS Code에서 Ctrl + Shift + H 실행 후 정규식 On하고 아래 입력
@radix-ui\/react-([\w-]+)@\d+\.\d+\.\d+

#바꾸기
@radix-ui/react-$1
