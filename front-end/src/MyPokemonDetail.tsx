// src/MyPokemonDetail.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

// 여러 경우(상세/기본/원본)를 모두 담기 위해 대부분을 선택적(?)으로 둠
type PokemonFull = {
  id?: number;
  name?: string;
  types?: string[];
  abilities?: { name: string; hidden: boolean }[];
  sprites?: { official_artwork?: string | null };
  stats?: { [key: string]: number };
  species?: {
    color?: string | null;
    growth_rate?: string | null;
    capture_rate?: number | null;
  };
  evolution_chain?: { name: string; min_level: number | null }[];
};

export default function MyPokemonDetail() {
  const { key } = useParams<{ key: string }>();
  const pokemonKey = key ?? "pikachu";

  const [data, setData] = useState<PokemonFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 공통으로 JSON에서 data 부분만 뽑아내는 헬퍼
  const extractData = (json: any): any => {
    // 1) 우리가 만든 백엔드 형식: { ok: true, data: {...} }
    if (json && typeof json === "object") {
      if ("ok" in json && json.ok && "data" in json) {
        return json.data;
      }
      // 2) FastAPI HTTPException: { detail: {...} }
      if ("detail" in json && json.detail) {
        throw new Error(
          json.detail.error ??
            json.detail.detail ??
            json.detail ??
            "포켓몬 정보를 불러오지 못했습니다."
        );
      }
    }
    // 3) 그 외에는 그냥 전체를 데이터라고 보고 사용(PokeAPI 원본 등)
    return json;
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1차: /pokemon/{키}/full 시도
        try {
          const resFull = await fetch(`/api/pokemon/${pokemonKey}/full`);
          const jsonFull = await resFull.json();

          if (resFull.ok && (jsonFull.ok ?? true)) {
            const fullData = extractData(jsonFull);

            const normalized: PokemonFull = {
              id: fullData.id,
              name: fullData.name,
              types: fullData.types,
              abilities: fullData.abilities,
              sprites: fullData.sprites,
              stats: fullData.stats,
              species: fullData.species,
              evolution_chain: fullData.evolution_chain,
            };

            setData(normalized);
            return;
          }
          // ok 필드가 false거나, 404 등 → 아래에서 기본 버전으로 재시도
        } catch (e) {
          // /full 호출 자체가 안 될 경우 → 무시하고 기본 버전으로 이동
        }

        // 2차: /pokemon/{키} 로 기본 정보만이라도 가져오기
        const resBasic = await fetch(`/api/pokemon/${pokemonKey}`);
        const jsonBasic = await resBasic.json();

        if (!resBasic.ok) {
          // 404 등인 경우
          const detail =
            jsonBasic?.detail?.error ??
            jsonBasic?.detail ??
            jsonBasic?.error ??
            "";
          throw new Error(
            detail || "포켓몬 정보를 불러오지 못했습니다. (기본 정보)"
          );
        }

        const basic = extractData(jsonBasic);

        // PokeAPI 원본 또는 우리가 만든 간단 버전 둘 다 커버
        const spritesFromBasic =
          basic.sprites?.other?.["official-artwork"]?.front_default ??
          basic.sprites?.front_default ??
          basic.sprites?.official_artwork ??
          null;

        const typesFromBasic: string[] =
          basic.types?.map((t: any) => t.type?.name ?? t) ?? [];

        const abilitiesFromBasic =
          basic.abilities?.map((a: any) => ({
            name: a.ability?.name ?? a.name,
            hidden: a.is_hidden ?? a.hidden ?? false,
          })) ?? [];

        const statsFromBasic: { [key: string]: number } =
          basic.stats?.reduce(
            (acc: any, st: any) => ({
              ...acc,
              [st.stat?.name ?? st.name]: st.base_stat ?? st.value,
            }),
            {}
          ) ?? {};

        const normalizedBasic: PokemonFull = {
          id: basic.id,
          name: basic.name,
          types: typesFromBasic,
          abilities: abilitiesFromBasic,
          sprites: { official_artwork: spritesFromBasic },
          stats: statsFromBasic,
          // species / evolution_chain 은 없을 수도 있음
        };

        setData(normalizedBasic);
      } catch (e: any) {
        setError(e.message ?? "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [pokemonKey]);

  // ───────── 상태별 화면 ─────────
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

  // ───────── 실제 상세 화면 ─────────
  const imgUrl = data.sprites?.official_artwork ?? undefined;

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
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={data.name ?? "pokemon"}
                className="w-40 h-40 object-contain"
              />
            ) : (
              <span className="text-sm text-white/70">이미지 없음</span>
            )}
          </div>
          <div className="text-xl font-semibold mb-2">
            #{data.id ?? "?"} {data.name ?? "(이름 없음)"}
          </div>

          {/* 타입 뱃지 */}
          <div className="flex flex-wrap gap-2 mb-3 justify-center">
            {data.types?.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full bg-white/20 text-sm"
              >
                타입: {t}
              </span>
            )) || <span className="text-sm text-white/70">타입 정보 없음</span>}
          </div>

          {/* 능력 */}
          {data.abilities && data.abilities.length > 0 && (
            <div className="text-sm text-white/80">
              능력:&nbsp;
              {data.abilities.map((a, idx) => (
                <span key={a.name}>
                  {a.name}
                  {a.hidden && " (히든)"}
                  {idx !== data.abilities!.length - 1 && ", "}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 오른쪽: 스탯, 종 정보, 진화 체인 */}
        <div className="flex-1 space-y-6">
          {/* 스탯 카드 */}
          <div className="bg-black/10 rounded-2xl p-4">
            <h2 className="text-lg font-semibold mb-3">주요 능력치</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>HP</span>
                <span>{data.stats?.hp ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span>공격력</span>
                <span>{data.stats?.attack ?? "-"}</span>
              </div>
            </div>
          </div>

          {/* 종 정보 카드 */}
          <div className="bg-black/10 rounded-2xl p-4">
            <h2 className="text-lg font-semibold mb-3">종 정보</h2>
            <div className="space-y-1 text-sm">
              <div>색상: {data.species?.color ?? "-"}</div>
              <div>성장률: {data.species?.growth_rate ?? "-"}</div>
              <div>포획률: {data.species?.capture_rate ?? "-"}</div>
            </div>
          </div>

          {/* 진화 체인 카드 */}
          <div className="bg-black/10 rounded-2xl p-4">
            <h2 className="text-lg font-semibold mb-3">진화 체인</h2>
            <div className="text-sm">
              {data.evolution_chain && data.evolution_chain.length > 0 ? (
                data.evolution_chain.map((e, idx) => (
                  <span key={e.name}>
                    {e.name}
                    {e.min_level ? `(Lv.${e.min_level})` : ""}
                    {idx !== data.evolution_chain!.length - 1 && "  →  "}
                  </span>
                ))
              ) : (
                <span className="text-white/70">진화 정보 없음</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
