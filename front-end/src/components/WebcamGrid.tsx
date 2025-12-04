import { Video, Mic, MicOff, Camera, RefreshCw } from "lucide-react";
import { useRef, useEffect, useState } from "react";

// ── Types from WebcamView ──
type Cam = { deviceId: string; label: string };
type MicDevice = { deviceId: string; label: string };

const CAM_OFF = "__OFF__CAM__";
const MIC_OFF = "__OFF__MIC__";


interface WebcamBoxProps {
  username: string;
  isMuted?: boolean;
  pokemonEmoji?: string;
  isMe?: boolean;
  showBattleRequest?: boolean;
  onBattleRequest?: () => void;
  onDrowsinessDetected?: (result: string) => void;
}

function WebcamBox({
  username,
  isMuted = false,
  pokemonEmoji = "🔴",
  isMe = false,
  showBattleRequest = true,
  onBattleRequest,
  onDrowsinessDetected
}: WebcamBoxProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ── WebcamView State (Only used if isMe) ──
  const [cams, setCams] = useState<Cam[]>([]);
  const [mics, setMics] = useState<MicDevice[]>([]);
  const [currentCamId, setCurrentCamId] = useState<string | null>(null);
  const [currentMicId, setCurrentMicId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Mic Level
  const [micEnabled, setMicEnabled] = useState(true);
  const [micLevel, setMicLevel] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  // Mic Test
  const recRef = useRef<MediaRecorder | null>(null);
  const recChunksRef = useRef<BlobPart[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testUrl, setTestUrl] = useState<string | null>(null);

  // ── Helper Functions ──

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    stopMeter();
  }

  function startMeter(stream: MediaStream) {
    try {
      const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      const ctx = new AC();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;

      const src = ctx.createMediaStreamSource(stream);
      src.connect(analyser);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const buf = new Uint8Array(analyser.fftSize);
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        setMicLevel(Math.min(100, Math.max(0, Math.round(rms * 140))));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // Ignore errors
    }
  }

  function stopMeter() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try {
      audioCtxRef.current?.close();
    } catch { }
    audioCtxRef.current = null;
    analyserRef.current = null;
    setMicLevel(0);
  }

  async function bindToVideo(stream: MediaStream) {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
    try {
      await videoRef.current.play();
    } catch {
      // Ignore autoplay errors
    }
  }

  async function refreshDevices() {
    const devs = await navigator.mediaDevices.enumerateDevices();
    const camList = devs
      .filter((d) => d.kind === "videoinput")
      .map((d) => ({ deviceId: d.deviceId, label: d.label || "Camera" }));
    const micList = devs
      .filter((d) => d.kind === "audioinput")
      .map((d) => ({ deviceId: d.deviceId, label: d.label || "Microphone" }));
    setCams(camList);
    setMics(micList);
  }

  async function start(camId?: string | null, micId?: string | null) {
    if (!isMe) return; // Only for me

    try {
      setError("");
      const wantCam = camId ?? currentCamId ?? "";
      const wantMic = micId ?? currentMicId ?? "";

      stopStream();

      const wantVideo = !wantCam || wantCam === CAM_OFF
        ? false
        : { deviceId: { exact: wantCam } as const };
      const wantAudio = !wantMic || wantMic === MIC_OFF
        ? false
        : { deviceId: { exact: wantMic } as const };

      const constraints: MediaStreamConstraints = {
        video: wantVideo === false
          ? false
          : wantCam
            ? wantVideo
            : { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, // Adjusted for grid
        audio: wantAudio === false ? false : wantMic ? wantAudio : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      await bindToVideo(stream);

      await refreshDevices();

      setCurrentCamId(wantCam || null);
      setCurrentMicId(wantMic || null);
      try {
        if (wantCam) localStorage.setItem("preferredCam", wantCam);
        if (wantMic) localStorage.setItem("preferredMic", wantMic);
      } catch { }

      if (stream.getAudioTracks().length) {
        setMicEnabled(true);
        startMeter(stream);
      } else {
        setMicEnabled(false);
        stopMeter();
      }
    } catch (e: any) {
      setError(`${e?.name || "Error"}: ${e?.message || "장치를 시작할 수 없습니다."}`);
    }
  }

  // ── Effects ──

  // ── Drowsiness Detection Loop ──
  useEffect(() => {
    if (!isMe || !onDrowsinessDetected) return;

    const interval = setInterval(async () => {
      if (!videoRef.current || !streamRef.current) return;

      try {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(videoRef.current, 0, 0);

        canvas.toBlob(async (blob) => {
          if (!blob) return;

          const formData = new FormData();
          formData.append("file", blob, "capture.jpg");

          try {
            const res = await fetch("http://localhost:8000/api/drowsiness/detect", {
              method: "POST",
              body: formData,
            });

            if (res.ok) {
              const data = await res.json();
              // data.result: "Normal" | "Sleepy" | "Yawn"
              onDrowsinessDetected(data.result);
            }
          } catch (err) {
            console.error("Drowsiness detection failed:", err);
          }
        }, "image/jpeg", 0.8);
      } catch (e) {
        console.error("Frame capture error:", e);
      }
    }, 1000); // 1초마다 감지

    return () => clearInterval(interval);
  }, [isMe, onDrowsinessDetected]);

  useEffect(() => {
    if (!isMe) return;

    const savedCam = localStorage.getItem("preferredCam") || "";
    const savedMic = localStorage.getItem("preferredMic") || "";

    (async () => {
      try {
        // Permission request
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        s.getTracks().forEach((t) => t.stop());
      } catch (e: any) {
        setError(`${e?.name || "Error"}: ${e?.message || "권한이 필요합니다."}`);
      } finally {
        await refreshDevices();
        await start(savedCam || null, savedMic || null);
      }
    })();

    const onChange = () => refreshDevices();
    navigator.mediaDevices?.addEventListener?.("devicechange", onChange);

    return () => {
      navigator.mediaDevices?.removeEventListener?.("devicechange", onChange);
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMe]);

  // ── Actions ──

  function toggleMic() {
    const s = streamRef.current;
    if (!s) return;
    const enabled = !micEnabled;
    s.getAudioTracks().forEach((t) => (t.enabled = enabled));
    setMicEnabled(enabled);
  }

  function handleCapture() {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(v, 0, 0);
    canvas.toBlob((b) => {
      if (!b) return;
      const url = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = url;
      a.download = `capture-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/jpeg", 0.92);
  }

  function startMicTest() {
    if (!streamRef.current) return;
    try {
      // @ts-ignore
      if (typeof MediaRecorder === "undefined") {
        setError("MediaRecorder 미지원");
        return;
      }
      const audioOnly = new MediaStream(streamRef.current.getAudioTracks());
      // @ts-ignore
      const rec = new MediaRecorder(audioOnly);
      recRef.current = rec;
      recChunksRef.current = [];
      setIsTesting(true);

      rec.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) recChunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(recChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        if (testUrl) URL.revokeObjectURL(testUrl);
        setTestUrl(url);
        setIsTesting(false);
      };

      rec.start();
      setTimeout(() => rec.stop(), 3000);
    } catch (err: any) {
      setIsTesting(false);
      setError(err?.message || "테스트 오류");
    }
  }

  function clearTestAudio() {
    if (testUrl) URL.revokeObjectURL(testUrl);
    setTestUrl(null);
  }

  return (
    <div className="relative bg-gradient-to-br from-yellow-50/90 via-sky-50/90 to-cyan-50/90 backdrop-blur-sm rounded-3xl shadow-lg border border-yellow-100/60 overflow-hidden aspect-video flex items-center justify-center group">
      {isMe ? (
        <>
          {/* 내 웹캠 표시 */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* ── Controls Overlay (Hover 시 표시) ── */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between z-20 pointer-events-none group-hover:pointer-events-auto">
            {/* Top: Device Selectors */}
            <div className="flex flex-col gap-2">
              <select
                className="h-8 rounded bg-white/90 text-xs px-2"
                value={currentCamId ?? ""}
                onChange={(e) => {
                  const id = e.target.value || null;
                  setCurrentCamId(id);
                  start(id, currentMicId);
                }}
              >
                <option value="">{cams.length ? "기본 카메라" : "카메라 찾는 중..."}</option>
                <option value={CAM_OFF}>카메라 끄기</option>
                {cams.map((c) => (
                  <option key={c.deviceId} value={c.deviceId}>{c.label}</option>
                ))}
              </select>

              <select
                className="h-8 rounded bg-white/90 text-xs px-2"
                value={currentMicId ?? ""}
                onChange={(e) => {
                  const id = e.target.value || null;
                  setCurrentMicId(id);
                  start(currentCamId, id);
                }}
              >
                <option value="">{mics.length ? "기본 마이크" : "마이크 찾는 중..."}</option>
                <option value={MIC_OFF}>마이크 끄기</option>
                {mics.map((m) => (
                  <option key={m.deviceId} value={m.deviceId}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Bottom: Actions & Meter */}
            <div className="flex flex-col gap-2 items-end">
              {/* Mic Meter */}
              {micEnabled && (
                <div className="flex items-center gap-2 bg-black/50 px-2 py-1 rounded-full">
                  <Mic className="w-3 h-3 text-white" />
                  <div className="w-20 h-1.5 bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400 transition-all duration-75"
                      style={{ width: `${micLevel}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={toggleMic}
                className={`p-2 rounded-full ${micEnabled ? 'bg-white/25 hover:bg-white/35' : 'bg-red-500 hover:bg-red-600'} text-white backdrop-blur-sm transition-colors`}
                  title="마이크 토글"
                >
                  {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleCapture}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors"
                  title="캡처"
                >
                  <Camera className="w-4 h-4" />
                </button>

                <button
                  onClick={startMicTest}
                  disabled={isTesting}
                  className={`p-2 rounded-full ${isTesting ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'} text-white backdrop-blur-sm transition-colors`}
                  title="마이크 테스트 (3초)"
                >
                  <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {testUrl && (
                <div className="flex items-center gap-2 bg-white/90 p-1 rounded-lg">
                  <audio src={testUrl} controls className="h-6 w-32" />
                  <button onClick={clearTestAudio} className="text-xs text-red-500 hover:text-red-700 px-1">삭제</button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm z-30">
              {error}
            </div>
          )}
        </>
      ) : (
        // 다른 참가자는 포켓몬 이모지 표시
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-cyan-100/20"></div>
          <div className="relative z-10 flex flex-col items-center justify-center gap-3">
            <div className="text-6xl text-blue-500">{pokemonEmoji}</div>
            <Video className="h-12 w-12 text-blue-400/60" />
          </div>
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/75 to-transparent p-4 z-20 pointer-events-none">
        <div className="flex items-center justify-between">
          <span className="text-white drop-shadow-md">{username}</span>
          {!isMe && (
            isMuted ? (
              <MicOff className="h-4 w-4 text-red-400" />
            ) : (
              <Mic className="h-4 w-4 text-green-400" />
            )
          )}
        </div>
      </div>

      {/* 배틀 신청 버튼 (나 자신이 아닐 때만 표시, 숨길 수 있음) */}
      {!isMe && showBattleRequest && (
        <button
          onClick={onBattleRequest}
          className="absolute bottom-16 right-4 bg-gradient-to-r from-blue-500 to-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg hover:scale-105 transition-transform z-30 flex items-center gap-1 pointer-events-auto"
        >
          
          배틀 신청
        </button>
      )}
    </div>
  );
}

interface WebcamGridProps {
  onBattleRequest?: (targetId: number) => void;
  onDrowsinessDetected?: (result: string) => void;
  showBattleRequest?: boolean;
}

export function WebcamGrid({ onBattleRequest, onDrowsinessDetected, showBattleRequest = true }: WebcamGridProps) {
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
          showBattleRequest={showBattleRequest}
          onBattleRequest={() => onBattleRequest?.(participant.id)}
          onDrowsinessDetected={participant.isMe ? onDrowsinessDetected : undefined}
        />
      ))}
    </div>
  );
}
