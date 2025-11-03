import { useEffect, useState } from 'react';
import { getPokemon } from '@/lib/pokeapi';

export default function PokemonBadge({ name }: { name: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getPokemon(name).then(setData).catch(console.error);
  }, [name]);

  if (!data) return (
    <div className="w-24 h-24 rounded-2xl bg-gray-200 animate-pulse" />
  );

  const art =
    data.sprites?.other?.['official-artwork']?.front_default ??
    data.sprites?.front_default;

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl shadow bg-white">
      <img src={art} alt={name} className="w-16 h-16 object-contain" />
      <div className="font-semibold capitalize">{data.name}</div>
    </div>
  );
}
