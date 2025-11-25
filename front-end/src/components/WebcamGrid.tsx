import { Video, Mic, MicOff } from "lucide-react";
import { useRef, useEffect, useState } from "react";

interface WebcamBoxProps {
  username: string;
  isMuted?: boolean;
  pokemonEmoji?: string;
  isMe?: boolean;
  onBattleRequest?: () => void;
}

function WebcamBox({ username, isMuted = false, pokemonEmoji = "🔴", isMe = false, onBattleRequest }: WebcamBoxProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isMe && videoRef.current) {
      // 내 웹캠 스트림 시작
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((mediaStream) => {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        })
        .catch((err) => {
          console.error("웹캠 접근 실패:", err);
        });
    }

    return () => {
      // 컴포넌트 언마운트 시 스트림 정리
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isMe]);

  return (
    <div className="relative bg-gradient-to-br from-pink-50/90 to-purple-50/90 backdrop-blur-sm rounded-3xl shadow-lg border border-pink-200/50 overflow-hidden aspect-video flex items-center justify-center">
      {isMe ? (
        // 내 웹캠 표시
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        // 다른 참가자는 포켓몬 이모지 표시
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 to-purple-100/20"></div>
          <div className="relative z-10 flex flex-col items-center justify-center gap-3">
            <div className="text-6xl">{pokemonEmoji}</div>
            <Video className="h-12 w-12 text-purple-400/50" />
          </div>
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-900/80 to-transparent p-4 z-20">
        <div className="flex items-center justify-between">
          <span className="text-white drop-shadow-md">{username}</span>
          {isMuted ? (
            <MicOff className="h-4 w-4 text-red-400" />
          ) : (
            <Mic className="h-4 w-4 text-green-400" />
          )}
        </div>
      </div>

      {/* 배틀 신청 버튼 (나 자신이 아닐 때만 표시) */}
      {!isMe && (
        <button
          onClick={onBattleRequest}
          className="absolute bottom-16 right-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg hover:scale-105 transition-transform z-30 flex items-center gap-1"
        >
          <span>⚔️</span>
          배틀 신청
        </button>
      )}
    </div>
  );
}

interface WebcamGridProps {
  onBattleRequest?: (targetId: number) => void;
}

export function WebcamGrid({ onBattleRequest }: WebcamGridProps) {
  const participants = [
    { id: 1, username: "나", pokemonEmoji: "⚡", isMe: true },
    { id: 2, username: "파이리456", pokemonEmoji: "🔥", isMuted: true },
    { id: 3, username: "꼬부기789", pokemonEmoji: "💧" },
    { id: 4, username: "이상해씨101", pokemonEmoji: "🌱" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {participants.map((participant) => (
        <WebcamBox
          key={participant.id}
          username={participant.username}
          isMuted={participant.isMuted}
          pokemonEmoji={participant.pokemonEmoji}
          isMe={participant.isMe}
          onBattleRequest={() => onBattleRequest?.(participant.id)}
        />
      ))}
    </div>
  );
}
