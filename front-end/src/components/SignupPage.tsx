import { useState } from 'react';
import { Home } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import logo from "../assets/logo.png";
import bg from "../assets/bg.png";

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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md">
         {/* Navigation Buttons - Top Left */}
            <div className="absolute top-6 left-6 flex gap-3 z-10">
                <button
                    onClick={onHome}
                    className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full border-2 border-purple-300 shadow-lg hover:bg-white hover:scale-110 transition-all flex items-center justify-center group"
                >
                    <Home className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                </button>
            </div>

        {/* 메인 카드 */}
        <div className="relative w-full max-w-md">
          <div className="backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-8 border-yellow-300"
               style={{ background: "#F8F8F8" }}
          >
            {/*<h2 className="text-2xl mb-2 text-gray-800">회원가입</h2>*/}
            {/* Pokemon 스타일 로고 */}
            <div className="text-center">
              <img src={logo} alt="STUDYMON" className="h-16 w-auto mx-auto drop-shadow-lg" />
            <p className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">스터디몬과 함께해요!</p>
            </div>
          
          <br></br>
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
                className="rounded-2xl border-2 border-purple-200 focus:border-purple-400 bg-white/90"
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
                className="rounded-2xl border-2 border-purple-200 focus:border-purple-400 bg-white/90"
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
                className="rounded-2xl border-2 border-purple-200 focus:border-purple-400 bg-white/90"
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
                className="rounded-2xl border-2 border-purple-200 focus:border-purple-400 bg-white/90"
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
    </div>
  );
}
