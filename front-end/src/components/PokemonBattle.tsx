import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Swords, Zap, Heart } from 'lucide-react';

interface Pokemon {
  id: number;
  name: string;
  hp: number;
  maxHp: number;
  level: number;
  image: string;
}

export function PokemonBattle() {
  const [myPokemon, setMyPokemon] = useState<Pokemon>({
    id: 1,
    name: '피카츄',
    hp: 100,
    maxHp: 100,
    level: 25,
    image: 'https://images.unsplash.com/photo-1542779283-429940ce8336?w=300&h=300&fit=crop'
  });

  const [enemyPokemon, setEnemyPokemon] = useState<Pokemon>({
    id: 2,
    name: '파이리',
    hp: 100,
    maxHp: 100,
    level: 23,
    image: 'https://images.unsplash.com/photo-1606103836293-0a063a6c4e9c?w=300&h=300&fit=crop'
  });

  const [battleLog, setBattleLog] = useState<string[]>(['배틀 준비 완료!']);
  const [isMyTurn, setIsMyTurn] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const attack = () => {
    if (!isMyTurn || isAnimating) return;
    
    setIsAnimating(true);
    const damage = Math.floor(Math.random() * 30) + 10;
    
    setEnemyPokemon(prev => ({
      ...prev,
      hp: Math.max(0, prev.hp - damage)
    }));

    setBattleLog(prev => [`${myPokemon.name}의 공격! ${damage} 데미지!`, ...prev.slice(0, 4)]);
    
    setTimeout(() => {
      setIsMyTurn(false);
      setIsAnimating(false);
      
      // Enemy turn
      setTimeout(() => {
        enemyAttack();
      }, 1000);
    }, 500);
  };

  const enemyAttack = () => {
    const damage = Math.floor(Math.random() * 25) + 8;
    
    setMyPokemon(prev => ({
      ...prev,
      hp: Math.max(0, prev.hp - damage)
    }));

    setBattleLog(prev => [`${enemyPokemon.name}의 반격! ${damage} 데미지!`, ...prev.slice(0, 4)]);
    
    setTimeout(() => {
      setIsMyTurn(true);
    }, 500);
  };

  const heal = () => {
    if (!isMyTurn || isAnimating) return;
    
    setIsAnimating(true);
    const healAmount = Math.floor(Math.random() * 20) + 20;
    
    setMyPokemon(prev => ({
      ...prev,
      hp: Math.min(prev.maxHp, prev.hp + healAmount)
    }));

    setBattleLog(prev => [`${myPokemon.name}가 회복했다! +${healAmount} HP`, ...prev.slice(0, 4)]);
    
    setTimeout(() => {
      setIsMyTurn(false);
      setIsAnimating(false);
      
      setTimeout(() => {
        enemyAttack();
      }, 1000);
    }, 500);
  };

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2">
          <Swords className="w-5 h-5" />
          포켓몬 배틀
        </h3>
        {isMyTurn && <span className="text-sm text-green-600">내 턴!</span>}
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* Enemy Pokemon */}
        <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
          <img 
            src={enemyPokemon.image} 
            alt={enemyPokemon.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span>{enemyPokemon.name}</span>
              <span className="text-sm text-gray-600">Lv.{enemyPokemon.level}</span>
            </div>
            <Progress value={(enemyPokemon.hp / enemyPokemon.maxHp) * 100} className="h-2 mb-1" />
            <p className="text-sm text-gray-600">{enemyPokemon.hp} / {enemyPokemon.maxHp} HP</p>
          </div>
        </div>

        {/* Battle Log */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-1 min-h-[100px]">
          {battleLog.map((log, index) => (
            <p key={index} className="text-sm">{log}</p>
          ))}
        </div>

        {/* My Pokemon */}
        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
          <img 
            src={myPokemon.image} 
            alt={myPokemon.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span>{myPokemon.name}</span>
              <span className="text-sm text-gray-600">Lv.{myPokemon.level}</span>
            </div>
            <Progress value={(myPokemon.hp / myPokemon.maxHp) * 100} className="h-2 mb-1" />
            <p className="text-sm text-gray-600">{myPokemon.hp} / {myPokemon.maxHp} HP</p>
          </div>
        </div>

        {/* Battle Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={attack}
            disabled={!isMyTurn || isAnimating}
            className="flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            공격하기
          </Button>
          <Button 
            onClick={heal}
            disabled={!isMyTurn || isAnimating}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4" />
            회복하기
          </Button>
        </div>
      </div>
    </Card>
  );
}
