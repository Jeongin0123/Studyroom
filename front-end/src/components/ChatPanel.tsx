// src/components/ChatPanel.tsx
import { useEffect, useRef, useState } from "react";
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

/**
 * ✅ 사람 채팅 전용 패널
 *  - AI 호출/버튼 제거 (AI는 /ai-chat 전용 페이지에서 사용)
 *  - Enter = 전송, Shift+Enter = 줄바꿈
 *  - 새 메시지 도착 시 자동 스크롤
 *  - 이후 실제 서버/소켓 붙일 때는 send() 내부만 교체하면 됨
 */
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // 새 메시지 올 때 맨 아래로 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

  // 사람끼리 채팅 (현재는 로컬 상태 데모)
  const send = () => {
    const text = inputText.trim();
    if (!text) return;

    const mine: Message = {
      id: messages.length + 1,
      sender: "나",
      text,
      timestamp: new Date(),
      isMe: true,
    };
    setMessages((prev) => [...prev, mine]);
    setInputText("");

    // 데모용 랜덤 응답 (서버/소켓 연결 시 제거)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send();
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
                  m.isMe ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
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

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="메시지를 입력하세요..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          className="flex-1"
        />
        <Button type="submit" size="icon" title="보내기">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
}
