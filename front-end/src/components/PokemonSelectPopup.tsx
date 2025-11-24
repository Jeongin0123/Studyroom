import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Pokemon {
  id: number;
  name: string;
  koreanName: string;
  imageUrl: string;
}

const allPokemonList: Pokemon[] = [
  {
    id: 1,
    name: "Pikachu",
    koreanName: "피카츄",
    imageUrl: "https://images.unsplash.com/photo-1638964758061-117853a20865?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWthY2h1JTIwcG9rZW1vbnxlbnwxfHx8fDE3NjMyODQ2ODl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 2,
    name: "Charmander",
    koreanName: "파이리",
    imageUrl: "https://images.unsplash.com/photo-1643725173053-ed68676f1878?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGFybWFuZGVyJTIwcG9rZW1vbnxlbnwxfHx8fDE3NjMzMDgwMDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 3,
    name: "Squirtle",
    koreanName: "꼬부기",
    imageUrl: "https://images.unsplash.com/photo-1605979257913-1704eb7b6246?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcXVpcnRsZSUyMHBva2Vtb258ZW58MXx8fHwxNzYzMzA4MDAzfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 4,
    name: "Bulbasaur",
    koreanName: "이상해씨",
    imageUrl: "https://images.unsplash.com/photo-1673185865555-49566486c6dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWxiYXNhdXIlMjBwb2tlbW9ufGVufDF8fHx8MTc2MzMwODAwNHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 5,
    name: "Jigglypuff",
    koreanName: "푸린",
    imageUrl: "https://images.unsplash.com/photo-1596213905771-8ffa41d8f98b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqaWdnbHlwdWZmJTIwcG9rZW1vbnxlbnwxfHx8fDE3NjMzNTgxMzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 6,
    name: "Eevee",
    koreanName: "이브이",
    imageUrl: "https://images.unsplash.com/photo-1640271204756-6bf55641d9fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZXZlZSUyMHBva2Vtb258ZW58MXx8fHwxNzYzMjUzOTE1fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 7,
    name: "Meowth",
    koreanName: "나옹",
    imageUrl: "https://images.unsplash.com/photo-1730267252406-e412e23efedf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW93dGglMjBwb2tlbW9ufGVufDF8fHx8MTc2MzM2MTI2M3ww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 8,
    name: "Snorlax",
    koreanName: "잠만보",
    imageUrl: "https://images.unsplash.com/photo-1739709456543-11b5b04f4ac9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbm9ybGF4JTIwcG9rZW1vbnxlbnwxfHx8fDE3NjMzNjEyNjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

// 랜덤으로 4개의 포켓몬 선택하는 함수
const getRandomPokemon = (): Pokemon[] => {
  const shuffled = [...allPokemonList].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
};

interface PokemonSelectPopupProps {
  onClose: () => void;
}

export default function PokemonSelectPopup({ onClose }: PokemonSelectPopupProps) {
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
      // 선택 후 팝업 닫기
      onClose();
    } else {
      alert("포켓몬을 먼저 선택해주세요!");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100">
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
              className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${selectedPokemon === pokemon.id
                ? "ring-4 ring-purple-500 shadow-purple-300"
                : ""
                }`}
            >
              <div className="aspect-square rounded-2xl overflow-hidden mb-3 bg-gradient-to-br from-pink-50 to-purple-50">
                <ImageWithFallback
                  src={pokemon.imageUrl}
                  alt={pokemon.koreanName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="space-y-1">
                <p className="text-purple-800 font-medium">{pokemon.koreanName}</p>
                <p className="text-xs text-pink-500">{pokemon.name}</p>
              </div>
              {selectedPokemon === pokemon.id && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-1.5 shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
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
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
