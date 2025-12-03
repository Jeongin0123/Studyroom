import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { User, Home, ArrowLeft } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import logoutImg from "../assets/logout.png";
import logo from "../assets/logo.png";
import bg from "../assets/bg.png";
import mycard from "../assets/mycard.png";
import slot1 from "../assets/slot1.png";
import slot2 from "../assets/slot2.png";
import slot3 from "../assets/slot3.png";
import slot4 from "../assets/slot4.png";
import slot5 from "../assets/slot5.png";
import slot6 from "../assets/slot6.png";

interface MyPageProps {
    onHome?: () => void;
    onBack?: () => void;
    onLogout?: () => void;
    onUpdateInfo?: () => void;
}

export function MyPage({ onHome, onBack, onLogout, onUpdateInfo }: MyPageProps) {
    const savedPokemon = [
        { id: 1, locked: true, number: "No.001 어쩌구" },
        { id: 2, locked: false, image: "https://images.unsplash.com/photo-1761727799802-d350597977fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5rJTIwY3V0ZSUyMGNoYXJhY3RlcnxlbnwxfHx8fDE3NjM5NjY5MTB8MA&ixlib=rb-4.1.0&q=80&w=1080", number: "No.002 어쩌구" },
        { id: 3, locked: true, number: "No.003 어쩌구" },
        { id: 4, locked: true, number: "No.001 어쩌구" },
        { id: 5, locked: false, image: "https://images.unsplash.com/photo-1761727799802-d350597977fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5rJTIwY3V0ZSUyMGNoYXJhY3RlcnxlbnwxfHx8fDE3NjM5NjY5MTB8MA&ixlib=rb-4.1.0&q=80&w=1080", number: "No.002 어쩌구" },
        { id: 6, locked: true, number: "No.001 어쩌구" },
        { id: 7, locked: true, number: "No.002 어쩌구" },
        { id: 8, locked: true, number: "No.001 어쩌구" },
        { id: 9, locked: true, number: "No.002 어쩌구" },
        { id: 10, locked: true, number: "No.001 어쩌구" },
        { id: 11, locked: false, image: "https://images.unsplash.com/photo-1761727799802-d350597977fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5rJTIwY3V0ZSUyMGNoYXJhY3RlcnxlbnwxfHx8fDE3NjM5NjY5MTB8MA&ixlib=rb-4.1.0&q=80&w=1080", number: "No.002 어쩌구" },
        { id: 12, locked: true, number: "No.001 어쩌구" },
        { id: 13, locked: true, number: "No.002 어쩌구" },
        { id: 14, locked: true, number: "No.001 어쩌구" },
        { id: 15, locked: true, number: "No.002 어쩌구" },
        { id: 16, locked: true, number: "No.001 어쩌구" },
        { id: 17, locked: false, image: "https://images.unsplash.com/photo-1761727799802-d350597977fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5rJTIwY3V0ZSUyMGNoYXJhY3RlcnxlbnwxfHx8fDE3NjM5NjY5MTB8MA&ixlib=rb-4.1.0&q=80&w=1080", number: "No.002 어쩌구" },
        { id: 18, locked: true, number: "No.001 어쩌구" },
        { id: 19, locked: true, number: "No.002 어쩌구" },
        { id: 20, locked: true, number: "No.001 어쩌구" },
        { id: 21, locked: false, image: "https://images.unsplash.com/photo-1761727799802-d350597977fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5rJTIwY3V0ZSUyMGNoYXJhY3RlcnxlbnwxfHx8fDE3NjM5NjY5MTB8MA&ixlib=rb-4.1.0&q=80&w=1080", number: "No.002 어쩌구" },
        { id: 22, locked: true, number: "No.001 어쩌구" },
        { id: 23, locked: true, number: "No.002 어쩌구" },
        { id: 24, locked: true, number: "No.001 어쩌구" },
    ];

    const studyTeamSlots = [
        { id: 1, src: slot1, label: "Slot 1" },
        { id: 2, src: slot2, label: "Slot 2" },
        { id: 3, src: slot3, label: "Slot 3" },
        { id: 4, src: slot4, label: "Slot 4" },
        { id: 5, src: slot5, label: "Slot 5" },
        { id: 6, src: slot6, label: "Slot 6" },
    ];

    const weeklyData = [
        { day: "T", avg: 2, you: 1 },
        { day: "F", avg: 3, you: 4 },
        { day: "S", avg: 4, you: 3 },
        { day: "S", avg: 3, you: 5 },
        { day: "M", avg: 2, you: 2 },
        { day: "T", avg: 3, you: 3 },
        { day: "W", avg: 3, you: 2 },
    ];

    const cardData = {
        id: "000123",
        nickname: "피카츄트레이너",
        email: "trainer@studymon.com",
        exp: "12,340",
        streakDays: 12,
        totalHours: "142h 7m",
        trainerRank: "245등",
        weekly: weeklyData,
    };

    const cardSize = { width: 2057, height: 2816 }; // mycard.png 원본 사이즈
    const cardCoords = {
        id: { x: 1546, y: 220 },
        nickname: { x: 295, y: 500 },
        email: { x: 295, y: 750 },
        exp: { x: 295, y: 1007 },
        graph: { x: 240, y: 1200, width: 1700, height: 700 },
        achievements: {
            streak: { x: 956, y: 2400 },
            total: { x: 1363, y: 2464 },
            rank: { x: 1759, y: 2464 },
        },
    };

    const pct = (value: number, total: number) => `${(value / total) * 100}%`;

    return (
        <div
            className="relative min-h-screen"
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

            {/* 플로팅 컨트롤 & 로고 (랜딩 헤더 위치와 통일) */}
            <div className="absolute top-6 left-0 right-0 px-6 z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full border-2 border-purple-300 shadow-lg hover:bg-white hover:scale-110 transition-all flex items-center justify-center group"
                        onClick={onHome}
                    >
                        <Home className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                    </button>
                    <button
                        className="w-12 h-12 bg-white/70 backdrop-blur-sm rounded-full border-2 border-purple-200 shadow-md hover:bg-white hover:scale-105 transition-all flex items-center justify-center group"
                        onClick={onBack}
                    >
                        <ArrowLeft className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                    </button>
                </div>

                <img src={logo} alt="STUDYMON" className="h-14 w-auto drop-shadow-lg" />

                <button
                    className="bg-transparent hover:opacity-90 transition"
                    onClick={onLogout}
                >
                    <img src={logoutImg} alt="Logout" className="h-12 w-auto" />
                </button>
            </div>

            <main className="relative z-10 container mx-auto px-6 pt-24 pb-8">
                <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(400px, 2fr)' }}>
                    {/* Left Section - Profile */}
                    <div>
                        <h2 className="text-purple-700 mb-4">내 정보</h2>

                        {/* 트레이너 카드 (mycard.png 오버레이) */}
                        <div
                            className="relative w-full max-w-2xl mx-auto mb-6 rounded-xl overflow-hidden shadow-xl"
                            style={{
                                backgroundImage: `url(${mycard})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                aspectRatio: "768 / 1051",
                            }}
                        >
                            {/* ID (ID No. 우측) */}
                            <div
                                className="absolute text-lg font-bold text-gray-900 tracking-wide"
                                style={{
                                    left: pct(cardCoords.id.x, cardSize.width),
                                    top: pct(cardCoords.id.y, cardSize.height),
                                }}
                            >
                                {cardData.id}
                            </div>

                            {/* Basic info (좌측 초록 네모 라인과 정렬) */}
                            <div
                                className="absolute text-sm font-semibold text-gray-900 space-y-4"
                                style={{
                                    left: pct(cardCoords.nickname.x, cardSize.width),
                                    top: pct(cardCoords.nickname.y, cardSize.height),
                                }}
                            >
                                <div className="leading-tight">NICKNAME: {cardData.nickname}</div>
                                <div className="leading-tight" style={{ marginTop: "20px" }}>EMAIL: {cardData.email}</div>
                                <div className="leading-tight" style={{ marginTop: "20px" }}>EXP: {cardData.exp}</div>
                            </div>

                            {/* Weekly chart overlay */}
                            <div
                                className="absolute"
                                style={{
                                    left: pct(cardCoords.graph.x, cardSize.width),
                                    top: pct(cardCoords.graph.y, cardSize.height),
                                    width: pct(cardCoords.graph.width, cardSize.width),
                                    height: pct(cardCoords.graph.height, cardSize.height),
                                }}
                            >
                                <svg className="w-full h-full" viewBox="0 0 280 120" preserveAspectRatio="none">
                                    <polyline
                                        points={cardData.weekly
                                            .map((d, i) => `${40 * i + 20},${110 - d.avg * 6}`)
                                            .join(" ")}
                                        fill="none"
                                        stroke="#555"
                                        strokeWidth="2"
                                    />
                                    {cardData.weekly.map((d, i) => (
                                        <circle
                                            key={`avg-${i}`}
                                            cx={40 * i + 20}
                                            cy={110 - d.avg * 6}
                                            r="3"
                                            fill="#555"
                                        />
                                    ))}

                                    <polyline
                                        points={cardData.weekly
                                            .map((d, i) => `${40 * i + 20},${110 - d.you * 6}`)
                                            .join(" ")}
                                        fill="none"
                                        stroke="#a855f7"
                                        strokeWidth="2"
                                    />
                                    {cardData.weekly.map((d, i) => (
                                        <circle
                                            key={`you-${i}`}
                                            cx={40 * i + 20}
                                            cy={110 - d.you * 6}
                                            r="3"
                                            fill="#a855f7"
                                        />
                                    ))}
                                </svg>
                            </div>

                            {/* Achievements row (하단 흰색 두 줄 사이) */}
                            <div
                                className="absolute left-0 right-0 text-xs font-semibold text-gray-900"
                                style={{
                                    top: pct(cardCoords.achievements.streak.y, cardSize.height),
                                }}
                            >
                                <div className="relative w-full">
                                    <div
                                        className="absolute text-center"
                                        style={{
                                            left: pct(cardCoords.achievements.streak.x, cardSize.width),
                                            transform: "translateX(-50%)",
                                        }}
                                    >
                                        <div className="mb-1">연속 학습 일수</div>
                                        <div className="text-base">{cardData.streakDays}일</div>
                                    </div>
                                    <div
                                        className="absolute text-center"
                                        style={{
                                            left: pct(cardCoords.achievements.total.x, cardSize.width),
                                            transform: "translateX(-50%)",
                                        }}
                                    >
                                        <div className="mb-1">누적 공부 시간</div>
                                        <div className="text-base">{cardData.totalHours}</div>
                                    </div>
                                    <div
                                        className="absolute text-center"
                                        style={{
                                            left: pct(cardCoords.achievements.rank.x, cardSize.width),
                                            transform: "translateX(-50%)",
                                        }}
                                    >
                                        <div className="mb-1">트레이너 등수</div>
                                        <div className="text-base">{cardData.trainerRank}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Section - My Pokemon */}
                    <div>
                        <h2 className="text-purple-700 mb-2">내 스터디팀</h2>
                        <div className="grid grid-cols-3 gap-x-3 gap-y-1">
                            {studyTeamSlots.map((slot) => (
                                <div
                                    key={slot.id}
                                    className="w-full flex flex-col items-center"
                                    style={{ aspectRatio: "1" }}
                                >
                                    <img
                                        src={slot.src}
                                        alt={slot.label}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="mt-3 text-sm font-bold text-purple-700 text-center">
                            내 스터디몬 도감에서 데려갈 수 있는 스터디몬은 최대 6명입니다! 드래그 앤 드롭을 통해 데려오고, 다시 저장할 수 있어요!
                        </p>
                    </div>
                </div>

                {/* Saved Pokemon Section */}
                <div>
                    <h2 className="text-purple-700 mb-4">내 스터디몬 도감</h2>
                    <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border border-purple-200">
                        <div className="grid grid-cols-8 gap-3">
                            {savedPokemon.map((pokemon) => (
                                <Card
                                    key={pokemon.id}
                                    className={`aspect-square p-3 rounded-xl ${pokemon.locked
                                        ? "bg-gray-200 border-gray-300"
                                        : "bg-gradient-to-br from-pink-100 to-purple-100 border-pink-300 border-2"
                                        } flex flex-col items-center justify-center`}
                                >
                                    {pokemon.locked ? (
                                        <div className="text-center">
                                            <div className="text-2xl mb-1">🔒</div>
                                            <p className="text-[10px] text-gray-600">{pokemon.number}</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="w-full aspect-square bg-white rounded-lg mb-1 overflow-hidden">
                                                <ImageWithFallback
                                                    src={pokemon.image!}
                                                    alt={pokemon.number}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <p className="text-[10px] text-center text-purple-700">{pokemon.number}</p>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </Card>
                </div>
            </main>

        </div>
    );
}
