import { useState, useEffect } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useUser } from "./UserContext";
import bg from "../assets/bg.png";
import pokecard from "../assets/pokecard.png";

interface Pokemon {
    poke_id: number;
    name: string;
    type1: string;
    type2: string | null;
}

interface CreatePokemonProps {
    onBack?: () => void;
}

export function CreatePokemon({ onBack }: CreatePokemonProps) {
    const { user, setPokemon } = useUser();
    const [displayedPokemon, setDisplayedPokemon] = useState<Pokemon[]>([]);
    const [selectedPokemon, setSelectedPokemon] = useState<number | null>(null);
    const [refreshCount, setRefreshCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const maxRefresh = 1;

    // API에서 랜덤 포켓몬 4마리 가져오기
    const fetchRandomPokemon = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/pokemon/random');
            const data = await response.json();

            if (response.ok) {
                setDisplayedPokemon(data);
            } else {
                console.error('포켓몬 가져오기 실패:', data);
                alert('포켓몬을 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('포켓몬 가져오기 오류:', error);
            alert('포켓몬을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 컴포넌트 마운트 시 포켓몬 가져오기
    useEffect(() => {
        fetchRandomPokemon();
    }, []);

    const handleRefresh = () => {
        if (refreshCount < maxRefresh) {
            setSelectedPokemon(null);
            fetchRandomPokemon();
            setRefreshCount(refreshCount + 1);
        }
    };

    const handleCreatePokemon = async () => {
        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (selectedPokemon !== null) {
            const pokemon = displayedPokemon.find(p => p.poke_id === selectedPokemon);

            setIsSaving(true);
            try {
                const response = await fetch(`/api/me/pokemon?user_id=${user.userId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        poke_id: selectedPokemon,
                        name: pokemon?.name, // Optional, but good for logging if needed
                        type1: pokemon?.type1,
                        type2: pokemon?.type2
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert(`${pokemon?.name}을(를) 학습 파트너로 선택했습니다!`);
                    // Pokemon 선택 완료 - hasPokemon을 true로 설정
                    setPokemon(true);
                    // 선택 후 뒤로 가기 (Pokemon landing page로 이동)
                    const pendingClaim = typeof window !== "undefined" ? sessionStorage.getItem("pendingClaimExpFloor") : null;
                    if (typeof window !== "undefined" && pendingClaim) {
                        sessionStorage.setItem("lastClaimedExpFloor", pendingClaim);
                        sessionStorage.removeItem("pendingClaimExpFloor");
                    }
                    if (onBack) {
                        onBack();
                    }
                } else {
                    console.error('포켓몬 저장 실패:', data);
                    alert(data.detail || '포켓몬 저장에 실패했습니다.');
                }
            } catch (error) {
                console.error('포켓몬 저장 오류:', error);
                alert('포켓몬 저장 중 오류가 발생했습니다.');
            } finally {
                setIsSaving(false);
            }
        } else {
            alert("포켓몬을 먼저 선택해주세요!");
        }
    };

    // 타입 한글 변환
    const getTypeLabel = (type: string) => {
        const typeMap: { [key: string]: string } = {
            normal: "노멀",
            fire: "불꽃",
            water: "물",
            electric: "전기",
            grass: "풀",
            ice: "얼음",
            fighting: "격투",
            poison: "독",
            ground: "땅",
            flying: "비행",
            psychic: "에스퍼",
            bug: "벌레",
            rock: "바위",
            ghost: "고스트",
            dragon: "드래곤",
            dark: "악",
            steel: "강철",
            fairy: "페어리",
        };
        return typeMap[type.toLowerCase()] || type;
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
                        내 스터디몬 만들기
                    </h1>
                    <p className="text-purple-500 text-sm">
                        당신의 학습 파트너가 될 스터디몬을 선택하세요!
                    </p>
                </div>

                {/* 포켓몬 카드 영역 */}
                {isLoading ? (
                    <div className="w-full text-center py-12">
                        <p className="text-xl text-purple-600">스터디몬을 불러오는 중...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-4 w-full">
                        {displayedPokemon.map((pokemon) => (
                            <button
                                key={pokemon.poke_id}
                                onClick={() => setSelectedPokemon(pokemon.poke_id)}
                                className={`group relative w-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden ${selectedPokemon === pokemon.poke_id
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
                                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.poke_id}.png`}
                                            alt={pokemon.name}
                                            className="max-h-full max-w-full object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.25)]"
                                        />
                                    </div>
                                    <div className="pt-3 space-y-3 font-semibold text-slate-700 text-sm">
                                        <div className="leading-snug text-right">No. {String(pokemon.poke_id).padStart(3, "0")}</div>
                                        <div className="leading-snug text-right">{pokemon.name}</div>
                                        <div className="leading-snug text-right">
                                            {getTypeLabel(pokemon.type1)}
                                            {pokemon.type2 && `, ${getTypeLabel(pokemon.type2)}`}
                                        </div>
                                    </div>
                                </div>
                                {selectedPokemon === pokemon.poke_id && (
                                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg">

                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* 하단 버튼 영역 */}
                <div className="flex gap-3 flex-wrap justify-center">
                    <button
                        onClick={handleCreatePokemon}
                        disabled={selectedPokemon === null || isSaving}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 text-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        {isSaving ? "저장 중..." : "내 스터디몬 만들기"}
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
