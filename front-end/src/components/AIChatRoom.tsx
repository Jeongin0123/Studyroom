// src/components/AIChatRoom.tsx
import { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Bot, Send } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { askAI } from "../lib/api"; // ✅ 백엔드 호출은 api.ts 통해서만

type Msg = { role: "user" | "assistant"; text: string; ts: string };

export default function AIChatRoom() {
  // 방 안에서 들어올 수도 있으니 roomId 옵셔널
  const { roomId } = useParams();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // 스크롤 하단 고정
  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const now = new Date().toISOString();
    const userMsg: Msg = { role: "user", text, ts: now };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // ✅ 백엔드 최종 엔드포인트: /ai-chat/ask (api.ts 내부에서 처리)
      //    백엔드 스키마는 user_id(optional)이므로 roomId를 user_id로 전달
      const res = await askAI(text, roomId ?? null);
      const reply = (res as any)?.reply ?? "(응답이 비어 있습니다)";
      const aiMsg: Msg = { role: "assistant", text: reply, ts: new Date().toISOString() };
      setMessages((m) => [...m, aiMsg]);
    } catch (e: any) {
      const errText =
        "서버와 통신 중 오류가 발생했어요. 잠시 후 다시 시도해주세요." +
        (e?.message ? `\n[디버그] ${e.message}` : "");
      setMessages((m) => [...m, { role: "assistant", text: errText, ts: new Date().toISOString() }]);
      console.error("[AIChatRoom] send failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-semibold">
            <Bot className="w-5 h-5" />
            AI 채팅방 {roomId ? `(#${roomId})` : ""}
          </div>
          <Link to="/studyroom">
            <Button variant="outline">스터디룸으로 돌아가기</Button>
          </Link>
        </div>

        <Card className="h-[70vh] p-4 flex flex-col">
          <div ref={scrollerRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground">
                무엇이든 질문해 보세요. (예: “SQL JOIN 차이 설명해줘”, “FastAPI 라우팅 예시”)
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <div
                  className={`inline-block max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 ${
                    m.role === "user" ? "bg-indigo-600 text-white" : "bg-white border"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-sm text-muted-foreground">AI가 작성 중…</div>}
          </div>

          <div className="mt-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="AI에게 물어보세요"
              disabled={loading}
            />
            <Button onClick={send} disabled={loading || !input.trim()}>
              <Send className="w-4 h-4 mr-1" />
              보내기
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
