import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { useState } from "react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";

export default function App() {
  const [selectedPokemon, setSelectedPokemon] = useState(3); // 기본 4번째 선택

  // 6개의 포켓몬 데이터
  const pokemons = [
    "https://images.unsplash.com/photo-1732455272504-a8965a8c075b?w=400",
    "https://images.unsplash.com/photo-1732455272504-a8965a8c075b?w=400",
    "https://images.unsplash.com/photo-1732455272504-a8965a8c075b?w=400",
    "https://images.unsplash.com/photo-1732455272504-a8965a8c075b?w=400",
    "https://images.unsplash.com/photo-1732455272504-a8965a8c075b?w=400",
    "https://images.unsplash.com/photo-1732455272504-a8965a8c075b?w=400",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-10 bg-white rounded-3xl border-2 border-purple-200 shadow-2xl">
        {/* 제목 */}
        <h1 className="text-center mb-10 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          배틀 할 내 포켓몬 선택하기
        </h1>

        {/* 포켓몬 그리드 */}
        <div className="grid grid-cols-6 gap-4 mb-10">
          {pokemons.map((pokemon, index) => (
            <button
              key={index}
              onClick={() => setSelectedPokemon(index)}
              className={`relative aspect-square rounded-2xl overflow-hidden transition-all hover:scale-105 ${
                selectedPokemon === index
                  ? "ring-4 ring-red-500 shadow-lg"
                  : "ring-2 ring-gray-200 hover:ring-purple-300"
              }`}
            >
              <ImageWithFallback
                src={pokemon}
                alt={`포켓몬 ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* 배틀 입장하기 버튼 */}
        <div className="flex justify-center">
          <Button
            className="px-16 py-6 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 rounded-full shadow-sm transition-all hover:shadow-md"
          >
            배틀 입장하기
          </Button>
        </div>
      </Card>
    </div>
  );
}
