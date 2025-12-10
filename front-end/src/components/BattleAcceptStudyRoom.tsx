import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
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
import SimpleSFUClient from "../sfu/SimpleSFUClient.js";
import { useRef } from "react";

export function BattleAcceptStudyRoom() {
    const { setCurrentPage } = usePage();
    const [showAIChat, setShowAIChat] = useState(false);
    const [myHp, setMyHp] = useState(100);
    const [opponentHp, setOpponentHp] = useState(100);
    const [battleResult, setBattleResult] = useState<"win" | "lose" | null>(null);

    // 배틀 데이터
    const [battleData, setBattleData] = useState<any>(null);
    const [myMoves, setMyMoves] = useState<any[]>([]);

    // 졸음 감지 상태
    const [drowsinessCount, setDrowsinessCount] = useState(0);
    const [currentState, setCurrentState] = useState<string>("Normal");
    const [lastSleepyDetection, setLastSleepyDetection] = useState<number>(0);
    const [, setDetectionWindow] = useState<string[]>([]);

    // SFU 클라이언트 (웹캠)
    const clientRef = useRef<SimpleSFUClient>();
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const [remoteStreams, setRemoteStreams] = useState<{ id: string; stream: MediaStream; username: string }[]>([]);
    const [isme, setIsme] = useState("");

    // 배틀 데이터 로드
    useEffect(() => {
        const storedData = sessionStorage.getItem('battleData');
        if (storedData) {
            const data = JSON.parse(storedData);
            console.log('[Battle Room] Loaded battle data:', data);
            setBattleData(data);
            setMyMoves(data.myMoves || []);
        }
    }, []);

    // SFU 클라이언트 초기화 (웹캠)
    useEffect(() => {
        if (!battleData) return;

        const client = new SimpleSFUClient({
            username: battleData?.myPokemon?.user_nickname || "Battle User",
            videoContainer: videoContainerRef.current,
        });

        clientRef.current = client;

        client.on("onConnected", () => {
            console.log("[Battle Room] Connected to SFU server!");
            client.connect();
        });

        client.on("onUUIDAssigned", (uuid: any) => {
            setIsme(uuid);
        });

        client.on("onRemoteTrack", ({ id, stream, username }: any) => {
            setRemoteStreams(prev => {
                if (prev.some(s => s.id === id)) return prev;
                return [...prev, { id, stream, username }];
            });
        });

        return () => {
            // Cleanup: disconnect SFU client when leaving battle room
            if (clientRef.current) {
                // clientRef.current.disconnect();
            }
        };
    }, []); // 빈 배열: 한 번만 실행 (battleData는 if 조건으로 체크)

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

    useEffect(() => {
        if (battleResult) return;
        if (myHp <= 0) {
            setBattleResult("lose");
        } else if (opponentHp <= 0) {
            setBattleResult("win");
        }
    }, [myHp, opponentHp, battleResult]);

    useEffect(() => {
        if (!battleResult) return;
        const timer = setTimeout(() => setCurrentPage('studyroom'), 5000);
        return () => clearTimeout(timer);
    }, [battleResult, setCurrentPage]);

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
                                                src={battleData?.opponentPokemon?.poke_id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${battleData.opponentPokemon.poke_id}.png` : "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"}
                                                alt="상대 포켓몬"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="text-sm">
                                            <div className="font-bold text-gray-800">{battleData?.opponentPokemon?.user_nickname || '상대방 닉네임'}</div>
                                            <div className="text-gray-600">스터디몬: {battleData?.opponentPokemon?.name || '피카츄'}</div>
                                            <div className="text-gray-600">타입: {battleData?.opponentPokemon?.type1 || '전기'}{battleData?.opponentPokemon?.type2 ? ` / ${battleData.opponentPokemon.type2}` : ''}</div>
                                            <div className="text-gray-600">LEVEL: {battleData?.opponentPokemon?.level || '?'}</div>
                                            <div className="text-gray-600">EXP: {battleData?.opponentPokemon?.exp || '?'}</div>
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
                                                    hpFill: myHp,
                                                    sprite: expoke,
                                                },
                                                p2: {
                                                    spritePos: toPercent(1591, 4138),
                                                    hpPos: toPercent(3900, 4138),
                                                    hpWidth: 40000,
                                                    hpFill: opponentHp,
                                                    hpText: `${opponentHp}/100`,
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
                                        {myMoves.length > 0 ? (
                                            myMoves.map((move, index) => (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    className="rounded-xl border-2 border-blue-100 bg-white hover:bg-blue-50 text-xs text-blue-700 py-7"
                                                >
                                                    {move.name_ko || move.name} (위력: {move.power})
                                                </Button>
                                            ))
                                        ) : (
                                            <div className="text-gray-500 text-sm">기술 로딩 중...</div>
                                        )}
                                    </div>


                                    <div className="flex flex-row-reverse items-center gap-3 bg-white/85 rounded-xl p-3 border border-blue-100 shadow-sm">
                                        <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center overflow-hidden">
                                            <ImageWithFallback
                                                src={battleData?.myPokemon?.poke_id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${battleData.myPokemon.poke_id}.png` : "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"}
                                                alt="포켓몬"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="text-sm text-right">
                                            <div className="font-bold text-gray-800">{battleData?.myPokemon?.user_nickname || '내 닉네임'}</div>
                                            <div className="text-gray-600">스터디몬: {battleData?.myPokemon?.name || '피카츄'}</div>
                                            <div className="text-gray-600">타입: {battleData?.myPokemon?.type1 || '전기'}{battleData?.myPokemon?.type2 ? ` / ${battleData.myPokemon.type2}` : ''}</div>
                                            <div className="text-gray-600">LEVEL: {battleData?.myPokemon?.level || '?'}</div>
                                            <div className="text-gray-600">EXP: {battleData?.myPokemon?.exp || '?'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center - Webcam & Status (StudyRoom 스타일) */}
                        <div className="col-span-6 flex flex-col gap-3 min-h-0 h-full">
                            <WebcamGrid
                                username={battleData?.myPokemon?.user_nickname || "Battle User"}
                                isme={isme}
                                remoteStreams={remoteStreams}
                                onDrowsinessDetected={handleDrowsinessDetected}
                            />

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

            {battleResult && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center space-y-3">
                        <div className="text-2xl font-bold text-blue-700">
                            {battleResult === "win" ? "배틀 승리!" : "배틀 패배"}
                        </div>
                        <div className="text-gray-700 leading-relaxed">
                            {battleResult === "win"
                                ? "배틀에서 승리하였습니다. 기분 좋게 공부에 집중해볼까요?"
                                : "배틀에서 패배하였습니다. 오늘은 스티디몬이 힘든 것 같아요 ㅠㅠ 공부에 집중해서 스터디몬의 경험치를 높혀주세요!"}
                        </div>
                        <div className="text-sm text-gray-500">5초 후 스터디룸으로 돌아갑니다.</div>
                    </div>
                </div>
            )}
        </div>
    );
}
