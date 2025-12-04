import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface BattleSelectPokemonPopupProps {
    onEnterBattle: (pokemonIndex: number) => void;
    onCancel: () => void;
}

export function BattleSelectPokemonPopup({ onEnterBattle, onCancel }: BattleSelectPokemonPopupProps) {
    const [selectedPokemon, setSelectedPokemon] = useState(3); // 기본 4번째 선택

    // 6개의 포켓몬 데이터 (임시 이미지)
    const pokemons = [
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png", // 이상해씨
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png", // 파이리
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png", // 꼬부기
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png", // 피카츄
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png", // 이브이
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png", // 잠만보
    ];

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
                            key={index}
                            onClick={() => setSelectedPokemon(index)}
                            className={`relative aspect-square rounded-2xl overflow-hidden transition-all hover:scale-105 ${selectedPokemon === index
                                    ? "ring-4 ring-red-500 shadow-lg"
                                    : "ring-2 ring-gray-200 hover:ring-purple-300"
                                }`}
                        >
                            <ImageWithFallback
                                src={pokemon}
                                alt={`포켓몬 ${index + 1}`}
                                className="w-full h-full object-contain p-2 bg-gray-50"
                            />
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
