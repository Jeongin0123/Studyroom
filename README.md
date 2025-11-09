"# Studyroom" 

# FRONT-END
```bash
# 환경설정
# front-end // react setting
git https://github.com/Jeongin0123/Studyroom.git

cd front-end # .../Studyroom/front-end
npm install # 의존성 주입 (node_modules 파일 생성)
npm install tailwindcss @tailwindcss/vite # tailwindcss

# 기본 유틸 관련
npm install clsx tailwind-merge class-variance-authority
npm install --save-dev @types/react @types/react-dom

# Radix UI 기반 컴포넌트들 (`npm i` to install the dependencies.)
npm i
# npm install @radix-ui/react-slot
# npm install @radix-ui/react-progress
# npm install @radix-ui/react-scroll-area
# npm install @radix-ui/react-switch
# npm install @radix-ui/react-select
# npm install @radix-ui/react-label
# npm install lucide-react
# ...

npm run dev # 실행

# vite.config.ts 파일 설정
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})

# index.css에 @tailwindcss 지시문 추가
@import "tailwindcss";

#VS Code에서 Ctrl + Shift + H 실행 후 정규식 On하고 아래 입력
@radix-ui\/react-([\w-]+)@\d+\.\d+\.\d+

#바꾸기
@radix-ui/react-$1
```

# BACK-END
```bash
# 환경설정
# pip install
pip install -r requirements.txt
# pip install fastapi
# pip install sqlalchemy
# pip install pydantic
# pip install lanchain_openai
# pip install lanchain_core
```