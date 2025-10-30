import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft, Star, Zap, Heart } from "lucide-react";

interface Pokemon {
  id: number;
  name: string;
  type: string;
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  image: string;
  owned: boolean;
}

interface PokemonManagementProps {
  onBack: () => void;
}

export default function PokemonManagement({ onBack }: PokemonManagementProps) {
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  const myPokemon: Pokemon[] = [
    {
      id: 1,
      name: "피카츄",
      type: "전기",
      level: 15,
      exp: 750,
      maxExp: 1000,
      hp: 85,
      maxHp: 100,
      attack: 55,
      defense: 40,
      image: "https://images.unsplash.com/photo-1750771964487-97c4a225a190?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2tlbW9uJTIwcGlrYWNodXxlbnwxfHx8fDE3NjA5MzU5Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      owned: true,
    },
    {
      id: 2,
      name: "이브이",
      type: "노말",
      level: 12,
      exp: 450,
      maxExp: 800,
      hp: 95,
      maxHp: 110,
      attack: 45,
      defense: 50,
      image: "https://images.unsplash.com/photo-1751200065697-4461cc2b43cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeSUyMGRlc2slMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYwODcwMTM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      owned: true,
    },
    {
      id: 3,
      name: "파이리",
      type: "불꽃",
      level: 10,
      exp: 200,
      maxExp: 600,
      hp: 70,
      maxHp: 90,
      attack: 60,
      defense: 35,
      image: "https://images.unsplash.com/photo-1614179924047-e1ab49a0a0cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBzZXR1cHxlbnwxfHx8fDE3NjA4NTE4NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      owned: true,
    },
  ];

  const availablePokemon: Pokemon[] = [
    {
      id: 4,
      name: "꼬부기",
      type: "물",
      level: 1,
      exp: 0,
      maxExp: 500,
      hp: 80,
      maxHp: 80,
      attack: 40,
      defense: 60,
      image: "https://images.unsplash.com/photo-1751200065697-4461cc2b43cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeSUyMGRlc2slMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYwODcwMTM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      owned: false,
    },
    {
      id: 5,
      name: "잠만보",
      type: "노말",
      level: 1,
      exp: 0,
      maxExp: 500,
      hp: 160,
      maxHp: 160,
      attack: 110,
      defense: 65,
      image: "https://images.unsplash.com/photo-1614179924047-e1ab49a0a0cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBzZXR1cHxlbnwxfHx8fDE3NjA4NTE4NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      owned: false,
    },
  ];

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      전기: "bg-yellow-400",
      불꽃: "bg-red-400",
      물: "bg-blue-400",
      노말: "bg-gray-400",
    };
    return colors[type] || "bg-gray-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Button onClick={onBack} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            마이페이지로
          </Button>
          <h1 className="text-3xl mb-2">포켓몬 관리</h1>
          <p className="text-muted-foreground">공부하면서 포켓몬을 획득하고 성장시키세요!</p>
        </div>

        <Tabs defaultValue="my-pokemon" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="my-pokemon">내 포켓몬</TabsTrigger>
            <TabsTrigger value="shop">포켓몬 상점</TabsTrigger>
          </TabsList>

          <TabsContent value="my-pokemon">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pokemon List */}
              <div className="space-y-4">
                <h2 className="text-xl mb-4">보유 포켓몬 ({myPokemon.length}마리)</h2>
                {myPokemon.map((pokemon) => (
                  <Card
                    key={pokemon.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedPokemon?.id === pokemon.id ? "ring-2 ring-yellow-400" : ""
                    }`}
                    onClick={() => setSelectedPokemon(pokemon)}
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={pokemon.image}
                          alt={pokemon.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3>{pokemon.name}</h3>
                          <Badge className={getTypeColor(pokemon.type)}>{pokemon.type}</Badge>
                          <Badge variant="outline">Lv.{pokemon.level}</Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Heart className="w-4 h-4 text-red-500" />
                            <Progress value={(pokemon.hp / pokemon.maxHp) * 100} className="flex-1 h-2" />
                            <span className="text-xs">{pokemon.hp}/{pokemon.maxHp}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <Progress value={(pokemon.exp / pokemon.maxExp) * 100} className="flex-1 h-2" />
                            <span className="text-xs">{pokemon.exp}/{pokemon.maxExp}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pokemon Details */}
              <div>
                {selectedPokemon ? (
                  <Card className="p-6 sticky top-6">
                    <h2 className="text-xl mb-4">포켓몬 상세 정보</h2>
                    <div className="text-center mb-6">
                      <div className="w-48 h-48 mx-auto rounded-lg overflow-hidden bg-muted mb-4">
                        <img
                          src={selectedPokemon.image}
                          alt={selectedPokemon.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-2xl mb-2">{selectedPokemon.name}</h3>
                      <div className="flex justify-center gap-2 mb-4">
                        <Badge className={getTypeColor(selectedPokemon.type)}>{selectedPokemon.type}</Badge>
                        <Badge variant="outline">레벨 {selectedPokemon.level}</Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-red-500" />
                            체력
                          </span>
                          <span>{selectedPokemon.hp}/{selectedPokemon.maxHp}</span>
                        </div>
                        <Progress value={(selectedPokemon.hp / selectedPokemon.maxHp) * 100} />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            경험치
                          </span>
                          <span>{selectedPokemon.exp}/{selectedPokemon.maxExp}</span>
                        </div>
                        <Progress value={(selectedPokemon.exp / selectedPokemon.maxExp) * 100} />
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Zap className="w-4 h-4 text-orange-500" />
                            <span className="text-sm">공격력</span>
                          </div>
                          <p className="text-xl">{selectedPokemon.attack}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-sm">방어력</span>
                          </div>
                          <p className="text-xl">{selectedPokemon.defense}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t text-sm text-muted-foreground">
                        <p>💡 공부를 열심히 하면 포켓몬이 경험치를 얻어 레벨업합니다!</p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-6 h-full flex items-center justify-center text-center text-muted-foreground">
                    <div>
                      <p>왼쪽에서 포켓몬을 선택하세요</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shop">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePokemon.map((pokemon) => (
                <Card key={pokemon.id} className="p-6 text-center">
                  <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden bg-muted mb-4">
                    <img
                      src={pokemon.image}
                      alt={pokemon.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl mb-2">{pokemon.name}</h3>
                  <Badge className={`${getTypeColor(pokemon.type)} mb-4`}>{pokemon.type}</Badge>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div className="bg-muted p-2 rounded">
                      <div className="text-muted-foreground">HP</div>
                      <div>{pokemon.maxHp}</div>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <div className="text-muted-foreground">공격</div>
                      <div>{pokemon.attack}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">필요 포인트</p>
                    <p className="text-2xl">500P</p>
                  </div>

                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                    획득하기
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
