import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PokemonCardProps {
  name: string;
  level: number;
  type: string;
  imageUrl: string;
  isEquipped?: boolean;
  onClick?: () => void;
}

const typeColors: Record<string, string> = {
  '불꽃': 'bg-red-300 text-red-800',
  '물': 'bg-blue-300 text-blue-800',
  '풀': 'bg-green-300 text-green-800',
  '전기': 'bg-yellow-300 text-yellow-800',
  '얼음': 'bg-cyan-300 text-cyan-800',
  '격투': 'bg-orange-300 text-orange-800',
  '독': 'bg-purple-300 text-purple-800',
  '노말': 'bg-gray-300 text-gray-800',
};

export default function PokemonCard({ 
  name, 
  level, 
  type, 
  imageUrl, 
  isEquipped = false,
  onClick 
}: PokemonCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 
        border-4 shadow-lg transition-all cursor-pointer hover:scale-105
        ${isEquipped ? 'border-yellow-400 shadow-yellow-300' : 'border-purple-200'}
      `}
    >
      {isEquipped && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-white px-3 py-1 rounded-full text-xs shadow-lg">
          장착중
        </div>
      )}
      
      <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-center text-gray-800">{name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Lv. {level}</span>
          <Badge className={`${typeColors[type] || 'bg-gray-300 text-gray-800'} border-0`}>
            {type}
          </Badge>
        </div>
      </div>
    </div>
  );
}
