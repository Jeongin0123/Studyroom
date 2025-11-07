// src/hooks/usePokemon.ts
import { useCallback, useState } from "react";

type PokemonState = {
  level: number;
  exp: number; // 0~100 기준으로 단순화
};

type Init = Partial<PokemonState>;

/**
 * 경험치 전용 훅: study()로 exp +1, penalty()로 exp -1
 * UI는 즉시 반응하고, 백엔드에는 비동기로 이벤트를 남깁니다.
 */
export function usePokemon(init: Init = {}) {
  const [state, setState] = useState<PokemonState>({
    level: init.level ?? 1,
    exp: Math.max(0, Math.min(100, init.exp ?? 0)),
  });

  // 레벨 규칙(예시): 0~59 => 1레벨, 60~89 => 2레벨, 90~100 => 3레벨
  const computeLevel = (exp: number) => (exp >= 90 ? 3 : exp >= 60 ? 2 : 1);

  const study = useCallback(() => {
    setState((prev) => {
      const nextExp = Math.min(100, prev.exp + 1);
      const nextLevel = computeLevel(nextExp);

      // 비동기 서버 로깅 (성공/실패와 관계없이 UI는 즉시 반영)
      fetch("/api/focus/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1, event_type: "FOCUS_PLUS", metric: 1 }),
      }).catch(() => {});

      return { exp: nextExp, level: nextLevel };
    });
  }, []);

  const penalty = useCallback(() => {
    setState((prev) => {
      const nextExp = Math.max(0, prev.exp - 1);
      const nextLevel = computeLevel(nextExp);

      // 비동기 서버 로깅 (기존 DROWSY 이벤트 사용)
      fetch("/api/focus/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1, event_type: "DROWSY", metric: 1 }),
      }).catch(() => {});

      return { exp: nextExp, level: nextLevel };
    });
  }, []);

  return { state, study, penalty };
}
