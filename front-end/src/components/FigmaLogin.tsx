import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Home, ChevronLeft } from 'lucide-react';
import logo from "../assets/logo.png";
import bg from "../assets/bg.png";

interface User {
    userId: number;
    nickname: string;
    email: string;
    exp: number;
}

interface FigmaLoginProps {
    onLogin: (user: User) => void;
    onSignup: () => void;
    onBack: () => void;
    onHome: () => void;
    onForgotPassword: () => void;
}

export function FigmaLogin({ onLogin, onSignup, onBack, onHome, onForgotPassword }: FigmaLoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    pw: password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.detail || '로그인에 실패했습니다.');
                return;
            }

            // 로그인 성공 - user 객체 전달
            onLogin({
                userId: data.user_id,
                nickname: data.nickname,
                email: data.email,
                exp: data.exp,
            });
        } catch (error) {
            console.error('로그인 오류:', error);
            alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
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
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-200/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/3 w-36 h-36 bg-pink-200/30 rounded-full blur-3xl"></div>
            </div>

            {/* Navigation Buttons - Top Left */}
            <div className="absolute top-6 left-6 flex gap-3 z-10">
                <button
                    onClick={onHome}
                    className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full border-2 border-purple-300 shadow-lg hover:bg-white hover:scale-110 transition-all flex items-center justify-center group"
                >
                    <Home className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                </button>
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-md">
                <div
                    className="backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-8 border-yellow-300"
                    style={{ background: "#F8F8F8" }}
                >
                    {/* Logo/Title */}
                    <div className="text-center mb-8">
                        <img src={logo} alt="STUDYMON" className="h-14 w-auto mx-auto drop-shadow-lg mb-2" />
                        <p className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">함께 공부하는 즐거움!</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
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

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700">비밀번호</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호를 입력하세요"
                                className="rounded-2xl border-2 border-purple-200 focus:border-purple-400 bg-white/90"
                                required
                            />
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={onForgotPassword}
                                    className="text-sm text-purple-500 hover:text-purple-700 hover:underline transition-colors"
                                >
                                    비밀번호 찾기
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg h-12 disabled:opacity-50"
                            >
                                {isLoading ? '로그인 중...' : '로그인'}
                            </Button>
                            <Button
                                type="button"
                                onClick={onSignup}
                                variant="outline"
                                className="w-full rounded-2xl border-2 border-pink-300 text-pink-600 hover:bg-pink-50 h-12"
                            >
                                회원가입
                            </Button>
                        </div>
                    </form>

                    {/* Footer decorations */}
                </div>
            </div>
        </div>
    );
}
