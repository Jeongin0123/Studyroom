// front-end/src/lib/ai.ts
export async function askAI(message: string, roomId: string) {
  const res = await fetch("http://localhost:8001/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: `room-${roomId}`, // 방 단위 대화 유지
      message,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "AI 서버 오류 발생");
  }

  return res.json() as Promise<{ conversation_id: number; reply: string }>;
}
