// src/WebcamView.tsx
import { useEffect, useRef, useState } from "react";

type Cam = { deviceId: string; label: string };

export default function WebcamView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [cams, setCams] = useState<Cam[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function stopStream() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }

  async function start(deviceId?: string) {
    try {
      setError("");
      await stopStream();
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      // 장치 목록
      const devs = await navigator.mediaDevices.enumerateDevices();
      const list = devs
        .filter(d => d.kind === "videoinput")
        .map(d => ({ deviceId: d.deviceId, label: d.label || "Camera" }));
      setCams(list);
      if (deviceId) setCurrentId(deviceId);
    } catch (e: any) {
      setError(`${e.name}: ${e.message}`);
    }
  }

  useEffect(() => {
    start(); // 최초 시작
    return () => { stopStream(); };
  }, []);

  // 캡처
  function handleCapture() {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(v, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `capture-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/jpeg", 0.92);
  }

  return (
    <div className="flex flex-col gap-3 items-center">
      <div className="flex gap-2 items-center">
        <select
          className="border rounded px-2 py-1"
          value={currentId ?? ""}
          onChange={(e) => start(e.target.value || undefined)}
        >
          <option value="">{cams.length ? "기본 카메라" : "카메라 탐색 중…"}</option>
          {cams.map(c => (
            <option key={c.deviceId} value={c.deviceId}>{c.label}</option>
          ))}
        </select>
        <button className="border rounded px-3 py-1" onClick={() => start(currentId || undefined)}>
          재시작
        </button>
        <button className="border rounded px-3 py-1" onClick={handleCapture}>
          캡처 저장
        </button>
      </div>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded-xl shadow bg-black w-[640px] h-[360px]"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
