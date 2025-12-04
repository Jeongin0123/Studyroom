import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useState, useEffect, useRef } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { usePage } from "./PageContext";
import { AiChatPage } from "./AiChatPage";
import logo from "../assets/logo.png";
import exitImg from "../assets/exit.png";
import bg from "../assets/bg.png";
import { WebcamGrid } from "./WebcamGrid";
import { RightPanel } from "./RightPanel";

export function BattleAcceptStudyRoom() {
    const { setCurrentPage } = usePage();
    const [showAIChat, setShowAIChat] = useState(false);
    const [pokemonMessages] = useState<{ id: number; text: string; speaker: string }[]>([
        { id: 1, text: "지켜보고 있어! 집중!", speaker: "피카츄" },
        { id: 2, text: "물 한 잔 마시고 다시 달리자!", speaker: "꼬부기" },
        { id: 3, text: "오늘도 파이팅이야!", speaker: "파이리" },
    ]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // 졸음 감지 상태
    const [drowsinessCount, setDrowsinessCount] = useState(0);
    const [currentState, setCurrentState] = useState<string>("Normal");
    const [lastSleepyDetection, setLastSleepyDetection] = useState<number>(0);
    const [, setDetectionWindow] = useState<string[]>([]);

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
                        // 백엔드 API 호출하여 졸음 횟수 증가
                        // TODO: 실제 user_id 사용 (현재는 하드코딩)
                        const userId = 1; // 임시 user_id

                        fetch(`http://localhost:8000/api/drowsiness/increment/${userId}`, {
                            method: 'POST',
                        })
                            .then(res => res.json())
                            .then(data => {
                                console.log(`[졸음 감지] ⚠️ 졸음 횟수 증가!`, data);
                                setDrowsinessCount(data.drowsiness_count);
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

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [pokemonMessages]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
            <header
                className="w-full bg-white/80 backdrop-blur-sm border-b border-blue-100"
                style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }}
            >
                <div className="w-full px-6 py-4 flex items-center justify-between">
                    <div className="w-12" />
                    <img src={logo} alt="STUDYMON" className="h-12 w-auto drop-shadow" />
                    <button onClick={() => setCurrentPage('studyroom')} className="flex justify-center">
                        <img
                            src={exitImg}
                            alt="퇴장하기"
                            className="h-12 w-auto hover:scale-[1.02] transition-transform"
                        />
                    </button>
                </div>
            </header>

            <main className="w-full px-2 pb-0 flex-1 pt-2">
                <div className="w-full rounded-2xl bg-white/85 backdrop-blur-sm border border-blue-100 shadow-lg p-3 h-full flex flex-col">
                    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-170px)]">
                        {/* Left Sidebar */}
                        <div className="col-span-3 w-full space-y-4 overflow-y-auto">
                    {/* 배틀존 타이틀 */}
                    <Card className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-blue-200">
                        <div className="text-center mb-3 font-bold text-blue-800">
                            <span className="text-xl">⚡⚡⚡</span>
                            <span className="mx-2">배틀존</span>
                            <span className="text-xl">⚡⚡⚡</span>
                        </div>
                    </Card>

                    {/* 내 포켓몬 */}
                    <Card className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-blue-200">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center overflow-hidden">
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

                    <Card className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-blue-200">
                        <div className="text-center mb-2 font-bold text-blue-800">Battle Time !</div>
                        <Button className="w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 rounded-full">
                            회복하기
                        </Button>
                    </Card>
                </div>

                        {/* Center - Webcam & Status (StudyRoom 스타일) */}
                        <div className="col-span-6 flex flex-col gap-3 min-h-0 h-full">
                            <WebcamGrid onBattleRequest={() => { }} onDrowsinessDetected={handleDrowsinessDetected} />

                            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-blue-100 flex-1 flex flex-col min-h-0">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold text-gray-700">😴 졸음 감지 모니터링</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">누적 졸음 횟수:</span>
                                        <span className={`text-xl font-bold ${drowsinessCount > 5 ? 'text-red-500' : 'text-blue-500'}`}>
                                            {drowsinessCount}회
                                        </span>
                                    </div>
                                </div>

                                {/* 현재 상태 표시 */}
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                                    <span className="text-sm font-medium text-gray-600">현재 상태:</span>
                                    <div className={`px-4 py-1.5 rounded-full font-bold text-sm ${currentState === "Normal"
                                        ? "bg-green-100 text-green-700"
                                        : currentState === "Yawn"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-red-100 text-red-700"
                                        }`}>
                                        {currentState === "Normal" && "😊 정상"}
                                        {currentState === "Yawn" && "🥱 하품"}
                                        {currentState === "Sleepy" && "😴 졸림 감지!"}
                                    </div>
                                </div>

                                <p className="mt-3 text-sm text-blue-600 font-semibold">스터디몬이 지켜보고 있어요! 오늘도 파이팅! 🔥</p>

                                <div className="mt-2 flex items-center gap-3">
                                    <div className="text-blue-600 font-bold text-sm">열심히 공부 중입니다!</div>
                                    <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-blue-200">
                                        <ImageWithFallback
                                            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
                                            alt="포켓몬"
                                            className="w-full h-full object-contain bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="mt-3 bg-white/80 border border-blue-100 rounded-xl p-3 h-40 overflow-y-auto space-y-2 shadow-inner">
                                    {pokemonMessages.map((msg) => (
                                        <div key={msg.id} className="flex items-start gap-2">
                                            <div className="text-xs font-semibold text-blue-600 min-w-[52px]">{msg.speaker}</div>
                                            <div className="flex-1 bg-blue-50 rounded-2xl px-3 py-2 shadow-sm text-sm text-gray-700 border border-blue-100">
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="col-span-3 flex flex-col min-h-0">
                            <Card className="h-full p-0 bg-transparent border-none shadow-none">
                                <RightPanel onOpenAiChat={() => setShowAIChat(true)} />
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            {/* AI 채팅 */}
            {showAIChat && <AiChatPage onClose={() => setShowAIChat(false)} />}
        </div>
    );
}
