import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { usePage } from "./PageContext";
import { AiChatPage } from "./AiChatPage";
import logo from "../assets/logo.png";
import exitImg from "../assets/exit.png";
import bg from "../assets/bg.png";
import battleLogo from "../assets/battlelogo.png";
import battleZoneBg from "../assets/zone.png";
import expoke from "../assets/expoke.png";
import { WebcamGrid } from "./WebcamGrid";
import { RightPanel } from "./RightPanel";

export function BattleAcceptStudyRoom() {
    const { setCurrentPage } = usePage();
    const [showAIChat, setShowAIChat] = useState(false);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
            <header
                className="w-full bg-white/80 backdrop-blur-sm border-b border-blue-100"
                style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }}
            >
                <div className="w-full px-6 py-4 flex items-center justify-between">
                    <div className="w-12" />
                    <img src={logo} alt="STUDYMON" className="h-12 w-auto drop-shadow" />
                    <button onClick={() => setCurrentPage('home')} className="flex justify-center">
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
                        <div className="col-span-3 w-full overflow-visible">
                            <div className="h-full bg-gradient-to-br from-white via-white to-blue-50/40 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100/70 p-4 flex flex-col space-y-4">
                                <div className="text-center flex flex-col items-center space-y-2">
                                    <img src={battleLogo} alt="Battle Zone" className="h-20 w-auto drop-shadow" />
                                    
                                </div>

                                <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                                    <div className="flex items-center gap-3 bg-white/85 rounded-xl p-3 border border-blue-100 shadow-sm">
                                        <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center overflow-hidden">
                                            <ImageWithFallback
                                                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
                                                alt="포켓몬"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="text-sm">
                                            <div className="font-bold text-gray-800">상대방 닉네임</div>
                                            <div className="text-gray-600">스터디몬: 피카츄</div>
                                            <div className="text-gray-600">타입: 전기</div>
                                            <div className="text-gray-600">LEVEL: 3</div>
                                            <div className="text-gray-600">EXP: 1200</div>
                                        </div>
                                    </div>

                                    <div className="relative w-full" style={{ aspectRatio: "1032 / 701" }}>
                                        <img
                                            src={battleZoneBg}
                                            alt="Battle field"
                                            className="absolute inset-0 w-full h-full object-contain"
                                        />
                                        {(() => {
                                            // 배경 이미지 좌표계 (필요 시 원본 크기로 맞춰주세요)
                                            const BG_WIDTH = 6792;
                                            const BG_HEIGHT = 4772;
                                            const toPercent = (x: number, y: number) => ({
                                                left: `${(x / BG_WIDTH) * 100}%`,
                                                top: `${(y / BG_HEIGHT) * 100}%`,
                                            });

                                            // 좌표는 배경 이미지 원본 기준(6792x4772). spritePos, hpPos를 각각 원하는 좌표로 수정하세요.
                                            const overlays = {
                                                p1: {
                                                    spritePos: toPercent(4821, 2213),
                                                    hpPos: toPercent(4700, 1200),
                                                    hpWidth: 40000,
                                                    hpFill: 70,
                                                    sprite: expoke,
                                                },
                                                p2: {
                                                    spritePos: toPercent(1591, 4138),
                                                    hpPos: toPercent(3900, 4138),
                                                    hpWidth: 40000,
                                                    hpFill: 43,
                                                    hpText: "43/90",
                                                    sprite: expoke,
                                                },
                                                vs: {
                                                    pos: toPercent(1500, 2213),
                                                },
                                            };

                                            return (
                                                <>
                                                    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ ...overlays.p1.spritePos }}>
                                                        <img src={overlays.p1.sprite} alt="p1" className="w-14 h-14 object-contain drop-shadow" />
                                                    </div>
                                                    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ ...overlays.p1.hpPos }}>
                                                        <div style={{ width: "200px" }}>
                                                            <div className="text-xs mb-1 font-bold text-blue-800">HP</div>
                                                            <div className="h-3 bg-white rounded-full overflow-hidden border border-blue-300">
                                                                <div className="h-full bg-red-500" style={{ width: `${overlays.p1.hpFill}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div
                                                        className="absolute -translate-x-1/2 -translate-y-1/2"
                                                        style={{ ...overlays.p2.spritePos }}
                                                    >
                                                        <img src={overlays.p2.sprite} alt="p2" className="w-14 h-14 object-contain drop-shadow" />
                                                    </div>
                                                    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ ...overlays.p2.hpPos }}>
                                                        <div style={{ width: "200px" }}>
                                                            <div className="text-xs mb-1 font-bold text-blue-800">HP</div>
                                                            <div className="h-3 bg-white rounded-full overflow-hidden border border-blue-300">
                                                                <div className="h-full bg-red-500" style={{ width: `${overlays.p2.hpFill}%` }}></div>
                                                            </div>
                                                            <div className="text-xs text-right font-mono text-blue-900">{overlays.p2.hpText}</div>
                                                        </div>
                                                    </div>

                                                    <div
                                                        className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl text-blue-800 font-black italic"
                                                        style={{ left: overlays.vs.pos.left, top: overlays.vs.pos.top }}
                                                    >
                                                        VS
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" className="rounded-xl border-2 border-blue-100 bg-white hover:bg-blue-50 text-xs text-blue-700 py-7">
                                            100만볼트
                                        </Button>
                                        <Button variant="outline" className="rounded-xl border-2 border-blue-100 bg-white hover:bg-blue-50 text-xs text-blue-700 py-7">
                                            전광석화
                                        </Button>
                                        <Button variant="outline" className="rounded-xl border-2 border-blue-100 bg-white hover:bg-blue-50 text-xs text-blue-700 py-7">
                                            아이언테일
                                        </Button>
                                        <Button variant="outline" className="rounded-xl border-2 border-blue-100 bg-white hover:bg-blue-50 text-xs text-blue-700 py-7">
                                            번개
                                        </Button>
                                    </div>

                                    
                                    <div className="flex flex-row-reverse items-center gap-3 bg-white/85 rounded-xl p-3 border border-blue-100 shadow-sm">
                                        <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center overflow-hidden">
                                            <ImageWithFallback
                                                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
                                                alt="포켓몬"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="text-sm text-right">
                                            <div className="font-bold text-gray-800">내 닉네임</div>
                                            <div className="text-gray-600">스터디몬: 피카츄</div>
                                            <div className="text-gray-600">타입: 전기</div>
                                            <div className="text-gray-600">LEVEL: 3</div>
                                            <div className="text-gray-600">EXP: 1200</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center - Webcam & Status (StudyRoom 스타일) */}
                        <div className="col-span-6 flex flex-col gap-3 min-h-0 h-full">
                            <WebcamGrid showBattleRequest={false} onDrowsinessDetected={handleDrowsinessDetected} />

                            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-blue-100 flex-1 flex flex-col min-h-0">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold text-gray-1000 text-3xl">😴 졸음 감지 모니터링</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">누적 졸음 횟수:</span>
                                        <span className={`text-xl font-bold ${drowsinessCount > 5 ? 'text-red-500' : 'text-blue-500'}`}>
                                            {drowsinessCount}회
                                        </span>
                                    </div>
                                </div>
                                <br></br>
                               

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
                                <br></br>
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

            {showAIChat && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="relative w-full max-w-4xl">
                        <AiChatPage variant="modal" onClose={() => setShowAIChat(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
