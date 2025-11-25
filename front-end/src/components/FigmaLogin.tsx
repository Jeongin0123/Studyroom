import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Home, ChevronLeft } from 'lucide-react';

interface FigmaLoginProps {
    onLogin: () => void;
    onSignup: () => void;
    onBack: () => void;
    onHome: () => void;
    onForgotPassword: () => void;
}

export function FigmaLogin({ onLogin, onSignup, onBack, onHome, onForgotPassword }: FigmaLoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin();
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
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
                <button
                    onClick={onBack}
                    className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full border-2 border-purple-300 shadow-lg hover:bg-white hover:scale-110 transition-all flex items-center justify-center group"
                >
                    <ChevronLeft className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                </button>
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-md">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-4 border-yellow-300">
                    {/* Logo/Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-5xl mb-4" style={{
                            color: '#FFCB05',
                            textShadow: `
                3px 3px 0 #2A75BB,
                -1px -1px 0 #2A75BB,
                1px -1px 0 #2A75BB,
                -1px 1px 0 #2A75BB,
                1px 1px 0 #2A75BB,
                4px 4px 8px rgba(0,0,0,0.2)
              `,
                            fontFamily: 'system-ui, -apple-system, sans-serif'
                        }}>
                            STUDYMON
                        </h1>
                        <p className="text-gray-600">함께 공부하는 즐거움!</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-gray-700">아이디</Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="아이디를 입력하세요"
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
                                className="w-full rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg h-12"
                            >
                                로그인
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
                    <div className="mt-6 flex justify-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
