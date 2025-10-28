import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { RefreshCw } from "lucide-react";

export default function PokemonSelectPopup() {
  const [selectedPokemon, setSelectedPokemon] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);
  const [randomPokemons, setRandomPokemons] = useState<any[]>([]);

  const allPokemonOptions = [
    { name: "피카츄", emoji: "⚡", type: "전기", color: "yellow", desc: "전기 타입의 귀여운 포켓몬" },
    { name: "파이리", emoji: "🔥", type: "불꽃", color: "red", desc: "꼬리의 불꽃이 생명력의 증거" },
    { name: "꼬부기", emoji: "💧", type: "물", color: "blue", desc: "등껍질로 몸을 보호하는 포켓몬" },
    { name: "이상해씨", emoji: "🌿", type: "풀", color: "green", desc: "등의 씨앗과 함께 성장하는 포켓몬" },
    { name: "푸린", emoji: "🎵", type: "노말", color: "pink", desc: "노래로 상대를 잠재우는 포켓몬" },
    { name: "나옹", emoji: "😺", type: "노말", color: "amber", desc: "반짝이는 것을 좋아하는 포켓몬" },
    { name: "잠만보", emoji: "😴", type: "노말", color: "blue", desc: "하루 종일 자고 먹는 거대한 포켓몬" },
    { name: "이브이", emoji: "🦊", type: "노말", color: "brown", desc: "다양하게 진화 가능한 포켓몬" },
    { name: "뮤", emoji: "✨", type: "에스퍼", color: "pink", desc: "전설의 환상 포켓몬" },
    { name: "꼬렛", emoji: "🐭", type: "노말", color: "purple", desc: "어디서나 볼 수 있는 포켓몬" },
  ];

  // 랜덤 포켓몬 4마리 선택
  const getRandomPokemons = () => {
    const shuffled = [...allPokemonOptions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  };

  // 초기 로드시 랜덤 포켓몬 설정
  useState(() => {
    setRandomPokemons(getRandomPokemons());
  });

  const handleRefresh = () => {
    if (refreshCount < 1) {
      setRandomPokemons(getRandomPokemons());
      setSelectedPokemon("");
      setRefreshCount(refreshCount + 1);
    }
  };

  const handleCreatePokemon = () => {
    if (selectedPokemon) {
      console.log("포켓몬 선택:", selectedPokemon);
      alert(`${selectedPokemon}을(를) 선택하셨습니다!`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Dialog open={true}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-center">내 포켓몬 만들기</DialogTitle>
            <DialogDescription className="text-center">
              당신의 학습 파트너가 될 포켓몬을 선택하세요
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {/* Pokemon Cards Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {randomPokemons.map((pokemon, index) => (
                <button
                  key={`${pokemon.name}-${index}`}
                  onClick={() => setSelectedPokemon(pokemon.name)}
                  className={`p-6 rounded-xl border-3 transition-all hover:scale-105 ${
                    selectedPokemon === pokemon.name
                      ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-xl ring-4 ring-yellow-200"
                      : "border-gray-200 bg-white hover:border-yellow-300 hover:shadow-lg"
                  }`}
                >
                  <div className="text-7xl mb-3 text-center">{pokemon.emoji}</div>
                  <div className="text-center mb-2">{pokemon.name}</div>
                  <div className="flex justify-center mb-2">
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                    >
                      {pokemon.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 text-center">{pokemon.desc}</p>
                </button>
              ))}
            </div>

            {/* Bottom Bar */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">포켓몬을 선택해 주세요</span>
                  {selectedPokemon && (
                    <Badge className="bg-yellow-500">
                      {selectedPokemon} 선택됨
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshCount >= 1}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshCount >= 1 ? 'text-gray-300' : 'text-gray-600'}`} />
                  새로고침 ({refreshCount}/1)
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={handleCreatePokemon}
                  disabled={!selectedPokemon}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white"
                >
                  시작하기
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
