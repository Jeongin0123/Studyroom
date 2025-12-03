import { ArrowLeft } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import logo from "../assets/logo.png";
import bg from "../assets/bg.png";

interface UpdateInformationProps {
    onBack?: () => void;
}

export function UpdateInformation({ onBack }: UpdateInformationProps) {
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
                            <label className="block mb-2 text-gray-700">이름</label>
                            <Input
                                type="text"
                                placeholder="이름을 입력하세요"
                                className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-400 bg-white/90 placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-gray-700">이메일</label>
                            <Input
                                type="email"
                                placeholder="example@studymon.com"
                                className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-400 bg-white/90 placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-gray-700">비밀번호</label>
                            <Input
                                type="password"
                                placeholder="비밀번호를 입력하세요"
                                className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-400 bg-white/90 placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-gray-700">비밀번호 확인</label>
                            <Input
                                type="password"
                                placeholder="비밀번호를 다시 입력하세요"
                                className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-400 bg-white/90 placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <Button className="w-full mt-8 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg h-12">
                        정보 수정하기
                    </Button>
                </div>
            </div>
        </div>
    );
}
