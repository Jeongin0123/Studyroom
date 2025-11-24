import { AlertCircle, Eye } from "lucide-react";

export function StatusArea() {
  return (
    <div className="bg-gradient-to-r from-pink-50/90 via-purple-50/90 to-violet-50/90 backdrop-blur-sm rounded-3xl shadow-lg border border-pink-200/50 p-6">
      <div className="flex items-center justify-between">
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
          ###졸음관련###
        </div>
        
        <div className="text-6xl">🌸</div>
      </div>
    </div>
  );
}