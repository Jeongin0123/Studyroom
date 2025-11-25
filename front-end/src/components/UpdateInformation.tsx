import { ArrowLeft } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import logo from "../assets/logo.png";

interface UpdateInformationProps {
    onBack?: () => void;
}

export function UpdateInformation({ onBack }: UpdateInformationProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* 상단 헤더 */}
                <div className="relative mb-8">
                    {/* 뒤로가기 아이콘 */}
                    <button
                        className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
                        onClick={onBack}
                    >
                        <ArrowLeft className="w-5 h-5 text-purple-600" />
                    </button>

                    {/* Pokemon 로고 */}
                    <div className="text-center">
                        <img src={logo} alt="STUDYMON" className="h-12 w-auto mx-auto drop-shadow-md" />
                    </div>
                </div>

                {/* 팝업 카드 */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-4 border-white">
                    {/* 제목 섹션 */}
                    <div className="text-center mb-8">
                        <h2 className="text-purple-600 mb-2">정보 수정 팝업</h2>
                        <p className="text-gray-500 text-sm">수정합니다. 수정합니다. 수정합니다.</p>
                    </div>

                    {/* 입력 필드 섹션 */}
                    <div className="space-y-4">
                        {/* 이름 입력 */}
                        <div>
                            <label className="block mb-2 text-gray-700">이름</label>
                            <Input
                                type="text"
                                placeholder="이름을 입력하세요"
                                className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 bg-purple-50/50 focus:border-purple-400 focus:bg-white transition-all placeholder:text-gray-400"
                            />
                        </div>

                        {/* 이메일 입력 */}
                        <div>
                            <label className="block mb-2 text-gray-700">이메일</label>
                            <Input
                                type="email"
                                placeholder="example@studymon.com"
                                className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 bg-purple-50/50 focus:border-purple-400 focus:bg-white transition-all placeholder:text-gray-400"
                            />
                        </div>

                        {/* 비밀번호 입력 */}
                        <div>
                            <label className="block mb-2 text-gray-700">비밀번호</label>
                            <Input
                                type="password"
                                placeholder="비밀번호를 입력하세요"
                                className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 bg-purple-50/50 focus:border-purple-400 focus:bg-white transition-all placeholder:text-gray-400"
                            />
                        </div>

                        {/* 비밀번호 확인 입력 */}
                        <div>
                            <label className="block mb-2 text-gray-700">비밀번호 확인</label>
                            <Input
                                type="password"
                                placeholder="비밀번호를 다시 입력하세요"
                                className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 bg-purple-50/50 focus:border-purple-400 focus:bg-white transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* 버튼 */}
                    <Button className="w-full mt-8 py-6 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                        정보 수정하기
                    </Button>
                </div>

                {/* 하단 장식 */}
                <div className="flex justify-center gap-2 mt-6">
                    <div className="w-3 h-3 rounded-full bg-pink-300"></div>
                    <div className="w-3 h-3 rounded-full bg-purple-300"></div>
                    <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                </div>
            </div>
        </div>
    );
}
