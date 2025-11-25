import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Home, ArrowLeft, Mail, Lock } from "lucide-react";
import { useState } from "react";

interface ForgotPasswordProps {
    onBack: () => void;
    onLogin: () => void;
    onSignup: () => void;
    onHome: () => void;
}

export function ForgotPassword({ onBack, onLogin, onSignup, onHome }: ForgotPasswordProps) {
    const [email, setEmail] = useState("");
    const [foundPassword, setFoundPassword] = useState("");

    const handleFindPassword = () => {
        if (email) {
            setFoundPassword("User.pw");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-6">
            {/* Logo */}
            <div className="mb-12">
                <div className="relative">
                    <div className="text-5xl bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent px-12 py-5 border-4 border-purple-300 rounded-3xl shadow-2xl bg-white/80 backdrop-blur-sm">
                        STUDYMON
                    </div>
                </div>
            </div>

            {/* Main Card */}
            <Card className="w-full max-w-2xl p-10 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border-2 border-purple-200">
                {/* Navigation */}
                <div className="flex items-center gap-3 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onHome}
                        className="rounded-full hover:bg-purple-100 transition-all hover:scale-110"
                    >
                        <Home className="w-5 h-5 text-purple-600" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="rounded-full hover:bg-purple-100 transition-all hover:scale-110"
                    >
                        <ArrowLeft className="w-5 h-5 text-purple-600" />
                    </Button>
                </div>

                {/* Title with Icon */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
                        <Lock className="w-8 h-8 text-purple-600" />
                    </div>
                    <h1 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                        비밀번호 찾기
                    </h1>
                    <p className="text-gray-500">
                        가입하신 이메일 주소를 입력하시면 비밀번호를 확인하실 수 있습니다.
                    </p>
                </div>

                {/* Email Input */}
                <div className="space-y-3 mb-8">
                    <Label htmlFor="email" className="text-purple-700 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        이메일 주소
                    </Label>
                    <div className="relative">
                        <Input
                            id="email"
                            type="email"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border-2 border-purple-200 rounded-2xl px-5 py-7 text-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
                        />
                    </div>
                </div>

                {/* Find Password Button */}
                <Button
                    onClick={handleFindPassword}
                    className="w-full bg-gradient-to-r from-purple-400 via-purple-500 to-pink-500 hover:from-purple-500 hover:via-purple-600 hover:to-pink-600 text-white rounded-2xl py-7 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] mb-8"
                >
                    <Mail className="w-5 h-5 mr-2" />
                    비밀번호 찾기
                </Button>

                {/* Result */}
                {foundPassword && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                                <span className="text-2xl">✓</span>
                            </div>
                        </div>
                        <p className="text-purple-700 mb-4">
                            회원님의 비밀번호를 찾았습니다!
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-gray-600">비밀번호:</span>
                            <span className="inline-block px-6 py-3 bg-white border-2 border-purple-300 rounded-xl shadow-sm">
                                {foundPassword}
                            </span>
                        </div>
                    </div>
                )}

                {/* Bottom Links */}
                <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-purple-100">
                    <Button variant="link" onClick={onLogin} className="text-purple-600 hover:text-purple-700">
                        로그인하기
                    </Button>
                    <span className="text-gray-300">|</span>
                    <Button variant="link" onClick={onSignup} className="text-purple-600 hover:text-purple-700">
                        회원가입
                    </Button>
                </div>
            </Card>

            {/* Footer */}
            <p className="mt-8 text-sm text-gray-400">
                © 2024 STUDYMON. All rights reserved.
            </p>
        </div>
    );
}
