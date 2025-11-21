import { Send, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

export function ChatArea() {
  const [message, setMessage] = useState("");

  return (
    <div className="mt-auto space-y-3">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="텍스트 입력 ..."
        className="w-full bg-gradient-to-r from-pink-50/90 to-purple-50/90 backdrop-blur-sm border-pink-200 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-transparent"
      />
      
      <div className="flex items-center gap-3">
        <Button 
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-2xl shadow-md transition-all hover:shadow-lg"
        >
          전송
        </Button>
        
        <Button 
          className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-2xl shadow-md transition-all hover:shadow-lg px-8"
        >
          AI
        </Button>
      </div>
    </div>
  );
}