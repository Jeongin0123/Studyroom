import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Landing.tsx";
import Studyroom from "./M_Studyroom.tsx";
import Mypage from "./Mypage.tsx";
import Popup from "./Popup.tsx";
import AIChatRoom from "./components/AIChatRoom.tsx"; // 새로 만든 AI 채팅방 컴포넌트

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 기본 페이지 (랜딩) */}
        <Route path="/" element={<Landing />} />

        {/* 일반 스터디룸 (사람 채팅 + 카메라 기능 포함) */}
        <Route path="/studyroom" element={<Studyroom />} />

        {/* 마이페이지 */}
        <Route path="/mypage" element={<Mypage />} />

        {/* 팝업 페이지 */}
        <Route path="/popup" element={<Popup />} />

        {/* AI 전용 채팅방 — 사람 채팅과 완전히 분리됨 */}
        <Route path="/ai-chat" element={<AIChatRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


