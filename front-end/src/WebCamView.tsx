// src/components/WebcamView.tsx
import { useEffect, useRef, useState } from "react";

type Cam = { deviceId: string; label: string };
type Mic = { deviceId: string; label: string };

type WebcamViewProps = {
  /** 미리보기에서만 마이크 패널을 보이고, 본 화면에선 숨기고 싶을 때 false */
  showMicPanel?: boolean; // default: true
};

const CAM_OFF = "__OFF__CAM__";
const MIC_OFF = "__OFF__MIC__";

export default function WebcamView({ showMicPanel = true }: WebcamViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 장치 목록/선택
  const [cams, setCams] = useState<Cam[]>([]);
  const [mics, setMics] = useState<Mic[]>([]);
  const [currentCamId, setCurrentCamId] = useState<string | null>(null);
  const [currentMicId, setCurrentMicId] = useState<string | null>(null);

  const [error, setError] = useState("");

  // ── 마이크 상태/레벨 ─────────────────────────────────────────────
  const [micEnabled, setMicEnabled] = useState(true);
  const [micLevel, setMicLevel] = useState(0); // 0~100
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  // ── 마이크 테스트(3초 녹음→재생) ─────────────────────────────────
  const recRef = useRef<MediaRecorder | null>(null);
  const recChunksRef = useRef<BlobPart[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testUrl, setTestUrl] = useState<string | null>(null);

  /** 스트림 정지 */
  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    stopMeter();
  }

  /** 마이크 레벨 미터 */
  function startMeter(stream: MediaStream) {
    try {
      const AC =
        (window.AudioContext ||
          // @ts-ignore
          window.webkitAudioContext) as typeof AudioContext;
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
        const rms = Math.sqrt(sum / buf.length); // 0~1
        setMicLevel(Math.min(100, Math.max(0, Math.round(rms * 140))));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // 권한/정책으로 실패할 수 있음 — 무시
    }
  }
  function stopMeter() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try {
      audioCtxRef.current?.close();
    } catch {}
    audioCtxRef.current = null;
    analyserRef.current = null;
    setMicLevel(0);
  }

  /** 비디오 엘리먼트에 스트림 바인딩 */
  async function bindToVideo(stream: MediaStream) {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
    try {
      await videoRef.current.play();
    } catch {
      // iOS/자동재생 정책 등으로 play()가 거절될 수 있음 — 무시
    }
  }

  /** 장치 목록 새로고침 */
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

  /** 카메라/마이크 시작 */
  async function start(camId?: string | null, micId?: string | null) {
    try {
      setError("");

      const wantCam = camId ?? currentCamId ?? "";
      const wantMic = micId ?? currentMicId ?? "";

      stopStream();

      const wantVideo =
        !wantCam || wantCam === CAM_OFF
          ? false
          : { deviceId: { exact: wantCam } as const };
      const wantAudio =
        !wantMic || wantMic === MIC_OFF
          ? false
          : { deviceId: { exact: wantMic } as const };

      // 기본값: 첫 연결 시 라벨 노출을 위해 video+audio 동시 확보
      const constraints: MediaStreamConstraints = {
        video:
          wantVideo === false
            ? false
            : wantCam
            ? wantVideo
            : { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
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
      } catch {}

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

  /** 초기 구동 */
  useEffect(() => {
    const savedCam = (() => {
      try {
        return localStorage.getItem("preferredCam") || "";
      } catch {
        return "";
      }
    })();
    const savedMic = (() => {
      try {
        return localStorage.getItem("preferredMic") || "";
      } catch {
        return "";
      }
    })();

    // 1) 먼저 아무 장치로나 스트림을 만들어 장치 라벨 확보
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        s.getTracks().forEach((t) => t.stop());
      } catch (e: any) {
        setError(`${e?.name || "Error"}: ${e?.message || "권한이 필요합니다."}`);
      } finally {
        await refreshDevices();
        await start(savedCam || null, savedMic || null);
      }
    })();

    // 장치 변화 이벤트(USB 연결/해제 등)
    const onChange = () => refreshDevices();
    navigator.mediaDevices?.addEventListener?.("devicechange", onChange);

    return () => {
      navigator.mediaDevices?.removeEventListener?.("devicechange", onChange);
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 마이크 on/off ───────────────────────────────────────────────
  function toggleMic() {
    const s = streamRef.current;
    if (!s) return;
    const enabled = !micEnabled;
    s.getAudioTracks().forEach((t) => (t.enabled = enabled));
    setMicEnabled(enabled);
  }

  // ── 카메라 on/off(보조) ──────────────────────────────────────────
  function toggleCameraAux() {
    const s = streamRef.current;
    if (!s) return;
    const videoTracks = s.getVideoTracks();
    if (!videoTracks.length) return;
    const next = !videoTracks[0].enabled;
    videoTracks.forEach((t) => (t.enabled = next));
  }

  // ── 3초 녹음 테스트 ──────────────────────────────────────────────
  function pickAudioMime(): string {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg",
    ];
    for (const c of candidates) {
      // @ts-ignore
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(c))
        return c;
    }
    return "";
  }
  function startMicTest() {
    if (!streamRef.current) return;
    try {
      // @ts-ignore
      if (typeof MediaRecorder === "undefined") {
        setError("이 브라우저는 MediaRecorder를 지원하지 않습니다.");
        return;
      }
      const audioOnly = new MediaStream(streamRef.current.getAudioTracks());
      const mime = pickAudioMime();
      // @ts-ignore
      const rec = new MediaRecorder(audioOnly, mime ? { mimeType: mime } : undefined);
      recRef.current = rec;
      recChunksRef.current = [];
      setIsTesting(true);

      rec.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) recChunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(recChunksRef.current, { type: mime || "audio/webm" });
        const url = URL.createObjectURL(blob);
        if (testUrl) URL.revokeObjectURL(testUrl);
        setTestUrl(url);
        setIsTesting(false);
      };

      rec.start();
      setTimeout(() => rec.stop(), 3000);
    } catch (err: any) {
      setIsTesting(false);
      setError(err?.message || "마이크 테스트 중 오류가 발생했습니다.");
    }
  }
  function clearTestAudio() {
    if (testUrl) URL.revokeObjectURL(testUrl);
    setTestUrl(null);
  }

  /** 현재 프레임 캡처 저장 */
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

  // ── UI ───────────────────────────────────────────────────────────
  return (
    <div className="relative w-full">
      {/* 상단 툴바 */}
      <div className="absolute inset-x-4 top-4 z-20 flex flex-wrap items-center gap-2 rounded-xl bg-white/85 backdrop-blur-md p-2 shadow-lg">
        {/* 카메라 선택 */}
        <select
          className="h-9 rounded-md border px-2 text-sm"
          value={currentCamId ?? ""}
          onChange={(e) => {
            const id = e.target.value || null;
            setCurrentCamId(id);
            start(id, currentMicId);
          }}
        >
          <option value="">{cams.length ? "기본 카메라" : "카메라 탐색 중…"}</option>
          <option value={CAM_OFF}>카메라 끄기(보조)</option>
          {cams.map((c) => (
            <option key={c.deviceId} value={c.deviceId}>
              {c.label}
            </option>
          ))}
        </select>

        {/* 마이크 선택 */}
        <select
          className="h-9 rounded-md border px-2 text-sm"
          value={currentMicId ?? ""}
          onChange={(e) => {
            const id = e.target.value || null;
            setCurrentMicId(id);
            start(currentCamId, id);
          }}
        >
          <option value="">{mics.length ? "기본 마이크" : "마이크 탐색 중…"}</option>
          <option value={MIC_OFF}>마이크 끄기(보조)</option>
          {mics.map((m) => (
            <option key={m.deviceId} value={m.deviceId}>
              {m.label}
            </option>
          ))}
        </select>

        <button
          className="h-9 rounded-md border px-3 text-sm hover:bg-white"
          onClick={() => start(currentCamId, currentMicId)}
        >
          재시작
        </button>

        <button
          className="h-9 rounded-md border px-3 text-sm hover:bg-white"
          onClick={handleCapture}
        >
          캡처 저장
        </button>
      </div>

      {/* 비디오 */}
      <div className="rounded-xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="block w-full h-[62vh] sm:h-[68vh] object-cover"
        />
      </div>

      {/* 마이크 제어 & 테스트 */}
      {showMicPanel && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <button className="border rounded px-3 py-1" onClick={toggleCameraAux}>
              카메라 끄기(보조)
            </button>

            <button className="border rounded px-3 py-1" onClick={toggleMic}>
              {micEnabled ? "마이크 끄기(보조)" : "마이크 켜기(보조)"}
            </button>

            {/* 입력 레벨 바 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">입력 레벨</span>
              <div className="w-44 h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-green-500 rounded"
                  style={{ width: `${micLevel}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-8 text-right">{micLevel}</span>
            </div>

            <button
              className="border rounded px-3 py-1"
              onClick={startMicTest}
              disabled={isTesting}
              title="3초 동안 녹음하여 아래에서 재생"
            >
              {isTesting ? "마이크 테스트(녹음중…)" : "마이크 테스트(3초)"}
            </button>
          </div>

          {testUrl && (
            <div className="flex items-center gap-2">
              <audio src={testUrl} controls />
              <button className="border rounded px-2 py-1" onClick={clearTestAudio}>
                삭제
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
    </div>
  );
}
