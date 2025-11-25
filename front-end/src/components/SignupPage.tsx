import { useState } from 'react';
import { Home } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import logo from "../assets/logo.png";

interface SignupPageProps {
  onHome?: () => void;
}

export function SignupPage({ onHome }: SignupPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    console.log('회원가입 시도:', { name, email, password });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 상단 헤더 */}
        <div className="relative mb-8">
          {/* 홈 버튼 */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <button
              onClick={onHome}
              className="w-12 h-12 rounded-full bg-white border-2 border-purple-300 flex items-center justify-center hover:bg-purple-50 transition-colors shadow-sm"
            >
              <Home className="w-5 h-5 text-purple-500" />
            </button>
          </div>

          {/* Pokemon 스타일 로고 */}
          <div className="text-center">
            <img src={logo} alt="STUDYMON" className="h-16 w-auto mx-auto drop-shadow-lg" />
          </div>
        </div>

        {/* 메인 카드 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl mb-2 text-gray-800">회원가입</h2>
            <p className="text-sm text-gray-500">환영합니다. 환영합니다. 환영합니다.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이름 입력 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">이름</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="h-12 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:ring-purple-400 bg-gray-50/50"
                required
              />
            </div>

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

            {/* 비밀번호 확인 입력 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:ring-purple-400 bg-gray-50/50"
                required
              />
            </div>

            {/* 회원가입 버튼 */}
            <Button
              type="submit"
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              회원가입하기
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
