import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Send } from 'lucide-react';

interface Message {
  id: number;
  sender: string;
  text: string;
  timestamp: Date;
  isMe: boolean;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: '김철수',
      text: '안녕하세요! 함께 열심히 공부해봐요',
      timestamp: new Date(Date.now() - 300000),
      isMe: false
    },
    {
      id: 2,
      sender: '이영희',
      text: '화이팅!',
      timestamp: new Date(Date.now() - 180000),
      isMe: false
    },
    {
      id: 3,
      sender: '나',
      text: '다들 열심히 하시네요 ㅎㅎ',
      timestamp: new Date(Date.now() - 120000),
      isMe: true
    }
  ]);

  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      sender: '나',
      text: inputText,
      timestamp: new Date(),
      isMe: true
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate other users responding
    setTimeout(() => {
      const responses = [
        '좋은 생각이에요!',
        '저도 동의합니다',
        '화이팅!',
        '잠시 쉬었다 올게요',
        '집중 모드 시작!'
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const randomUser = ['김철수', '이영희', '박민수'][Math.floor(Math.random() * 3)];
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        sender: randomUser,
        text: randomResponse,
        timestamp: new Date(),
        isMe: false
      }]);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="p-6 h-full flex flex-col">
      <h3 className="mb-4">채팅</h3>
      
      <ScrollArea className="flex-1 pr-4 mb-4" ref={scrollRef}>
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${message.isMe ? 'items-end' : 'items-start'}`}
            >
              {!message.isMe && (
                <span className="text-sm text-gray-600 mb-1">{message.sender}</span>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.isMe
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {formatTime(message.timestamp)}
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
        <Button type="submit" size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
}
