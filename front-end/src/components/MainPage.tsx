import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Sparkles, Users, Trophy, TrendingUp, RefreshCw } from "lucide-react";

export default function MainPage() {
  const [isCreatePokemonOpen, setIsCreatePokemonOpen] = useState(false);
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

  // 팝업이 열릴 때 랜덤 포켓몬 4마리 선택
  const getRandomPokemons = () => {
    const shuffled = [...allPokemonOptions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  };

  const handleOpenDialog = () => {
    setRandomPokemons(getRandomPokemons());
    setSelectedPokemon("");
    setRefreshCount(0);
    setIsCreatePokemonOpen(true);
  };

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
      setIsCreatePokemonOpen(false);
      // 여기에 실제 생성 로직 추가
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-500">
            포켓몬 스터디룸
          </h1>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">⚡🔥💧🌿</div>
          <h2 className="mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            나만의 포켓몬과 함께 공부하세요!
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            포켓몬을 키우며 학습 습관을 만들어가세요. 공부할수록 포켓몬이 성장하고, 새로운 배지를 획득할 수 있습니다.
          </p>
          <Button 
            size="lg"
            onClick={handleOpenDialog}
            className="bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white gap-2"
          >
            <Sparkles className="w-5 h-5" />
            내 포켓몬 만들러가기
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="mb-2">레벨업 시스템</h3>
            <p className="text-gray-600">공부하면 경험치를 얻고 레벨업하세요</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="mb-2">친구와 경쟁</h3>
            <p className="text-gray-600">친구들과 함께 순위를 겨뤄보세요</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="mb-2">학습 분석</h3>
            <p className="text-gray-600">상세한 리포트로 학습 패턴을 파악하세요</p>
          </Card>
        </div>

        {/* Stats Section */}
        <Card className="p-8 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl text-yellow-600 mb-2">1,234</div>
              <p className="text-gray-600">활성 트레이너</p>
            </div>
            <div>
              <div className="text-3xl text-orange-600 mb-2">15,678</div>
              <p className="text-gray-600">총 학습 시간</p>
            </div>
            <div>
              <div className="text-3xl text-red-600 mb-2">892</div>
              <p className="text-gray-600">획득한 배지</p>
            </div>
            <div>
              <div className="text-3xl text-purple-600 mb-2">45</div>
              <p className="text-gray-600">평균 레벨</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Create Pokemon Dialog */}
      <Dialog open={isCreatePokemonOpen} onOpenChange={setIsCreatePokemonOpen}>
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
                  onClick={() => setIsCreatePokemonOpen(false)}
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