import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useUser } from "./UserContext";
import bg from "../assets/bg.png";
import expoke from "../assets/expoke.png";
import pokecard from "../assets/pokecard.png";

interface Pokemon {
    id: number;
    name: string;
    koreanName: string;
    imageUrl: string;
    attributes: [string, string];
}

const allPokemonList: Pokemon[] = [
    {
        id: 1,
        name: "Pikachu",
        koreanName: "피카츄",
        imageUrl: expoke,
        attributes: ["전기", "민첩"],
    },
    {
        id: 2,
        name: "Charmander",
        koreanName: "파이리",
        imageUrl: expoke,
        attributes: ["불꽃", "열정"],
    },
    {
        id: 3,
        name: "Squirtle",
        koreanName: "꼬부기",
        imageUrl: expoke,
        attributes: ["물", "방어"],
    },
    {
        id: 4,
        name: "Bulbasaur",
        koreanName: "이상해씨",
        imageUrl: expoke,
        attributes: ["풀", "균형"],
    },
    {
        id: 5,
        name: "Jigglypuff",
        koreanName: "푸린",
        imageUrl: expoke,
        attributes: ["노멀", "멜로디"],
    },
    {
        id: 6,
        name: "Eevee",
        koreanName: "이브이",
        imageUrl: expoke,
        attributes: ["적응", "다재다능"],
    },
    {
        id: 7,
        name: "Meowth",
        koreanName: "나옹",
        imageUrl: expoke,
        attributes: ["노멀", "민첩"],
    },
    {
        id: 8,
        name: "Snorlax",
        koreanName: "잠만보",
        imageUrl: expoke,
        attributes: ["노멀", "인내"],
    },
];

// 랜덤으로 4개의 포켓몬 선택하는 함수
const getRandomPokemon = (): Pokemon[] => {
    const shuffled = [...allPokemonList].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
};

interface CreatePokemonProps {
    onBack?: () => void;
}

export function CreatePokemon({ onBack }: CreatePokemonProps) {
    const { setPokemon } = useUser();
    const [displayedPokemon, setDisplayedPokemon] = useState<Pokemon[]>(() => getRandomPokemon());
    const [selectedPokemon, setSelectedPokemon] = useState<number | null>(null);
    const [refreshCount, setRefreshCount] = useState(0);
    const maxRefresh = 1;

    const handleRefresh = () => {
        if (refreshCount < maxRefresh) {
            setSelectedPokemon(null);
            setDisplayedPokemon(getRandomPokemon());
            setRefreshCount(refreshCount + 1);
        }
    };

    const handleCreatePokemon = () => {
        if (selectedPokemon !== null) {
            const pokemon = displayedPokemon.find(p => p.id === selectedPokemon);
            alert(`${pokemon?.koreanName}을(를) 학습 파트너로 선택했습니다!`);
            // Pokemon 선택 완료 - hasPokemon을 true로 설정
            setPokemon(true);
            // 선택 후 뒤로 가기 (Pokemon landing page로 이동)
            if (onBack) {
                onBack();
            }
        } else {
            alert("포켓몬을 먼저 선택해주세요!");
        }
    };

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center p-4"
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="w-full max-w-5xl flex flex-col items-center gap-8">
                {/* 상단 제목 영역 */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-bold">
                        내 포켓몬 만들기
                    </h1>
                    <p className="text-purple-500 text-sm">
                        당신의 학습 파트너가 될 포켓몬을 선택하세요!
                    </p>
                </div>

                {/* 포켓몬 카드 영역 */}
                <div className="grid grid-cols-4 gap-4 w-full">
                    {displayedPokemon.map((pokemon) => (
                        <button
                            key={pokemon.id}
                            onClick={() => setSelectedPokemon(pokemon.id)}
                            className={`group relative w-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden ${
                                selectedPokemon === pokemon.id
                                    ? "ring-4 ring-purple-500 shadow-purple-300"
                                    : ""
                            }`}
                            style={{
                                backgroundImage: `url(${pokecard})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                aspectRatio: "768 / 1045",
                            }}
                        >
                            <div className="absolute inset-0 p-4 flex flex-col">
                                <div className="flex-1 flex items-center justify-center">
                                    <ImageWithFallback
                                        src={pokemon.imageUrl}
                                        alt={pokemon.koreanName}
                                        className="max-h-full max-w-full object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.25)]"
                                    />
                                </div>
                                <div className="pt-3 space-y-3 font-semibold text-slate-700 text-sm">
                                    <div className="leading-snug text-right">No. {String(pokemon.id).padStart(3, "0")}</div>
                                    <div className="leading-snug text-right">{pokemon.koreanName}</div>
                                    <div className="leading-snug text-right">
                                        {pokemon.attributes.join(", ")}
                                    </div>
                                </div>
                            </div>
                            {selectedPokemon === pokemon.id && (
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg">
                                    
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* 하단 버튼 영역 */}
                <div className="flex gap-3 flex-wrap justify-center">
                    <button
                        onClick={handleCreatePokemon}
                        disabled={selectedPokemon === null}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 text-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        내 포켓몬 만들기
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshCount >= maxRefresh}
                        className="px-6 py-3 bg-white/80 backdrop-blur-sm text-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 text-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        새로고침 ({refreshCount}/{maxRefresh})
                    </button>
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm"
                        >
                            뒤로 가기
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
