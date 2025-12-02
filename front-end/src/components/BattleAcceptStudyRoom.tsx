import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect, useRef } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Video, Send } from "lucide-react";
import { usePage } from "./PageContext";
import { AiChatPage } from "./AiChatPage";
import logo from "../assets/logo.png";

export function BattleAcceptStudyRoom() {
    const { setCurrentPage } = usePage();
    const [message, setMessage] = useState("");
    const [showAIChat, setShowAIChat] = useState(false);

    // 졸음 감지 상태
    const [drowsinessCount, setDrowsinessCount] = useState(0);
    const [currentState, setCurrentState] = useState<string>("Normal");
    const [lastSleepyDetection, setLastSleepyDetection] = useState<number>(0);
    const [detectionWindow, setDetectionWindow] = useState<string[]>([]);

    // 졸음 감지 핸들러
    const handleDrowsinessDetected = async (result: string) => {
        setCurrentState(result);
        console.log(`[졸음 감지] 현재 상태: ${result}`);

        setDetectionWindow(prev => {
            const newWindow = [...prev, result].slice(-10);
            console.log(`[윈도우] 현재 버퍼: [${newWindow.join(', ')}] (${newWindow.length}/10)`);

            if (newWindow.length === 10) {
                const sleepyCount = newWindow.filter(r => r === "Sleepy").length;
                console.log(`[윈도우] 통계 - Sleepy: ${sleepyCount}/10`);

                if (sleepyCount >= 6) {
                    const now = Date.now();
                    if (now - lastSleepyDetection > 3000) {
                        // 백엔드 API 호출하여 졸음 로그 저장 및 횟수 증가
                        // TODO: 실제 user_id 사용 (현재는 하드코딩)
                        const userId = 1; // 임시 user_id

                        fetch(`http://localhost:8000/api/drowsiness/log`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                user_id: userId,
                                event_type: 'drowsy'
                            })
                        })
                            .then(res => res.json())
                            .then(data => {
                                console.log(`[졸음 감지] ⚠️ 졸음 로그 저장 완료!`, data);
                                setDrowsinessCount(prev => prev + 1);
                            })
                            .catch(err => {
                                console.error('[졸음 감지] API 호출 실패:', err);
                                // 실패해도 로컬 카운트는 증가
                                setDrowsinessCount(prev => prev + 1);
                            });

                        setLastSleepyDetection(now);
                        return [];
                    }
                }
            }
            return newWindow;
        });
    };

    // 배틀 참가자 데이터
    const participants = [
        { id: 1, name: "나", emoji: "⚡", online: true, isMe: true },
        { id: 2, name: "파이리d456", emoji: "🔥", online: true },
        { id: 3, name: "꼬부기789", emoji: "💧", online: true },
        { id: 4, name: "이상해씨101", emoji: "🌱", online: true },
    ];

    // 채팅 메시지
    const chatMessages = [
        { user: "피카츄123", message: "안녕하세요!" },
        { user: "파이리d456", message: "오늘도 화이팅!" },
    ];

    return (
        <div className="h-screen overflow-hidden bg-gradient-to-br from-purple-100 via-pink-100 to-purple-200 flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-purple-200">
                <div className="flex-1"></div>
                <div className="flex-1 flex justify-center">
                    <img src={logo} alt="STUDYMON" className="h-10 w-auto drop-shadow-lg" />
                </div>
                <div className="flex-1 flex justify-end">
                    <Button
                        onClick={() => setCurrentPage('studyroom')}
                        className="bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 rounded-full px-6 text-white"
                    >
                        퇴장하기
                    </Button>
                </div>
            </header>

            <div className="flex gap-4 p-6 flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-64 space-y-4 overflow-y-auto">
                    {/* 배틀존 타이틀 */}
                    <Card className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-purple-200">
                        <div className="text-center mb-3 font-bold text-purple-800">
                            <span className="text-xl">⚡⚡⚡</span>
                            <span className="mx-2">배틀존</span>
                            <span className="text-xl">⚡⚡⚡</span>
                        </div>
                    </Card>

                    {/* 내 포켓몬 */}
                    <Card className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-purple-200">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-16 h-16 bg-pink-200 rounded-xl flex items-center justify-center overflow-hidden">
                                <ImageWithFallback
                                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
                                    alt="포켓몬"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="text-sm">
                                <div className="font-bold">피카츄123</div>
                                <div className="text-gray-600">포켓몬: 피카츄</div>
                                <div className="text-gray-600">타입: 전기</div>
                                <div className="text-gray-600">EXP: 1200</div>
                            </div>
                        </div>
                    </Card>

                    {/* VS 카드 */}
                    <Card className="p-4 bg-gradient-to-br from-green-200 to-green-300 rounded-2xl border-2 border-green-400">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-white/50 rounded-lg flex items-center justify-center overflow-hidden">
                                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" alt="p1" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs mb-1 font-bold text-green-800">HP</div>
                                    <div className="h-3 bg-white rounded-full overflow-hidden border border-green-400">
                                        <div className="h-full bg-red-500" style={{ width: "70%" }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-3xl text-center text-red-600 font-black italic shadow-sm">VS</div>

                            <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-white/50 rounded-lg flex items-center justify-center overflow-hidden">
                                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png" alt="p2" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs mb-1 font-bold text-green-800">HP</div>
                                    <div className="h-3 bg-white rounded-full overflow-hidden border border-green-400">
                                        <div className="h-full bg-red-500" style={{ width: "43%" }}></div>
                                    </div>
                                    <div className="text-xs text-right font-mono text-green-900">43/90</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* 기술 버튼 */}
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 text-xs">
                            100만볼트
                        </Button>
                        <Button variant="outline" className="rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 text-xs">
                            전광석화
                        </Button>
                        <Button variant="outline" className="rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 text-xs">
                            아이언테일
                        </Button>
                        <Button variant="outline" className="rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 text-xs">
                            번개
                        </Button>
                    </div>

                    <Card className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-purple-200">
                        <div className="text-center mb-2 font-bold text-purple-800">Battle Time !</div>
                        <Button className="w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 rounded-full">
                            회복하기
                        </Button>
                    </Card>
                </div>

                {/* Center - Battle Zone */}
                <div className="flex-1 flex flex-col">
                    <Card className="flex-1 p-6 bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-purple-200 overflow-y-auto">
                        {/* 스터디룸 타이틀 */}
                        <div className="text-center mb-4">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                ⚡ 스터디룸 ⚡
                            </h2>
                        </div>

                        {/* 참가자 그리드 */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {participants.map((participant) => (
                                <BattleParticipantCard
                                    key={participant.id}
                                    participant={participant}
                                    onDrowsinessDetected={participant.isMe ? handleDrowsinessDetected : undefined}
                                />
                            ))}
                        </div>

                        {/* 졸음 감지 상태 표시 */}
                        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-purple-100 mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-700 text-sm">😴 졸음 감지 모니터링</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">누적 졸음 횟수:</span>
                                    <span className={`text-lg font-bold ${drowsinessCount > 5 ? 'text-red-500' : 'text-blue-500'}`}>
                                        {drowsinessCount}회
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                                <span className="text-xs font-medium text-gray-600">현재 상태:</span>
                                <div className={`px-3 py-1 rounded-full font-bold text-xs ${currentState === "Normal" ? "bg-green-100 text-green-700" :
                                    currentState === "Yawn" ? "bg-yellow-100 text-yellow-700" :
                                        "bg-red-100 text-red-700"
                                    }`}>
                                    {currentState === "Normal" && "😊 정상"}
                                    {currentState === "Yawn" && "🥱 하품"}
                                    {currentState === "Sleepy" && "😴 졸림 감지!"}
                                </div>
                            </div>
                        </div>

                        {/* 하단 메시지 영역 */}
                        <Card className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-200 flex items-center justify-between">
                            <div className="text-pink-600 font-bold text-sm">### 열심히 공부 중입니다! ###</div>
                            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-purple-200">
                                <ImageWithFallback
                                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
                                    alt="포켓몬"
                                    className="w-full h-full object-contain bg-white"
                                />
                            </div>
                        </Card>
                    </Card>
                </div>

                {/* Right Sidebar */}
                <div className="w-80">
                    <Card className="h-full p-6 bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-purple-200 flex flex-col">
                        {/* 채팅 섹션 */}
                        <div className="mb-6 flex-1 overflow-y-auto">
                            <h3 className="text-lg mb-4 text-purple-700 font-bold">채팅</h3>
                            <div className="space-y-3">
                                {chatMessages.map((msg, index) => (
                                    <Card key={index} className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                                        <div className="text-sm text-purple-700 mb-1 font-semibold">{msg.user}</div>
                                        <div className="text-sm text-gray-800">{msg.message}</div>
                                    </Card>
                                ))}
                                <Button className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl mb-2">
                                    반가워요~
                                </Button>
                                <Button className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl mb-2">
                                    오늘도 화이팅!
                                </Button>
                                <Button className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl">
                                    내일 알려줘 공부합시다
                                </Button>
                            </div>
                        </div>

                        {/* 텍스트 입력 영역 */}
                        <div className="mt-auto space-y-3">
                            <Input
                                placeholder="텍스트 입력 ..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="border-2 border-purple-200 rounded-xl px-4 py-6"
                            />
                            <div className="flex gap-2">
                                <Button className="flex-1 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl">
                                    <Send className="w-4 h-4 mr-2" />
                                    전송
                                </Button>
                                <Button
                                    onClick={() => setShowAIChat(true)}
                                    className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl p-0 flex items-center justify-center"
                                >
                                    AI
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-4 text-center text-sm text-purple-400 bg-white/50 backdrop-blur-sm border-t border-purple-200">
                © 2025 STUDYMON. All rights reserved.
            </footer>

            {/* AI 채팅 */}
            {showAIChat && <AiChatPage onClose={() => setShowAIChat(false)} />}
        </div>
    );
}

