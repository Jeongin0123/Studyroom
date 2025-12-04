import bg from "../assets/bg.png";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Home, ArrowLeft, Mail, Lock } from "lucide-react";
import { useState } from "react";
import logo from "../assets/logo.png";

interface ForgotPasswordProps {
    onBack: () => void;
    onLogin: () => void;
    onSignup: () => void;
    onHome: () => void;
}

export function ForgotPassword({ onBack, onLogin, onSignup, onHome }: ForgotPasswordProps) {
    const [email, setEmail] = useState("");
    const [foundPassword, setFoundPassword] = useState("");

    const handleFindPassword = async () => {
        if (!email) {
            alert('이메일을 입력해주세요.');
            return;
        }

        try {
            const response = await fetch('/api/password/forgot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.detail || '비밀번호 찾기에 실패했습니다.');
                setFoundPassword("");
                return;
            }

            setFoundPassword(data.password);
        } catch (error) {
            console.error('비밀번호 찾기 오류:', error);
            alert('오류가 발생했습니다. 다시 시도해주세요.');
            setFoundPassword("");
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-4"
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* Navigation Top-Left */}
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
                    <ArrowLeft className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                </button>
            </div>

            {/* Main Card */}
            <Card className="relative w-full max-w-md p-8 shadow-2xl rounded-8x1 p-8 border-8 border-yellow-300"
                style={{ background: "#F8F8F8" }}
            >

                <div className="text-center mb-6">
                    <img src={logo} alt="STUDYMON" className="h-16 w-auto mx-auto drop-shadow-lg" />
                    <h1 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                        비밀번호 찾기
                    </h1>
                    <p className="text-gray-500">
                        가입하신 이메일 주소를 입력하시면 <br></br>비밀번호를 확인하실 수 있습니다.
                    </p>
                </div>

                {/* Email Input */}
                <div className="space-y-3 mb-8">
                    <Label htmlFor="email" className="text-gray-700 flex items-center gap-2">

                        이메일 주소
                    </Label>
                    <div className="relative">
                        <Input
                            id="email"
                            type="email"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="rounded-2xl border-2 border-purple-200 focus:border-purple-400 bg-white/90"
                        />
                    </div>
                </div>

                {/* Find Password Button */}
                <Button
                    onClick={handleFindPassword}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >

                    비밀번호 찾기
                </Button>
                <br></br>

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

        </div>
    );
}
