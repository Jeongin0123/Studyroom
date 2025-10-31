// src/Landing.tsx
import { useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { AlertCircle, Eye } from "lucide-react";
import Login from "./Login.tsx";
import M_Studyroom from "./M_Studyroom.tsx";
import Mypage from "./Mypage.tsx";
import Popup from "./Popup.tsx";
import { usePage } from "./components/PageContext";
import { useUser } from "./components/UserContext";

// example section
import StudyRoom from "./components/StudyRoom";

// ✅ 카메라 미리보기 컴포넌트 추가
import WebcamView from "./WebcamView";

export default function Landing() {
  const { user } = useUser();
  const { currentPage, setCurrentPage } = usePage();

  // ✅ 랜딩에서 카메라 패널 열기/닫기
  const [showCam, setShowCam] = useState(false);

  console.log(user);

  // NOTE: 이 컴포넌트가 "페이지 스위치" 역할도 하고 있으므로 기존 로직 유지
  switch (currentPage) {
    case "login":
      return <Login />;
    case "m_studyroom":
      return <StudyRoom />;
    case "mypage":
      return <Mypage />;
    case "popup":
      return <Popup />;
    default:
      break;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex-1"></div>
          <div className="text-center">
            <h1
              className="text-7xl tracking-wider transform -skew-y-1"
              style={{
                color: "#FFDE00",
                textShadow: `
                  4px 4px 0px #3B4CCA,
                  -2px -2px 0px #3B4CCA,
                  2px -2px 0px #3B4CCA,
                  -2px 2px 0px #3B4CCA,
                  0px 4px 8px rgba(0,0,0,0.3)
                `,
                fontFamily: "system-ui, -apple-system, sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              스터디몬
            </h1>
            <div className="text-sm text-yellow-300 mt-1 tracking-wide">STUDYMON</div>
          </div>
          <div className="flex-1 flex justify-end gap-3">
            <Button
              onClick={() => setCurrentPage("login")}
              variant="outline"
              className="bg-transparent text-white border-2 border-white hover:bg-white/10 rounded-full px-6"
            >
              로그인
            </Button>
            <Button className="bg-yellow-400 text-blue-900 hover:bg-yellow-500 border-2 border-yellow-500 rounded-full px-6">
              회원가입
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Box */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white/30 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[0_8px_32px_0_rgba(255,255,255,0.2)] p-8 relative overflow-hidden">
          {/* Glassy shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            {/* Top Section - Description and Pokemon Room */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              {/* Left - StudyMon Description */}
              <div className="lg:col-span-2">
                <Card className="h-full bg-white/20 backdrop-blur-lg border border-white/40 rounded-2xl shadow-[0_8px_24px_0_rgba(255,255,255,0.15)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                  <CardContent className="p-8 flex flex-col justify-between h-full relative z-10">
                    <div>
                      <h2 className="text-3xl mb-6">스터디몬과 함께하는 즐거운 공부!</h2>

                      {/* 졸음 감지 & 거북목 감지 강조 (거북목 텍스트는 그대로 두되, 실제 기능은 제외 상태 기억) */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/30 backdrop-blur-md border border-white/50 rounded-xl p-4 flex items-center gap-3 shadow-[0_4px_16px_0_rgba(59,130,246,0.2)] relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-transparent to-transparent pointer-events-none"></div>
                          <div className="text-4xl relative z-10">😴</div>
                          <div className="relative z-10">
                            <div className="text-blue-700">졸음 감지</div>
                            <div className="text-xs text-gray-600">AI가 실시간으로 감지</div>
                          </div>
                        </div>
                        <div className="bg-white/30 backdrop-blur-md border border-white/50 rounded-xl p-4 flex items-center gap-3 shadow-[0_4px_16px_0_rgba(249,115,22,0.2)] relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-transparent to-transparent pointer-events-none"></div>
                          <div className="text-4xl relative z-10">🦒</div>
                          <div className="relative z-10">
                            <div className="text-orange-700">거북목 감지</div>
                            <div className="text-xs text-gray-600">바른 자세 유지</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 text-lg text-gray-800">
                        <p>
                          🎮 <span className="text-purple-600">포켓몬 게이미피케이션</span>으로 공부가 더 재미있어집니다
                        </p>
                        <p>
                          📚 공부 시간과 바른 자세 유지로 <span className="text-blue-600">포켓몬을 수집</span>하세요
                        </p>
                        <p>🤝 온라인 스터디룸에서 친구들과 함께 공부하며 동기부여 받으세요</p>
                        <p>🏆 열심히 공부해서 스터디 랭킹의 정상에 올라보세요!</p>
                      </div>
                    </div>

                    {/* ▶ 버튼: 랜딩에서 즉시 카메라 켜기 */}
                    <div className="mt-8 flex justify-center gap-3">
                      <Button
                        onClick={() => setShowCam(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 text-xl shadow-lg"
                      >
                        스터디룸 만들러가기
                      </Button>

                      {/* 필요하면 바로 스터디룸 페이지로 이동하는 기존 동작도 유지 */}
                      {/* <Button onClick={() => setCurrentPage('m_studyroom')} variant="outline" className="rounded-full px-6">
                        바로 입장
                      </Button> */}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right - Pokemon Room */}
              <div className="lg:col-span-1">
                <Card className="h-full bg-white/20 backdrop-blur-lg border border-white/40 rounded-2xl shadow-[0_8px_24px_0_rgba(255,255,255,0.15)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                  <CardContent className="p-8 flex flex-col items-center justify-between h-full relative z-10">
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <h3 className="text-2xl mb-6 text-center">포켓몬 룸</h3>
                      <div className="w-48 h-48 mb-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden border-2 border-white/50 shadow-[0_8px_32px_0_rgba(255,255,255,0.3)] relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none"></div>
                        <ImageWithFallback
                          src="https://images.unsplash.com/photo-1743038745668-8c9ca7dd7736?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2tlbW9uJTIwZWdnfGVufDF8fHx8MTc2MTIwNTk0NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                          alt="포켓몬 알"
                          className="w-full h-full object-cover relative z-10"
                        />
                      </div>
                      <p className="text-center text-gray-700 mb-6">나만의 특별한 포켓몬을 키워보세요!</p>
                    </div>
                    <Button
                      onClick={() => setCurrentPage("popup")}
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-full py-6 text-lg shadow-lg"
                    >
                      내 포켓몬 만들기
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ✅ 카메라 미리보기 패널 (버튼 누르면 나타남) */}
            {showCam && (
              <div className="max-w-5xl mx-auto mb-12">
                <Card className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">카메라 미리보기</h3>
                      <div className="flex gap-2">
                        {/* 미리보기 확인 후 실제 방으로 이동 */}
                        <Button onClick={() => setCurrentPage("m_studyroom")} className="px-4">
                          이 설정으로 스터디룸 입장
                        </Button>
                        <Button variant="outline" onClick={() => setShowCam(false)}>
                          닫기
                        </Button>
                      </div>
                    </div>

                    {/* 여기서 바로 카메라가 켜짐 */}
                    <div className="aspect-video bg-black/80 rounded-xl overflow-hidden">
                      <WebcamView />
                    </div>

                    <p className="text-sm text-gray-600 mt-3">
                      팁: 드롭다운에서 카메라를 선택하고, 캡처/녹화/화면공유 버튼을 사용해보세요.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Bottom Section - Study Rooms */}
            <div>
              <h2 className="text-3xl mb-6">🔥 공개 스터디룸</h2>
              <p className="text-xl text-gray-600 mb-6">
                지금 가장 활발한 스터디룸! 다른 트레이너들과 함께 집중해보세요!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: "26학년도 수능 파이팅🍀", members: "8명", color: "from-blue-400/30 to-blue-500/30" },
                  { title: "부활절 개발자 모각코📚", members: "12명", color: "from-purple-400/30 to-purple-500/30" },
                  { title: "중간고사 파이팅야아야 !!!!!", members: "6명", color: "from-green-400/30 to-green-500/30" },
                  { title: "공무원 스터디", members: "15명", color: "from-yellow-400/30 to-yellow-500/30" },
                  { title: "취준생 다모여🔥", members: "10명", color: "from-red-400/30 to-red-500/30" },
                  { title: "영어 회화 스터디", members: "7명", color: "from-pink-400/30 to-pink-500/30" },
                  { title: "자격증 따자!", members: "9명", color: "from-indigo-400/30 to-indigo-500/30" },
                  { title: "새벽 스터디", members: "5명", color: "from-orange-400/30 to-orange-500/30" },
                ].map((room, index) => (
                  <Card
                    key={index}
                    className={`bg-gradient-to-br ${room.color} backdrop-blur-xl border border-white/40 rounded-2xl overflow-hidden hover:scale-105 transition-transform cursor-pointer shadow-[0_8px_32px_0_rgba(255,255,255,0.15)] relative`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                    <CardContent className="p-0 relative z-10">
                      <div className="p-6 bg-white/10 backdrop-blur-md">
                        <h3 className="text-lg text-gray-800 mb-2">{room.title}</h3>
                        <p className="text-sm text-gray-700">👥 {room.members} 참여중</p>
                      </div>
                      <div className="p-4 bg-white/50 backdrop-blur-sm">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg">
                          입장하기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-white/70">
        <p className="text-sm">© 2025 StudyMon. 포켓몬과 함께하는 즐거운 공부!</p>
      </footer>
    </div>
  );
}
