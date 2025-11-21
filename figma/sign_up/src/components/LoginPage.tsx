import { useState } from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function LoginPage({ onNavigateToSignup }: { onNavigateToSignup?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('로그인 시도:', { email, password });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 상단 헤더 */}
        <div className="relative mb-8">
          {/* 좌측 버튼 그룹 */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex gap-2">
            <button className="w-12 h-12 rounded-full bg-white border-2 border-purple-300 flex items-center justify-center hover:bg-purple-50 transition-colors shadow-sm">
              <Home className="w-5 h-5 text-purple-500" />
            </button>
            <button className="w-12 h-12 rounded-full bg-white border-2 border-purple-300 flex items-center justify-center hover:bg-purple-50 transition-colors shadow-sm">
              <ArrowLeft className="w-5 h-5 text-purple-500" />
            </button>
          </div>
          
          {/* Pokemon 스타일 로고 */}
          <div className="text-center">
            <h1 className="text-5xl tracking-wider" style={{ 
              fontFamily: 'system-ui, -apple-system, sans-serif',
              color: '#FFCB05',
              textShadow: `
                3px 3px 0 #2A75BB,
                -1px -1px 0 #2A75BB,
                1px -1px 0 #2A75BB,
                -1px 1px 0 #2A75BB,
                1px 1px 0 #2A75BB,
                4px 4px 8px rgba(0,0,0,0.2)
              `
            }}>
              Pokemon
            </h1>
          </div>
        </div>

        {/* 메인 카드 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl mb-2 text-gray-800">로그인</h2>
            <p className="text-sm text-gray-500">다시 만나서 반갑습니다</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이메일 입력 */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="h-12 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:ring-purple-400 bg-gray-50/50"
                required
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:ring-purple-400 bg-gray-50/50"
                required
              />
            </div>

            {/* 로그인 버튼 */}
            <Button
              type="submit"
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              로그인하기
            </Button>

            {/* 회원가입 링크 */}
            {onNavigateToSignup && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={onNavigateToSignup}
                  className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
                >
                  계정이 없으신가요? 회원가입
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}