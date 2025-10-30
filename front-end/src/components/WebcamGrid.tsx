// src/components/WebcamGrid.tsx
import { Card } from './ui/card';
import { Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import WebcamView from '../WebcamView'; // ✅ 내 카메라 미리보기

interface Participant {
  id: number;
  name: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  image: string;
}

export function WebcamGrid() {
  const [myVideo, setMyVideo] = useState(true);
  const [myAudio, setMyAudio] = useState(true);

  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 1,
      name: '나',
      isVideoOn: true,
      isAudioOn: true,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      name: '김철수',
      isVideoOn: true,
      isAudioOn: true,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      name: '이영희',
      isVideoOn: true,
      isAudioOn: false,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=300&fit=crop'
    },
    {
      id: 4,
      name: '박민수',
      isVideoOn: false,
      isAudioOn: true,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop'
    }
  ]);

  return (
    <Card className="p-6 h-full flex flex-col">
      <h3 className="mb-4">참여자 ({participants.length}명)</h3>

      {/* 그리드 타일 */}
      <div className="flex-1 grid grid-cols-2 gap-3 mb-4">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden"
          >
            {/* ✅ id===1(나) 이고 비디오 ON이면 실제 카메라 */}
            {participant.id === 1 && participant.isVideoOn ? (
              <div className="w-full h-full">
                <WebcamView />
              </div>
            ) : participant.isVideoOn ? (
              <img
                src={participant.image}
                alt={participant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <VideoOff className="w-8 h-8 text-gray-400" />
              </div>
            )}

            {/* 라벨/마이크 상태 */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                {participant.name}
              </span>
              <div className="bg-black/50 px-2 py-1 rounded">
                {participant.isAudioOn ? (
                  <Mic className="w-4 h-4 text-white" />
                ) : (
                  <MicOff className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 내 비디오/오디오 토글 */}
      <div className="flex gap-2 justify-center pt-4 border-t">
        <Button
          variant={myVideo ? 'default' : 'destructive'}
          size="sm"
          onClick={() => {
            setMyVideo((prev) => !prev);
            setParticipants((prev) =>
              prev.map((p) =>
                p.id === 1 ? { ...p, isVideoOn: !myVideo } : p
              )
            );
          }}
        >
          {myVideo ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </Button>

        <Button
          variant={myAudio ? 'default' : 'destructive'}
          size="sm"
          onClick={() => {
            setMyAudio((prev) => !prev);
            setParticipants((prev) =>
              prev.map((p) =>
                p.id === 1 ? { ...p, isAudioOn: !myAudio } : p
              )
            );
          }}
        >
          {myAudio ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </Button>
      </div>
    </Card>
  );
}
