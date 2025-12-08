import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

export interface ChatMessage {
    id: string;
    content: string;
    sender: "ai" | "user";
    timestamp: Date;
}

interface AiChatPageProps {
    onClose?: () => void;
    variant?: "page" | "modal";
    messages?: ChatMessage[];
    onSend?: (text: string) => void;
}

export function AiChatPage({ onClose, variant = "page", messages, onSend }: AiChatPageProps) {
    const [inputValue, setInputValue] = useState("");
    const [localMessages, setLocalMessages] = useState<ChatMessage[]>(() => {
        if (messages && messages.length) return messages;
        return [
            {
                id: "1",
                content: "안녕하세요! 스터디몬 AI입니다. 무엇을 도와드릴까요?",
                sender: "ai",
                timestamp: new Date(),
            },
        ];
    });

    const activeMessages = messages ?? localMessages;
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleSendMessage = () => {
        const text = inputValue.trim();
        if (!text) return;

        if (onSend) {
            onSend(text);
        } else {
            const userMsg: ChatMessage = {
                id: `${Date.now()}`,
                content: text,
                sender: "user",
                timestamp: new Date(),
            };
            const aiMsg: ChatMessage = {
                id: `${Date.now() + 1}`,
                content: "답변을 받아오지 못했습니다.",
                sender: "ai",
                timestamp: new Date(),
            };
            setLocalMessages((prev) => [...prev, userMsg, aiMsg]);
        }

        setInputValue("");
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [activeMessages]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const content = (
        <div className="w-full max-w-3xl h-[80vh] max-h-[80vh] bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50 sticky top-0 z-10">
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
            <ScrollArea className="flex-1 px-6 py-4 overflow-y-auto">
                <div className="space-y-4">
                    {activeMessages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex flex-col ${message.sender === "user" ? "items-end" : "items-start"}`}
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
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* 입력 영역 */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-blue-50/40 to-cyan-50/40">
                <div className="flex gap-3 items-center">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="메시지를 입력하세요..."
                        className="flex-1 bg-white border-gray-200 rounded-2xl px-4 py-6 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                    />
                    <Button
                        onClick={handleSendMessage}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl px-6 py-6 shadow-md hover:shadow-lg transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );

    if (variant === "modal") {
        return (
            <div className="w-full h-full flex items-center justify-center">
                {content}
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
            {content}
        </div>
    );
}
