import WebcamView from "../WebcamView";
import { Button } from "./ui/button";
import { usePage } from "./PageContext";
import { Card, CardContent } from "./ui/card";
import { Video, VideoOff, Mic, MicOff } from "lucide-react";
import { useState } from "react";

export function StudyRoomEntrance() {
    const { setCurrentPage } = usePage();
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-xl">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">스터디룸 입장</h1>
                        <Button variant="outline" onClick={() => setCurrentPage('home')}>
                            취소
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="aspect-video bg-black/90 rounded-xl overflow-hidden shadow-inner relative">
                                <WebcamView enabled={isCameraOn} />
                                {!isCameraOn && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                        <div className="text-center">
                                            <VideoOff className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-400">카메라가 꺼져 있습니다</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 카메라/마이크 컨트롤 버튼 */}
                            <div className="flex items-center justify-center gap-4">
                                <Button
                                    variant={isCameraOn ? "default" : "destructive"}
                                    size="lg"
                                    onClick={() => setIsCameraOn(!isCameraOn)}
                                    className="flex items-center gap-2 px-6"
                                >
                                    {isCameraOn ? (
                                        <>
                                            <Video className="w-5 h-5" />
                                            카메라 켜짐
                                        </>
                                    ) : (
                                        <>
                                            <VideoOff className="w-5 h-5" />
                                            카메라 꺼짐
                                        </>
                                    )}
                                </Button>

                                <Button
                                    variant={isMicOn ? "default" : "destructive"}
                                    size="lg"
                                    onClick={() => setIsMicOn(!isMicOn)}
                                    className="flex items-center gap-2 px-6"
                                >
                                    {isMicOn ? (
                                        <>
                                            <Mic className="w-5 h-5" />
                                            마이크 켜짐
                                        </>
                                    ) : (
                                        <>
                                            <MicOff className="w-5 h-5" />
                                            마이크 꺼짐
                                        </>
                                    )}
                                </Button>
                            </div>

                            <p className="text-sm text-gray-600 text-center">
                                카메라와 마이크가 잘 작동하는지 확인해주세요.
                            </p>
                        </div>

                        <div className="flex flex-col justify-center space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-gray-700">입장 전 체크리스트</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-center gap-2">
                                        <span>{isCameraOn ? "✅" : "⬜"}</span> 카메라가 켜져 있나요?
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span>{isMicOn ? "✅" : "⬜"}</span> 마이크가 작동하나요?
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span>✅</span> 주변이 너무 시끄럽지 않은가요?
                                    </li>
                                </ul>
                            </div>

                            <div className="pt-4">
                                <Button
                                    className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all hover:scale-[1.02]"
                                    onClick={() => setCurrentPage('studyroom')}
                                >
                                    입장하기
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
