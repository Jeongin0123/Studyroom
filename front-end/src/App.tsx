// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";

// 페이지 컴포넌트
import Landing from "./Landing";
import Mypage from "./Mypage";
import Popup from "./Popup";
import Studyroom from "./components/M_StudyRoom";


// AI 채팅방 (파일명 대소문자 일치!)
import AiChatRoom from "./components/AiChatRoom";

export default function App() {
  return (
    <Routes>
      {/* 🏠 기본 랜딩 페이지 */}
      <Route path="/" element={<Landing />} />

      {/* 💬 일반 스터디룸 (사람 채팅 + 카메라/마이크 포함) */}
      <Route path="/studyroom" element={<Studyroom />} />

      {/* 👤 마이페이지 */}
      <Route path="/mypage" element={<Mypage />} />

      {/* 🔔 팝업 페이지 */}
      <Route path="/popup" element={<Popup />} />

      {/* 🤖 AI 전용 채팅방 (사람 채팅과 분리) */}
      <Route path="/ai-chat" element={<AiChatRoom />} />

      {/* ⚠️ 잘못된 경로 → 랜딩으로 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
