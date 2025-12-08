// import { useEffect, useRef } from "react";

// export default function RemoteVideo({ stream }: { stream: MediaStream }) {
//   const ref = useRef<HTMLVideoElement>(null);

//   useEffect(() => {
//     if (!ref.current) return;
//     ref.current.srcObject = stream;
//   }, [stream]);

//   return <video ref={ref} autoPlay playsInline className="rounded-xl" />;
// }

// src/components/RemoteVideo.tsx

// import { useEffect, useRef } from "react";
// import WebcamView from '../WebCamView'

// interface RemoteVideoProps {
//   stream: MediaStream;
// }

// export default function RemoteVideo({ stream }: RemoteVideoProps) {
//   const videoRef = useRef<HTMLVideoElement>(null);

//   useEffect(() => {
//     if (videoRef.current) {
//       videoRef.current.srcObject = stream;
//       videoRef.current.play().catch((err) => console.error("Video play error:", err));
//     }
//   }, [stream]);

//     return <WebcamView showMicPanel={false} stream={stream} />;
// }

// ...existing code...
import { useEffect, useRef } from "react";

type Props = {
  stream: MediaStream | MediaStreamTrack | { stream?: MediaStream; id?: string } | any;
  label?: string;
};

export default function RemoteVideo({ stream: raw, label }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  console.log("remoteVideo raw data", raw)

  useEffect(() => {
    if (!videoRef.current) return;

    // 정규화: MediaStream | MediaStreamTrack -> MediaStream
    let stream: MediaStream | null = null;
    try {
      if (raw instanceof MediaStream) {
        stream = raw;
      } else if (typeof MediaStreamTrack !== "undefined" && raw instanceof MediaStreamTrack) {
        stream = new MediaStream([raw]);
      } else if (raw && raw.stream instanceof MediaStream) {
        stream = raw.stream;
      } else if (raw && Array.isArray(raw) && raw[0] instanceof MediaStreamTrack) {
        stream = new MediaStream(raw);
      }
    } catch {
      stream = null;
    }

    if (!stream) return;

    const v = videoRef.current!;
    // srcObject 바인딩
    if (v.srcObject !== stream) v.srcObject = stream;

    // autoplay 시 브라우저 정책으로 재생이 막힐 수 있어 play() 시도
    const p = v.play?.().catch(() => {
      // 자동 재생 차단 시 무시 — 사용자 인터랙션이 필요함
    });

    return () => {
      // 언마운트 시 video.srcObject 해제 (스트림 자체는 다른 곳에서 관리)
      if (videoRef.current) {
        try {
          (videoRef.current as HTMLVideoElement).srcObject = null;
        } catch {}
      }
    };
  }, [raw]);

  return (
    <div className="relative w-48 h-36 bg-black rounded overflow-hidden border">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        // muted// 원격 비디오라면 muted를 false로 둡니다. 필요 시 muted 추가 가능.
        className="w-full h-full object-cover"
      />
      {label && (
        <div className="absolute left-1 bottom-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
          {label}
        </div>
      )}
    </div>
  );
}
