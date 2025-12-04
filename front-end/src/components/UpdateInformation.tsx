import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useUser } from "./UserContext";
import logo from "../assets/logo.png";
import bg from "../assets/bg.png";

interface UpdateInformationProps {
    onBack?: () => void;
    onUpdateSuccess?: () => void;
}

export function UpdateInformation({ onBack, onUpdateSuccess }: UpdateInformationProps) {
    const { user } = useUser();
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // 초기값 설정
    useEffect(() => {
        if (user) {
            setNickname(user.nickname || "");
            setEmail(user.email || "");
        }
    }, [user]);

    const handleUpdate = async () => {
        if (!user) return;

        if (!nickname || !email || !password) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        if (password !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/users/update/${user.userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nickname,
                    email,
                    pw: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("정보가 수정되었습니다. 다시 로그인해주세요.");
                if (onUpdateSuccess) {
                    onUpdateSuccess();
                }
            } else {
                alert(data.detail || "정보 수정에 실패했습니다.");
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("정보 수정 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="relative min-h-screen flex items-center justify-center p-4"
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* 배경 데코 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-200/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/3 w-36 h-36 bg-pink-200/30 rounded-full blur-3xl"></div>
            </div>

            {/* 뒤로가기 */}
            <div className="absolute top-6 left-6 z-10">
                <button
                    className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full border-2 border-purple-300 shadow-lg hover:bg-white hover:scale-110 transition-all flex items-center justify-center group"
                    onClick={onBack}
                >
                    <ArrowLeft className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                </button>
            </div>

            <div className="relative w-full max-w-md">
                <div
                    className="backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-8 border-yellow-300"
                    style={{ background: "#F8F8F8" }}
                >
                    <div className="text-center mb-6">
                        <img src={logo} alt="STUDYMON" className="h-14 w-auto mx-auto drop-shadow-lg mb-2" />
                        <p className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            정보 수정
                        </p>
                        <p className="text-sm text-gray-600 mt-1">회원 정보를 최신 상태로 업데이트하세요.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block mb-2 text-gray-700">닉네임</label>
                            <Input
                                type="text"
                                placeholder="닉네임을 입력하세요"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-400 bg-white/90 placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-gray-700">이메일</label>
                            <Input
                                type="email"
                                placeholder="example@studymon.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-400 bg-white/90 placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-gray-700">비밀번호</label>
                            <Input
                                type="password"
                                placeholder="비밀번호를 입력하세요"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-400 bg-white/90 placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-gray-700">비밀번호 확인</label>
                            <Input
                                type="password"
                                placeholder="비밀번호를 다시 입력하세요"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-400 bg-white/90 placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleUpdate}
                        disabled={isLoading}
                        className="w-full mt-8 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg h-12"
                    >
                        {isLoading ? "수정 중..." : "정보 수정하기"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
