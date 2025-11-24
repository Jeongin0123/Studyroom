import { useState } from "react";
import { X, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

interface Message {
    id: string;
    content: string;
    sender: "ai" | "user";
    timestamp: Date;
}

interface AiChatPageProps {
    onClose?: () => void;
}

export function AiChatPage({ onClose }: AiChatPageProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            content: "안녕하세요! 저는 AI 어시스턴트입니다. 무엇을 도와드릴까요?",
            sender: "ai",
            timestamp: new Date(),
        },
        {
            id: "2",
            content: "안녕하세요! 오늘 날씨 어때요?",
            sender: "user",
            timestamp: new Date(),
        },
        {
            id: "3",
            content: "오늘은 맑고 화창한 날씨입니다. 산책하기 좋은 날이에요! 🌤️",
            sender: "ai",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState("");

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            content: inputValue,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages([...messages, newMessage]);
        setInputValue("");

        // AI 응답 시뮬레이션
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                content: "메시지를 잘 받았습니다! 곧 답변 드리겠습니다.",
                sender: "ai",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiResponse]);
        }, 1000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
            <div className="w-full max-w-3xl h-[600px] bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col">
                {/* 헤더 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
                    <h1 className="text-gray-800">AI 채팅방</h1>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/50 rounded-full transition-colors"
                        aria-label="닫기"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* 채팅 메시지 영역 */}
                <ScrollArea className="flex-1 px-6 py-4">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex flex-col ${message.sender === "user" ? "items-end" : "items-start"
                                    }`}
                            >
                                <span className="text-sm text-gray-500 mb-1 px-1">
                                    {message.sender === "ai" ? "AI" : "내 닉네임"}
                                </span>
                                <div
                                    className={`max-w-[70%] px-4 py-3 rounded-2xl ${message.sender === "ai"
                                            ? "bg-gradient-to-br from-gray-100 to-gray-50 text-gray-800 rounded-tl-sm"
                                            : "bg-gradient-to-br from-pink-200 to-purple-200 text-gray-800 rounded-tr-sm"
                                        }`}
                                >
                                    <p className="break-words">{message.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* 입력 영역 */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-pink-50/30 to-purple-50/30">
                    <div className="flex gap-3 items-center">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="메시지를 입력하세요..."
                            className="flex-1 bg-white border-gray-200 rounded-2xl px-4 py-6 focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all"
                        />
                        <Button
                            onClick={handleSendMessage}
                            className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl px-6 py-6 shadow-md hover:shadow-lg transition-all"
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
