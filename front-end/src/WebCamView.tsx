// src/WebcamView.tsx
import { useEffect, useRef, useState } from "react";

type Cam = { deviceId: string; label: string };

export default function WebcamView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [error, setError] = useState("");
  const [cams, setCams] = useState<Cam[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // ▶︎ 녹화/일시정지/공유 상태
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [paused, setPaused] = useState(false);

  async function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function start(deviceId?: string) {
    try {
      setError("");
      await stopStream();

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : {
              facingMode: "user",
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30, max: 30 },
            },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // 장치 목록 갱신 (권한 승인 후 라벨이 채워짐)
      const devs = await navigator.mediaDevices.enumerateDevices();
      const list = devs
        .filter((d) => d.kind === "videoinput")
        .map((d) => ({ deviceId: d.deviceId, label: d.label || "Camera" }));
      setCams(list);

      if (deviceId) setCurrentId(deviceId);
    } catch (e: any) {
      setError(`${e.name}: ${e.message}`);
    }
  }

  useEffect(() => {
    start(); // 최초 시작
    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 📸 캡처 저장
  function handleCapture() {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(v, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `capture-${Date.now()}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
      },
      "image/jpeg",
      0.92
    );
  }

  // ⏺️ 녹화 시작/정지
  function startRecording() {
    if (typeof MediaRecorder === "undefined") {
      alert("이 브라우저는 MediaRecorder를 지원하지 않습니다.");
      return;
    }
    const stream = streamRef.current;
    if (!stream) return;

    const rec = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
    chunksRef.current = [];
    rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `record-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    };
    rec.start();
    recorderRef.current = rec;
    setIsRecording(true);
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setIsRecording(false);
  }

  // ⏸️ CPU 절약용 일시정지/재개 (인코딩 중지)
  function togglePause() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setPaused((p) => !p);
  }

  // 🖥️ 화면 공유 (끝나면 카메라로 복귀)
  async function shareScreen() {
    try {
      // @ts-ignore
      const display: MediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      streamRef.current = display;
      if (videoRef.current) {
        videoRef.current.srcObject = display;
        await videoRef.current.play().catch(() => {});
      }
      display.getVideoTracks()[0].addEventListener("ended", () => {
        start(currentId || undefined);
      });
    } catch (e: any) {
      setError(`${e.name}: ${e.message}`);
    }
  }

  return (
    <div className="flex flex-col gap-3 items-center w-full h-full">
      {/* 컨트롤 바 */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          className="border rounded px-2 py-1"
          value={currentId ?? ""}
          onChange={(e) => start(e.target.value || undefined)}
        >
          <option value="">{cams.length ? "기본 카메라" : "카메라 탐색 중…"}</option>
          {cams.map((c) => (
            <option key={c.deviceId} value={c.deviceId}>
              {c.label}
            </option>
          ))}
        </select>

        <button className="border rounded px-3 py-1" onClick={() => start(currentId || undefined)}>
          재시작
        </button>

        <button className="border rounded px-3 py-1" onClick={handleCapture} disabled={!streamRef.current}>
          캡처 저장
        </button>

        <button
          className="border rounded px-3 py-1"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!streamRef.current}
        >
          {isRecording ? "녹화 중지" : "녹화 시작"}
        </button>

        <button className="border rounded px-3 py-1" onClick={togglePause} disabled={!streamRef.current}>
          {paused ? "영상 재개" : "영상 일시정지"}
        </button>

        <button className="border rounded px-3 py-1" onClick={shareScreen}>
          화면 공유
        </button>
      </div>

      {/* 비디오 영역 (타일에 꽉 차게) */}
      <div className="w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="rounded-xl shadow bg-black w-full h-full object-cover"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