function BattleParticipantCard({ participant, onDrowsinessDetected }: { participant: any; onDrowsinessDetected?: (result: string) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // 웹캠 시작
    useEffect(() => {
        if (participant.isMe) {
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: false })
                .then((mediaStream) => {
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                })
                .catch((err) => {
                    console.error("웹캠 접근 실패:", err);
                });
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [participant.isMe]);

    // 졸음 감지 루프 (WebcamGrid와 동일한 로직)
    useEffect(() => {
        if (!participant.isMe || !onDrowsinessDetected) return;

        const interval = setInterval(async () => {
            if (!videoRef.current || !stream) return;

            try {
                const canvas = document.createElement("canvas");
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                const ctx = canvas.getContext("2d");
                if (!ctx) return;

                ctx.drawImage(videoRef.current, 0, 0);

                canvas.toBlob(async (blob) => {
                    if (!blob) return;

                    const formData = new FormData();
                    formData.append("file", blob, "capture.jpg");

                    try {
                        const res = await fetch("http://localhost:8000/api/drowsiness/detect", {
                            method: "POST",
                            body: formData,
                        });

                        if (res.ok) {
                            const data = await res.json();
                            onDrowsinessDetected(data.result);
                        }
                    } catch (err) {
                        console.error("Drowsiness detection failed:", err);
                    }
                }, "image/jpeg", 0.8);
            } catch (e) {
                console.error("Frame capture error:", e);
            }
        }, 1000); // 1초마다 감지

        return () => clearInterval(interval);
    }, [participant.isMe, onDrowsinessDetected, stream]);

    return (
        <Card
            className="relative p-4 bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500 rounded-2xl border-none shadow-lg overflow-hidden aspect-video flex flex-col items-center justify-center"
        >
            {participant.isMe ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
            ) : (
                <>
                    {/* 배경 장식 */}
                    <div className="absolute top-4 right-4 text-6xl opacity-20 animate-pulse">
                        {participant.emoji}
                    </div>

                    <div className="relative z-10 w-full flex flex-col items-center">
                        {/* 이모지 */}
                        <div className="text-6xl mb-4 text-center drop-shadow-lg">
                            {participant.emoji}
                        </div>

                        {/* 비디오 아이콘 */}
                        <div className="flex justify-center mb-3">
                            <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Video className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* 사용자 이름 (항상 표시) */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 w-full text-center">
                <div className="px-4 py-2 bg-purple-600/50 backdrop-blur-sm rounded-full text-white inline-block font-semibold shadow-md">
                    {participant.name}
                </div>
            </div>

            {/* 온라인 상태 */}
            {participant.online && (
                <div className="absolute bottom-4 right-4 z-20">
                    <div className="w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                </div>
            )}
        </Card>
    );
}
