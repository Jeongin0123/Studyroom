import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { usePage } from "./PageContext";

interface ChatMessage {
  id: number;
  nickname: string;
  message: string;
  isMe: boolean;
}

export function RightPanel() {
  const { setCurrentPage } = usePage();
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, nickname: "피카츄123", message: "안녕하세요!", isMe: false },
    { id: 2, nickname: "라이츄999", message: "반가워요~", isMe: true },
    { id: 3, nickname: "파이리456", message: "오늘도 화이팅!", isMe: false },
    { id: 4, nickname: "라이츄999", message: "네! 열심히 공부해요", isMe: true },
  ]);

  const myNickname = "라이츄999";

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
    <div className="h-full bg-gradient-to-br from-pink-100/80 via-purple-100/80 to-violet-100/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-200/50 p-6 flex flex-col">
      {/* 채팅 메시지 영역 */}
      <div className="flex-1 min-h-0 mb-4">
        <div className="text-sm text-purple-600 mb-3">채팅</div>
        <ScrollArea className="h-full bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-pink-200/50">
          <div className="space-y-3">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] ${msg.isMe
                      ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-2xl rounded-br-sm"
                      : "bg-white/90 text-purple-900 rounded-2xl rounded-bl-sm"
                    } px-4 py-2 shadow-md`}
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
          </div>
        </ScrollArea>
      </div>

      {/* 채팅 입력 영역 */}
      <div className="space-y-3">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="텍스트 입력 ..."
          className="w-full bg-white/80 backdrop-blur-sm border-pink-200 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-transparent shadow-md"
        />

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSendMessage}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-2xl shadow-md transition-all hover:shadow-lg"
          >
            <Send className="mr-2 h-4 w-4" />
            전송
          </Button>

          <Button
            onClick={() => setCurrentPage('ai_chat')}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-full shadow-md transition-all hover:shadow-lg w-12 h-12 p-0 flex items-center justify-center"
          >
            AI
          </Button>
        </div>
      </div>
    </div>
  );
}