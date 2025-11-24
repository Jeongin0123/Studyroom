import { LogOut } from "lucide-react";
import { Button } from "./ui/button";

export function StudyRoomHeader() {
  return (
    <header className="flex items-center justify-center px-8 py-6">
      <div className="flex items-center justify-center gap-3">
        <div className="text-3xl">⚡</div>
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-violet-600">
          스터디몬
        </h1>
        <div className="text-3xl">⚡</div>
      </div>
    </header>
  );
}