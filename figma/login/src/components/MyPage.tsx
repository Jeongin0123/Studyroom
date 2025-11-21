import { ArrowLeft, Clock, Star } from 'lucide-react';
import { Button } from './ui/button';
import PokemonCard from './PokemonCard';
import { Avatar, AvatarFallback } from './ui/avatar';

interface MyPageProps {
  onBack: () => void;
}

// Mock data
const pokemonStorage = [
  { id: 1, name: '피카츄', level: 25, type: '전기', imageUrl: 'https://images.unsplash.com/photo-1638964758061-117853a20865?w=400', isEquipped: true },
  { id: 2, name: '파이리', level: 18, type: '불꽃', imageUrl: 'https://images.unsplash.com/photo-1643725173053-ed68676f1878?w=400', isEquipped: true },
  { id: 3, name: '꼬부기', level: 20, type: '물', imageUrl: 'https://images.unsplash.com/photo-1605979257913-1704eb7b6246?w=400', isEquipped: true },
  { id: 4, name: '이상해씨', level: 15, type: '풀', imageUrl: 'https://images.unsplash.com/photo-1673185865555-49566486c6dd?w=400', isEquipped: false },
  { id: 5, name: '이브이', level: 22, type: '노말', imageUrl: 'https://images.unsplash.com/photo-1640271204756-6bf55641d9fe?w=400', isEquipped: false },
  { id: 6, name: '푸린', level: 12, type: '노말', imageUrl: 'https://images.unsplash.com/photo-1596213905771-8ffa41d8f98b?w=400', isEquipped: false },
];

export default function MyPage({ onBack }: MyPageProps) {
  const equippedPokemon = pokemonStorage.filter(p => p.isEquipped);
  const storagePokemon = pokemonStorage.filter(p => !p.isEquipped);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="rounded-full border-2 border-purple-300 hover:bg-purple-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
        </div>

        {/* User Info */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-4 border-yellow-300 shadow-xl mb-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-purple-300">
              <AvatarFallback className="bg-gradient-to-br from-purple-300 to-pink-300 text-2xl">
                트레이너
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl text-gray-800 mb-1">포켓몬 마스터</h2>
              <p className="text-gray-600">레벨 42 트레이너</p>
              <div className="flex gap-2 mt-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Study Time & Equipped Pokemon Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Weekly Study Time Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-300 to-purple-300 rounded-3xl p-6 border-4 border-white shadow-xl h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white rounded-full p-3">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-white">이번 주 공부 시간</h3>
              </div>
              <div className="bg-white/30 rounded-2xl p-6 backdrop-blur-sm">
                <div className="text-4xl text-white mb-2">24시간 30분</div>
                <p className="text-white/90 text-sm">지난주보다 +3시간 증가!</p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-white text-sm">
                  <span>월</span>
                  <span>3h 20m</span>
                </div>
                <div className="flex justify-between text-white text-sm">
                  <span>화</span>
                  <span>4h 10m</span>
                </div>
                <div className="flex justify-between text-white text-sm">
                  <span>수</span>
                  <span>5h 00m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Equipped Pokemon Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-4 border-pink-300 shadow-xl">
              <h3 className="text-xl text-gray-800 mb-4">장착된 포켓몬</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...equippedPokemon, ...Array(6 - equippedPokemon.length)].map((pokemon, idx) => (
                  <div key={idx}>
                    {pokemon ? (
                      <PokemonCard {...pokemon} isEquipped={true} />
                    ) : (
                      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border-4 border-dashed border-gray-300 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">빈 슬롯</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pokemon Storage */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-4 border-green-300 shadow-xl">
          <h3 className="text-xl text-gray-800 mb-4">포켓몬 창고</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {storagePokemon.map((pokemon) => (
              <PokemonCard key={pokemon.id} {...pokemon} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
