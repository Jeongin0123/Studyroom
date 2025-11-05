import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Send } from "lucide-react";

interface Message {
  id: number;
  sender: string;
  text: string;
  timestamp: Date;
  isMe: boolean;
}

type AskAIResponse = { conversation_id: number; reply: string };

// ✅ 프록시 경로 기본값: vite.config.ts에서 '/api' → 8000 으로 전달
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE?.toString() || "/api";

async function askAI(message: string, roomId: string): Promise<AskAIResponse> {
  let data: any = null;
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // ⚠ credentials 불필요: 프록시 환경에서 CORS 충돌 유발 가능
      body: JSON.stringify({ user_id: `room-${roomId}`, message }),
    });

    // 응답 JSON이 아닐 수도 있으므로 방어
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      const reason =
        data?.error || data?.detail || `HTTP ${res.status}`;
      throw new Error(reason);
    }
    return data as AskAIResponse;
  } catch (err: any) {
    // 네트워크 에러 메시지를 통일
    const msg =
      err?.message?.includes("Failed to fetch")
        ? "서버에 연결할 수 없습니다 (proxy /api 확인)."
        : err?.message || "AI 서버 오류";
    throw new Error(msg);
  }
}

export default function ChatPanel({ roomId = "global" }: { roomId?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "김철수",
      text: "안녕하세요! 함께 열심히 공부해봐요",
      timestamp: new Date(Date.now() - 300000),
      isMe: false,
    },
    {
      id: 2,
      sender: "이영희",
      text: "화이팅!",
      timestamp: new Date(Date.now() - 180000),
      isMe: false,
    },
    {
      id: 3,
      sender: "나",
      text: "다들 열심히 하시네요 ㅎㅎ",
      timestamp: new Date(Date.now() - 120000),
      isMe: true,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 새 메시지 올 때 맨 아래로 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

  // 사람끼리 채팅 (데모용 - 기존 로직 유지)
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const mine: Message = {
      id: messages.length + 1,
      sender: "나",
      text: inputText,
      timestamp: new Date(),
      isMe: true,
    };
    setMessages((prev) => [...prev, mine]);
    setInputText("");

    // 데모용 가짜 응답
    setTimeout(() => {
      const responses = [
        "좋은 생각이에요!",
        "저도 동의합니다",
        "화이팅!",
        "잠시 쉬었다 올게요",
        "집중 모드 시작!",
      ];
      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];
      const randomUser = ["김철수", "이영희", "박민수"][
        Math.floor(Math.random() * 3)
      ];
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: randomUser,
          text: randomResponse,
          timestamp: new Date(),
          isMe: false,
        },
      ]);
    }, 1200);
  };

  // ✅ AI에게 물어보기 (백엔드 /api/chat 호출)
  const handleAskAI = async () => {
    if (!inputText.trim() || loadingAI) return;
    const question = inputText;
    setInputText("");
    setLoadingAI(true);

    // 내 질문 표시
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        sender: "나(질문→AI)",
        text: question,
        timestamp: new Date(),
        isMe: true,
      },
    ]);

    try {
      const { reply } = await askAI(question, roomId);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "AI",
          text: reply,
          timestamp: new Date(),
          isMe: false,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "시스템",
          text: `⚠️ AI 호출 오류: ${err?.message ?? "알 수 없는 오류"}`,
          timestamp: new Date(),
          isMe: false,
        },
      ]);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <Card className="p-6 h-full flex flex-col">
      <h3 className="mb-4">채팅</h3>

      <ScrollArea className="flex-1 pr-4 mb-4">
        <div ref={scrollRef} className="space-y-3 max-h-full overflow-y-auto">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.isMe ? "items-end" : "items-start"}`}
            >
              {!m.isMe && (
                <span className="text-sm text-gray-600 mb-1">{m.sender}</span>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  m.isMe
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{m.text}</p>
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {formatTime(m.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          placeholder="메시지를 입력하세요..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" title="보내기" disabled={loadingAI}>
          <Send className="w-4 h-4" />
        </Button>
        <Button type="button" onClick={handleAskAI} disabled={loadingAI}>
          {loadingAI ? "AI 생각 중…" : "AI에게 물어보기"}
        </Button>
      </form>
    </Card>
  );
}
