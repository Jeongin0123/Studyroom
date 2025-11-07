// src/lib/api.ts

/** ----- API BASE 계산 ----- */
function trimEndSlash(s?: string) {
  return s ? s.replace(/\/+$/, "") : s;
}

// .env 중 하나만 있어도 동작하도록
const RAW_URL  = trimEndSlash(import.meta.env.VITE_API_URL as string | undefined);   // 예: http://127.0.0.1:8000
const RAW_BASE = trimEndSlash(import.meta.env.VITE_API_BASE as string | undefined);  // 예: /api 또는 http://127.0.0.1:8000/api

// 최종 API_BASE: 항상 "/api"까지 포함되도록 보정
export const API_BASE = (() => {
  if (RAW_URL) return `${RAW_URL}/api`;
  if (RAW_BASE) return RAW_BASE.endsWith("/api") ? RAW_BASE : `${RAW_BASE}/api`;
  return "/api";
})();

/** ----- 공통 요청 ----- */
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`API ${path} failed: ${res.status} ${msg}`);
  }
  return res.json() as Promise<T>;
}

/** 헬스체크 */
export async function ping() {
  return request(`/health`);
}

/** 포켓몬 프록시 */
export async function getPokemon(id: number) {
  return request(`/pokemon/${id}`);
}

/** ----- AI 채팅 ----- */
/* 권장: 새로운 엔드포인트 */
export async function askAI(message: string, userId?: string | null) {
  return request(`/ai-chat/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, user_id: userId ?? null }),
  });
}

/* 호환: 기존 컴포넌트가 sendChat을 호출해도 자동으로 /ai-chat/ask로 보냄 */
export async function sendChat(user_id: string | null, message: string) {
  try {
    return await request(`/ai-chat/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, message }),
    });
  } catch (e: any) {
    // 혹시 백엔드가 구버전일 때 404면 /chat로 폴백
    if (String(e?.message || "").includes("404")) {
      return request(`/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, message }),
      });
    }
    throw e;
  }
}
