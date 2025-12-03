import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { User, Home, ArrowLeft } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import logoutImg from "../assets/logout.png";
import logo from "../assets/logo.png";
import bg from "../assets/bg.png";

interface MyPageProps {
    onHome?: () => void;
    onBack?: () => void;
    onLogout?: () => void;
    onUpdateInfo?: () => void;
}

export function MyPage({ onHome, onBack, onLogout, onUpdateInfo }: MyPageProps) {
    const myPokemon = [
        { id: 1, name: "스터디몬 자세 카드", image: "https://images.unsplash.com/photo-1636391671189-b74857c38626?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmFnb24lMjBwb2tlbW9ufGVufDF8fHx8MTc2Mzk2NjkxMHww&ixlib=rb-4.1.0&q=80&w=1080" },
        { id: 2, name: "스터디몬 자세 카드", image: "https://images.unsplash.com/photo-1636391671189-b74857c38626?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmFnb24lMjBwb2tlbW9ufGVufDF8fHx8MTc2Mzk2NjkxMHww&ixlib=rb-4.1.0&q=80&w=1080" },
        { id: 3, name: "스터디몬 자세 카드", image: "https://images.unsplash.com/photo-1636391671189-b74857c38626?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmFnb24lMjBwb2tlbW9ufGVufDF8fHx8MTc2Mzk2NjkxMHww&ixlib=rb-4.1.0&q=80&w=1080" },
        { id: 4, name: "스터디몬 자세 카드", image: "https://images.unsplash.com/photo-1636391671189-b74857c38626?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmFnb24lMjBwb2tlbW9ufGVufDF8fHx8MTc2Mzk2NjkxMHww&ixlib=rb-4.1.0&q=80&w=1080" },
        { id: 5, name: "스터디몬 자세 카드", image: "https://images.unsplash.com/photo-1636391671189-b74857c38626?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmFnb24lMjBwb2tlbW9ufGVufDF8fHx8MTc2Mzk2NjkxMHww&ixlib=rb-4.1.0&q=80&w=1080" },
        { id: 6, name: "스터디몬 자세 카드", image: "https://images.unsplash.com/photo-1636391671189-b74857c38626?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmFnb24lMjBwb2tlbW9ufGVufDF8fHx8MTc2Mzk2NjkxMHww&ixlib=rb-4.1.0&q=80&w=1080" },
    ];

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

    const weeklyData = [
        { day: "T", avg: 2, you: 1 },
        { day: "F", avg: 3, you: 4 },
        { day: "S", avg: 4, you: 3 },
        { day: "S", avg: 3, you: 5 },
        { day: "M", avg: 2, you: 2 },
        { day: "T", avg: 3, you: 3 },
        { day: "W", avg: 3, you: 2 },
    ];

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
                        <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border border-purple-200">
                            {/* Profile */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-20 h-20 bg-gray-200 rounded-3xl flex items-center justify-center">
                                    <User className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-purple-700">닉네임/닉네임</h3>
                                    <p className="text-sm text-gray-500">아이디 :</p>
                                    <p className="text-sm text-gray-500">이름 :</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full border-purple-300 text-purple-600 hover:bg-purple-50"
                                    onClick={onUpdateInfo}
                                >
                                    정보수정
                                </Button>
                            </div>

                            {/* Weekly Progress */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm text-purple-700">WEEKLY PROGRESS</h4>
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 bg-gray-800 rounded-full"></span>
                                            AVG
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                            YOU
                                        </span>
                                    </div>
                                </div>

                                {/* Chart */}
                                <div className="relative h-32 mb-2">
                                    <svg className="w-full h-full" viewBox="0 0 280 120">
                                        {/* Grid lines */}
                                        {[0, 1, 2, 3, 4, 5].map((i) => (
                                            <line
                                                key={i}
                                                x1="0"
                                                y1={20 + i * 20}
                                                x2="280"
                                                y2={20 + i * 20}
                                                stroke="#e5e7eb"
                                                strokeWidth="1"
                                            />
                                        ))}

                                        {/* AVG line */}
                                        <polyline
                                            points={weeklyData
                                                .map((d, i) => `${40 * i + 20},${100 - d.avg * 20}`)
                                                .join(" ")}
                                            fill="none"
                                            stroke="#1f2937"
                                            strokeWidth="2"
                                        />
                                        {weeklyData.map((d, i) => (
                                            <circle
                                                key={`avg-${i}`}
                                                cx={40 * i + 20}
                                                cy={100 - d.avg * 20}
                                                r="3"
                                                fill="#1f2937"
                                            />
                                        ))}

                                        {/* YOU line */}
                                        <polyline
                                            points={weeklyData
                                                .map((d, i) => `${40 * i + 20},${100 - d.you * 20}`)
                                                .join(" ")}
                                            fill="none"
                                            stroke="#a855f7"
                                            strokeWidth="2"
                                        />
                                        {weeklyData.map((d, i) => (
                                            <circle
                                                key={`you-${i}`}
                                                cx={40 * i + 20}
                                                cy={100 - d.you * 20}
                                                r="3"
                                                fill="#a855f7"
                                            />
                                        ))}
                                    </svg>
                                </div>

                                {/* Days labels */}
                                <div className="flex justify-around text-xs text-gray-600">
                                    {weeklyData.map((d, i) => (
                                        <span key={i}>{d.day}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-4 pt-4 border-t border-purple-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🔥</span>
                                    <div>
                                        <p className="text-xs text-gray-500">0 days</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">⏱️</span>
                                    <div>
                                        <p className="text-xs text-gray-500">누적 93시간</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🏆</span>
                                    <div>
                                        <p className="text-xs text-gray-500">983 등</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Section - My Pokemon */}
                    <div>
                        <h2 className="text-purple-700 mb-4">내 스터디팀</h2>
                        <div className="grid grid-cols-3 gap-3">
                            {myPokemon.map((pokemon) => (
                                <Card
                                    key={pokemon.id}
                                    className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 shadow-md rounded-2xl border-2 border-gray-300 hover:shadow-lg transition-shadow"
                                >
                                    <div className="aspect-square bg-white rounded-xl mb-3 overflow-hidden">
                                        <ImageWithFallback
                                            src={pokemon.image}
                                            alt={pokemon.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <p className="text-center text-xs text-gray-700">{pokemon.name}</p>
                                </Card>
                            ))}
                        </div>
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
