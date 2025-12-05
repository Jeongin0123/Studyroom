// src/components/AIChatRoom.tsx 
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Bot, Send } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { askAI, uploadPdf, askPdf } from "../lib/api"; // ✅ 백엔드 호출은 api.ts 통해서만

type Msg = { role: "user" | "assistant"; text: string; ts: string };

export default function AIChatRoom() {
  // 방 안에서 들어올 수도 있으니 roomId 옵셔널
  const { roomId } = useParams();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ PDF 모드 관련 상태
  const [docId, setDocId] = useState<string | null>(null); // 업로드된 PDF 식별자
  const [uploading, setUploading] = useState(false);       // PDF 업로드 중 여부
  const [usePdf, setUsePdf] = useState(false);             // PDF 모드 사용 여부

  const scrollerRef = useRef<HTMLDivElement>(null);

  // 스크롤 하단 고정
  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // ✅ PDF 업로드 핸들러
  const handlePdfUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploading) return;

    try {
      setUploading(true);
      const res = await uploadPdf(file); // /upload_pdf 호출 → { doc_id, message }

      setDocId(res.doc_id);
      setUsePdf(true); // PDF 업로드 되면 자동으로 PDF 모드 켜기

      // 안내 메시지 추가
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "PDF가 성공적으로 등록되었습니다. 이제 이 문서 내용에 대해 질문해 보세요.",
          ts: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("[AIChatRoom] PDF 업로드 실패:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "PDF 업로드 중 오류가 발생했습니다. 파일을 다시 확인해 주세요.",
          ts: new Date().toISOString(),
        },
      ]);
    } finally {
      setUploading(false);
      // 같은 파일을 다시 선택할 수 있도록 초기화
      e.target.value = "";
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const now = new Date().toISOString();
    const userMsg: Msg = { role: "user", text, ts: now };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      let reply = "";

      // ✅ PDF 모드 & docId 있을 때 → /pdf-chat 사용
      if (usePdf && docId) {
        const res = await askPdf(text, docId, roomId ?? null);
        reply = res.reply ?? "(응답이 비어 있습니다)";
      } else {
        // ✅ 기본 AI 에이전트 채팅 (/agent-chat)
        const res = await askAI(text, roomId ?? null);
        reply = (res as any)?.reply ?? "(응답이 비어 있습니다)";
      }

      const aiMsg: Msg = {
        role: "assistant",
        text: reply,
        ts: new Date().toISOString(),
      };
      setMessages((m) => [...m, aiMsg]);
    } catch (e: any) {
      const errText =
        "서버와 통신 중 오류가 발생했어요. 잠시 후 다시 시도해주세요." +
        (e?.message ? `\n[디버그] ${e.message}` : "");
      setMessages((m) => [
        ...m,
        { role: "assistant", text: errText, ts: new Date().toISOString() },
      ]);
      console.error("[AIChatRoom] send failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-semibold">
            <Bot className="w-5 h-5" />
            AI 채팅방 {roomId ? `(#${roomId})` : ""}
          </div>
          <Link to="/studyroom">
            <Button variant="outline">스터디룸으로 돌아가기</Button>
          </Link>
        </div>

        <Card className="h-[70vh] p-4 flex flex-col">
          {/* ✅ 상단: PDF 업로드 & 모드 토글 */}
          <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
            <label className="inline-flex items-center gap-2 px-3 py-1 border rounded-2xl cursor-pointer bg-white">
              <span>{uploading ? "업로드 중..." : "PDF 업로드"}</span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handlePdfUpload}
                disabled={uploading}
              />
            </label>

            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={usePdf && !!docId}
                onChange={(e) => setUsePdf(e.target.checked)}
                disabled={!docId}
              />
              <span className="text-xs sm:text-sm">
                PDF 모드 사용
                {docId ? " (문서 연결됨)" : " (먼저 PDF를 업로드하세요)"}
              </span>
            </label>
          </div>

          <div
            ref={scrollerRef}
            className="flex-1 overflow-y-auto space-y-3 pr-1"
          >
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground">
                무엇이든 질문해 보세요. (예: “SQL JOIN 차이 설명해줘”, “FastAPI 라우팅 예시”)
                {docId
                  ? "\n또는 현재 연결된 PDF 내용에 대해서도 질문할 수 있습니다."
                  : "\nPDF를 업로드하면 문서 내용 기반 질문도 가능합니다."}
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "text-right" : "text-left"}
              >
                <div
                  className={`inline-block max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-white border"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-sm text-muted-foreground">
                AI가 작성 중…
              </div>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={
                usePdf && docId
                  ? "PDF 내용에 대해 질문해 보세요"
                  : "AI에게 물어보세요"
              }
              disabled={loading}
            />
            <Button onClick={send} disabled={loading || !input.trim()}>
              <Send className="w-4 h-4 mr-1" />
              보내기
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
