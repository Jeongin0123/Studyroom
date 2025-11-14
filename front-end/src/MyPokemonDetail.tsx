// src/MyPokemonDetail.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

type PokemonFull = {
  id: number;
  name: string;
  types: string[];
  abilities: { name: string; hidden: boolean }[];
  sprites: { official_artwork?: string | null };
  stats: { [key: string]: number };
  species: {
    color?: string | null;
    growth_rate?: string | null;
    capture_rate?: number | null;
  };
  evolution_chain: { name: string; min_level: number | null }[];
};

export default function MyPokemonDetail() {
  // App.tsx 에서 path="/my-pokemon/:key" 이므로 key 로 받기
  const { key } = useParams<{ key: string }>();
  const pokemonKey = key ?? "pikachu"; // 혹시 없으면 기본값

  const [data, setData] = useState<PokemonFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Vite 프록시(/api)를 통해 백엔드 호출
        const res = await fetch(`/api/pokemon/${pokemonKey}/full`);
        const json = await res.json();

        if (!json.ok) {
          throw new Error(json.error ?? "포켓몬 정보를 불러오지 못했습니다.");
        }

        setData(json.data);
      } catch (e: any) {
        setError(e.message ?? "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pokemonKey]);

  // ✅ 로딩 / 오류 / 데이터 없음 공통 레이아웃
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 text-white flex flex-col items-center justify-center">
        <div className="text-xl mb-4">로딩 중…</div>
        <Link
          to="/"
          className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-sm font-medium"
        >
          ← 메인으로
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 text-white flex flex-col items-center justify-center">
        <div className="text-xl mb-4">오류: {error}</div>
        <Link
          to="/"
          className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-sm font-medium"
        >
          ← 메인으로
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 text-white flex flex-col items-center justify-center">
        <div className="text-xl mb-4">데이터가 없습니다.</div>
        <Link
          to="/"
          className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-sm font-medium"
        >
          ← 메인으로
        </Link>
      </div>
    );
  }

  // ✅ 정상 데이터 렌더링
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 text-white flex flex-col items-center py-8">
      {/* 상단 제목 영역 */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 px-4">
        <h1 className="text-3xl font-bold">내 포켓몬 상세 정보</h1>
        <Link
          to="/"
          className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-sm font-medium"
        >
          ← 메인으로
        </Link>
      </div>

      {/* 메인 카드 */}
      <div className="w-full max-w-4xl bg-white/10 rounded-3xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row gap-8">
        {/* 왼쪽: 이미지 + 기본 정보 */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-white/20 flex items-center justify-center mb-4">
            {data.sprites.official_artwork ? (
              <img
                src={data.sprites.official_artwork}
                alt={data.name}
                className="w-40 h-40 object-contain"
              />
            ) : (
              <span className="text-sm text-white/70">이미지 없음</span>
            )}
          </div>
          <div className="text-xl font-semibold mb-2">
            #{data.id} {data.name}
          </div>

          {/* 타입 뱃지 */}
          <div className="flex flex-wrap gap-2 mb-3 justify-center">
            {data.types.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full bg-white/20 text-sm"
              >
                타입: {t}
              </span>
            ))}
          </div>

          {/* 능력 */}
          <div className="text-sm text-white/80">
            능력:&nbsp;
            {data.abilities.map((a, idx) => (
              <span key={a.name}>
                {a.name}
                {a.hidden && " (히든)"}
                {idx !== data.abilities.length - 1 && ", "}
              </span>
            ))}
          </div>
        </div>

        {/* 오른쪽: 스탯, 종 정보, 진화 체인 */}
        <div className="flex-1 space-y-6">
          {/* 스탯 카드 */}
          <div className="bg-black/10 rounded-2xl p-4">
            <h2 className="text-lg font-semibold mb-3">주요 능력치</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>HP</span>
                <span>{data.stats.hp ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span>공격력</span>
                <span>{data.stats.attack ?? "-"}</span>
              </div>
            </div>
          </div>

          {/* 종 정보 카드 */}
          <div className="bg-black/10 rounded-2xl p-4">
            <h2 className="text-lg font-semibold mb-3">종 정보</h2>
            <div className="space-y-1 text-sm">
              <div>색상: {data.species.color ?? "-"}</div>
              <div>성장률: {data.species.growth_rate ?? "-"}</div>
              <div>포획률: {data.species.capture_rate ?? "-"}</div>
            </div>
          </div>

          {/* 진화 체인 카드 */}
          <div className="bg-black/10 rounded-2xl p-4">
            <h2 className="text-lg font-semibold mb-3">진화 체인</h2>
            <div className="text-sm">
              {data.evolution_chain.map((e, idx) => (
                <span key={e.name}>
                  {e.name}
                  {e.min_level ? `(Lv.${e.min_level})` : ""}
                  {idx !== data.evolution_chain.length - 1 && "  →  "}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
