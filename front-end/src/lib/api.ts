// src/lib/api.ts

/** FastAPI 백엔드 기본 주소 (vite.config.ts의 proxy 기준) */
const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

/**
 * 공통 fetch 함수 (에러 처리 포함)
 */
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${msg}`);
  }
  return res.json() as Promise<T>;
}

/**
 * 포켓몬 정보 가져오기
 * @param id 포켓몬 ID (1~898)
 */
export async function getPokemon(id: number) {
  return request(`/pokemon/${id}`);
}

/**
 * AI 챗봇 메시지 전송
 * @param user_id 사용자 혹은 스터디룸 ID
 * @param message 사용자 입력 텍스트
 */
export async function sendChat(user_id: string, message: string) {
  return request(`/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, message }),
  });
}
