import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useUser } from "./UserContext";

interface Pokemon {
    id: number;
    poke_id: number;
    name: string;
    level: number;
}

interface BattleSelectPokemonPopupProps {
    onEnterBattle: (pokemonIndex: number) => void;
    onCancel: () => void;
}

export function BattleSelectPokemonPopup({ onEnterBattle, onCancel }: BattleSelectPokemonPopupProps) {
    const { user } = useUser();
    const [selectedPokemon, setSelectedPokemon] = useState(0);
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(true);

    // 사용자의 활성 팀 포켓몬 가져오기
    useEffect(() => {
        if (!user?.userId) return;

        fetch(`/api/me/active-team?user_id=${user.userId}`)
            .then(res => res.json())
            .then(data => {
                setPokemons(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('포켓몬 조회 실패:', err);
                setLoading(false);
            });
    }, [user?.userId]);

    const getPokemonImageUrl = (pokeId: number) => {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png`;
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
                <Card className="max-w-2xl w-full p-10 bg-white rounded-3xl border-8 border-yellow-300 shadow-2xl">
                    <p className="text-center text-lg">포켓몬 불러오는 중...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
            <Card className="max-w-2xl w-full p-10 bg-white rounded-3xl border-8 border-yellow-300 shadow-2xl animate-in zoom-in-95 duration-200 relative">

                {/* 제목 */}
                <h1 className="text-center mb-10 text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    배틀 할 내 포켓몬 선택하기
                </h1>

                {/* 포켓몬 그리드 */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-10">
                    {pokemons.map((pokemon, index) => (
                        <button
                            key={pokemon.id}
                            onClick={() => setSelectedPokemon(index)}
                            className={`relative aspect-square rounded-2xl overflow-hidden transition-all hover:scale-105 ${selectedPokemon === index
                                ? "ring-4 ring-red-500 shadow-lg"
                                : "ring-2 ring-gray-200 hover:ring-purple-300"
                                }`}
                        >
                            <ImageWithFallback
                                src={getPokemonImageUrl(pokemon.poke_id)}
                                alt={pokemon.name}
                                className="w-full h-full object-contain p-2 bg-gray-50"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 px-2 truncate">
                                Lv.{pokemon.level}
                            </div>
                        </button>
                    ))}
                </div>

                {/* 배틀 입장하기 버튼 */}
                <div className="flex justify-center">
                    <Button
                        onClick={() => onEnterBattle(selectedPokemon)}
                        className="px-16 py-6 text-lg bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 rounded-full shadow-sm transition-all hover:shadow-md"
                    >
                        배틀 입장하기
                    </Button>
                </div>
            </Card>
        </div>
    );
}
