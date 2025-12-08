import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { usePage } from "./PageContext";

interface ChatMessage {
  id: number;
  nickname: string;
  message: string;
  isMe: boolean;
}

interface RightPanelProps {
  onOpenAiChat?: () => void;
}

export function RightPanel({ onOpenAiChat }: RightPanelProps) {
  const { setCurrentPage } = usePage();
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, nickname: "피카츄123", message: "안녕하세요!", isMe: false },
    { id: 2, nickname: "라이츄999", message: "반가워요~", isMe: true },
    { id: 3, nickname: "파이리456", message: "오늘도 화이팅!", isMe: false },
    { id: 4, nickname: "라이츄999", message: "네! 열심히 공부해요", isMe: true },
  ]);

  const myNickname = "라이츄999";

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatMessages([
        ...chatMessages,
        {
          id: chatMessages.length + 1,
          nickname: myNickname,
          message: message.trim(),
          isMe: true,
        },
      ]);
      setMessage("");
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-blue-50 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 p-5 flex flex-col min-h-0">
      {/* 채팅 메시지 영역 (고정, 스크롤) */}
      <div className="flex-1 min-h-0 overflow-hidden mb-3 pb-4">
        <div className="text-sm text-blue-700 mb-2">채팅</div>
        <ScrollArea className="h-full bg-white/50 backdrop-blur-sm rounded-2xl p-3 border border-blue-100" type="always">
          <div className="space-y-3 pr-1 min-h-0">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] ${msg.isMe
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl rounded-br-sm"
                      : "bg-white/90 text-blue-900 rounded-2xl rounded-bl-sm"
                    } px-3 py-2 shadow-md`}
                >
                  {!msg.isMe && (
                    <div className="text-xs text-purple-600 mb-1">
                      {msg.nickname}
                    </div>
                  )}
                  <div className="text-sm">{msg.message}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* 채팅 입력 영역 */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="텍스트 입력 ..."
            className="flex-1 bg-white/80 backdrop-blur-sm border-blue-200 rounded-full focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-md px-4 py-2.5"
          />

          <Button
            type="button"
            onClick={handleSendMessage}
            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-md transition-all hover:shadow-lg p-0 flex items-center justify-center"
          >
            <Send className="h-4 w-4" />
          </Button>

          <div className="relative group">
            <Button
              type="button"
              onClick={onOpenAiChat}
              className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-full shadow-md transition-all hover:shadow-lg p-0 flex items-center justify-center"
            >
              AI
            </Button>
            <div className="absolute right-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-lime-400 text-white text-sm font-semibold rounded-2xl px-3 py-2 shadow-lg text-left whitespace-nowrap">
                스터디몬 자체 AI에게 무엇이든 물어보세요!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
