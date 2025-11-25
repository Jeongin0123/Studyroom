interface BattleZonePanelProps {
  inBattle?: boolean;
  opponentName?: string;
  opponentPokemon?: string;
  myPokemon?: string;
}

export function BattleZonePanel({
  inBattle = false,
  opponentName = "파이리456",
  opponentPokemon = "🔥",
  myPokemon = "⚡"
}: BattleZonePanelProps) {

  if (!inBattle) {
    // 배틀 중이 아닐 때 - 기본 배틀존 표시
    return (
      <div className="h-full bg-gradient-to-br from-pink-100/80 via-purple-100/80 to-violet-100/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-200/50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">⚡⚡⚡</div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-pink-600 via-purple-600 to-violet-600">
            배틀존
          </h2>
          <div className="text-4xl mt-4">⚡⚡⚡</div>
        </div>
      </div>
    );
  }

  // 배틀 중일 때 - 상대방과 내 프로필 표시 (컴팩트 디자인)
  return (
    <div className="h-full bg-gradient-to-br from-pink-100/80 via-purple-100/80 to-violet-100/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-200/50 p-2.5 flex flex-col gap-2">

      {/* 상대방 프로필 - 작게 */}
      <div className="bg-white/95 rounded-xl p-2 shadow-md border border-purple-200">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center text-2xl flex-shrink-0">
            {opponentPokemon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-gray-800 truncate">{opponentName}</h3>
            <p className="text-[10px] text-gray-600">포켓몬: 피카츄</p>
            <p className="text-[10px] text-gray-600">타입: 전기 | EXP: 1200</p>
          </div>
        </div>
      </div>

      {/* 배틀 아레나 - 컴팩트 */}
      <div className="bg-gradient-to-br from-green-200/90 to-green-300/90 rounded-xl p-2.5 shadow-md border border-green-300">
        {/* 상대방 포켓몬 */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-9 h-9 rounded-lg bg-white/80 flex items-center justify-center text-xl">
            {opponentPokemon}
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold text-green-800 mb-0.5">HP</div>
            <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-red-400" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

        {/* VS */}
        <div className="text-center my-1">
          <span className="text-2xl font-bold text-red-600 drop-shadow-lg">VS</span>
        </div>

        {/* 내 포켓몬 */}
        <div className="flex items-center gap-1.5">
          <div className="w-9 h-9 rounded-lg bg-white/80 flex items-center justify-center text-xl">
            {myPokemon}
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold text-green-800 mb-0.5">HP</div>
            <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-red-400" style={{ width: '48%' }}></div>
            </div>
            <div className="text-[10px] text-right text-green-800 font-semibold">43/90</div>
          </div>
        </div>
      </div>

      {/* 기술 버튼들 - 작게 */}
      <div className="grid grid-cols-2 gap-1.5">
        <button className="bg-white/95 hover:bg-white text-[10px] font-bold text-gray-700 py-1.5 px-1.5 rounded-lg border border-gray-300 transition-all hover:shadow-md hover:border-purple-400">
          100만볼트
        </button>
        <button className="bg-white/95 hover:bg-white text-[10px] font-bold text-gray-700 py-1.5 px-1.5 rounded-lg border border-gray-300 transition-all hover:shadow-md hover:border-purple-400">
          전광석화
        </button>
        <button className="bg-white/95 hover:bg-white text-[10px] font-bold text-gray-700 py-1.5 px-1.5 rounded-lg border border-gray-300 transition-all hover:shadow-md hover:border-purple-400">
          아이언테일
        </button>
        <button className="bg-white/95 hover:bg-white text-[10px] font-bold text-gray-700 py-1.5 px-1.5 rounded-lg border border-gray-300 transition-all hover:shadow-md hover:border-purple-400">
          번개
        </button>
      </div>

      {/* Battle Time! - 작게 */}
      <div className="bg-white/95 rounded-xl p-2 shadow-md border border-purple-200">
        <div className="text-center text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
          Battle Time !
        </div>
      </div>

      {/* 회복하기 버튼 - 작게 */}
      <button className="bg-white/95 hover:bg-white text-[11px] font-bold text-gray-700 py-2 px-2 rounded-xl border border-gray-300 transition-all hover:shadow-md hover:border-purple-400">
        회복하기
      </button>

      {/* 내 아들 프로필 - 작게 */}
      <div className="bg-white/95 rounded-xl p-2 shadow-md border border-purple-200">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-200 to-orange-200 flex items-center justify-center text-2xl flex-shrink-0">
            {myPokemon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-gray-800">내 아들</h3>
            <p className="text-[10px] text-gray-600">포켓몬: 피카츄</p>
            <p className="text-[10px] text-gray-600">타입: 전기 | EXP: 1200</p>
          </div>
        </div>
      </div>

    </div>
  );
}
