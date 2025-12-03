import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Users, Clock } from "lucide-react";
import { Footer } from "./Footer";
import logo from "../assets/logo.png";
import logoutImg from "../assets/logout.png";
import mypageImg from "../assets/mypage.png";
import bg from "../assets/bg.png";

interface AfterLoginPokemonLandingProps {
    onMyPage: () => void;
    onLogout: () => void;
    onCreateStudyRoom?: () => void;
    onViewPokemon?: () => void;
    onJoinStudyRoom?: () => void;
}

export function AfterLoginPokemonLanding({ onMyPage, onLogout, onCreateStudyRoom, onViewPokemon, onJoinStudyRoom }: AfterLoginPokemonLandingProps) {
    const studyRooms = [
        {
            title: '수능 국어 집중반',
            description: '국어 문학 함께 공부해요',
            participants: 12,
            avgTime: '2시간 30분'
        },
        {
            title: '토익 900+ 도전',
            description: '토익 고득점 목표 스터디',
            participants: 8,
            avgTime: '3시간 15분'
        },
        {
            title: '코딩테스트 준비',
            description: '알고리즘 문제 풀이',
            participants: 15,
            avgTime: '4시간 20분'
        },
        {
            title: '공무원 시험 준비',
            description: '9급 공무원 함께 준비',
            participants: 20,
            avgTime: '5시간 10분'
        },
        {
            title: '자격증 스터디',
            description: '정보처리기사 준비',
            participants: 6,
            avgTime: '2시간 45분'
        },
        {
            title: '영어회화 연습',
            description: '매일 영어로 대화하기',
            participants: 10,
            avgTime: '1시간 50분'
        }
    ];

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100"
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* Header */}
            <header className="py-6">
                <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between">
                    <div className="flex-1" />
                    <div className="flex-1 flex justify-center">
                        <img src={logo} alt="STUDYMON" className="h-38 w-auto max-w-none drop-shadow-lg mt-6" />
                    </div>
                    <div className="flex-1 flex justify-end gap-3 pr-6">
                        <button
                            className="bg-transparent hover:opacity-90 transition"
                            onClick={onMyPage}
                        >
                            <img src={mypageImg} alt="My page" className="h-12 w-auto" />
                        </button>
                        <button
                            className="bg-transparent hover:opacity-90 transition"
                            onClick={onLogout}
                        >
                            <img src={logoutImg} alt="Logout" className="h-12 w-auto" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-4 py-12">
                <div className="grid grid-cols-[1.4fr_1fr] gap-10 mb-16 items-stretch">
                    {/* Left Main Section */}
                    <div className="h-full">
                        <div
                            className="h-full overflow-hidden flex flex-col border-4 shadow-[0_24px_50px_rgba(135,92,255,0.15)]"
                            style={{
                                borderRadius: "50px",
                                borderColor: "#78B8E0",
                                background: "#F8F8F8",
                            }}
                        >
                            <div
                                className="flex flex-col h-full justify-between"
                                style={{
                                    borderRadius: "50px",
                                    fontFamily: "\"PF Stardust\", sans-serif",
                                    padding: "48px 42px",
                                    boxSizing: "border-box",
                                }}
                            >
                                <div className="mb-6">
                                    <h2
                                        className="text-4xl mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                                        style={{ fontFamily: '"PF Stardust Bold", sans-serif' }}
                                    >
                                        스터디몬과 함께 즐겁게 공부해요!
                                    </h2>
                                    <p
                                        className="text-2xl text-purple-500 mb-6"
                                        style={{ fontFamily: '"PF Stardust Bold", sans-serif' }}
                                    >
                                        졸음 감지 & 내장 AI 챗봇 기능
                                    </p>
                                </div>

                                <div
                                    className="space-y-4 mb-8 text-gray-700 flex-1"
                                    style={{ fontFamily: "\"PF Stardust\", sans-serif" }}
                                >
                                    <p className="text-lg leading-relaxed">📚 <strong>스터디몬</strong>은 여러분의 공부를 즐겁고 효율적으로 만들어주는 AI 기반 학습 플랫폼입니다.</p>
                                    <p className="text-lg leading-relaxed">🚀 <strong>졸음 감지 시스템</strong>으로 집중력이 떨어질 때 알려드리고, 귀여운 포켓몬 친구들이 응원해줍니다.</p>
                                    <p className="text-lg leading-relaxed">🤖 <strong>AI 챗봇</strong>이 궁금한 내용을 바로바로 설명해주고, 학습 계획도 함께 세워드립니다.</p>
                                    <p className="text-lg leading-relaxed">👥 <strong>스터디룸</strong>에서 친구들과 함께 공부하며 배틀도 해보세요!</p>
                                    <p className="text-lg leading-relaxed">🎮 공부할수록 <strong>포켓몬이 성장</strong>하고, 다양한 보상을 받을 수 있습니다.</p>
                                </div>

                                <div className="mt-auto w-full">
                                    <Button
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white rounded-full px-8 py-5 shadow-lg"
                                        onClick={onCreateStudyRoom}
                                    >
                                        ⚡ 스터디룸 만들기
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Pokemon Room */}
                    <div className="lg:col-span-1 h-full">
                        <Card
                            className="h-full shadow-[0_24px_50px_rgba(255,107,162,0.22)] overflow-hidden flex flex-col border-4"
                            style={{
                                borderRadius: "50px",
                                borderColor: "#78B8E0",
                                background: "#f8f8f8",
                            }}
                        >
                            <CardHeader
                                className="pb-4"
                                style={{ padding: "40px 32px", boxSizing: "border-box" }}
                            >
                                <h3
                                    className="text-2xl text-center text-pink-600"
                                    style={{ fontFamily: '"PF Stardust Bold", sans-serif' }}
                                >
                                    내 스터디몬
                                </h3>
                            </CardHeader>
                            <CardContent
                                className="flex flex-col items-center flex-1"
                                style={{ padding: "40px 32px", boxSizing: "border-box" }}
                            >
                                <div className="w-48 h-48 mb-6 rounded-full bg-white/50 flex items-center justify-center shadow-lg">
                                    <ImageWithFallback
                                        src="https://images.unsplash.com/photo-1613771404721-1f92d799e49f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2tlYmFsbCUyMHRveXxlbnwxfHx8fDE3NjMzNTk5Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                                        alt="Pokemon cards"
                                        className="w-40 h-40 object-contain rounded-full"
                                    />
                                </div>
                                <div className="space-y-3 text-gray-700 mb-6 text-base leading-relaxed w-full">
                                    <br></br>
                                    <p className="text-center">📝 공부 시간이 쌓일수록 스터디몬이 레벨업하고 진화합니다.</p>
                                    <p className="text-center">🎁 다양한 스터디몬을 수집하고 친구들과 배틀해보세요!</p>
                                </div>
                            </CardContent>
                            <CardFooter className="mt-auto w-full pt-0 pb-10 px-10">
                                <Button
                                    className="w-full bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 text-white rounded-full px-8 py-5 shadow-lg"
                                    onClick={onViewPokemon}
                                >
                                    ✨ 내 스터디몬 보러가기
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>

                {/* Public Study Rooms */}
                <div>
                    <h2
                        className="text-4xl mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                        style={{ fontFamily: '"PF Stardust Bold", sans-serif' }}
                    >
                        = 스터디룸 =
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {studyRooms.map((room, index) => (
                            <Card
                                key={room.title + index}
                                className="bg-white/90 backdrop-blur-sm border-3 border-blue-200 shadow-lg rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                            >
                                <CardHeader>
                                    <h3
                                        className="text-xl text-blue-700"
                                        style={{ fontFamily: '"PF Stardust Bold", sans-serif' }}
                                    >
                                        {room.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">{room.description}</p>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Users className="w-5 h-5 text-purple-500" />
                                        <span>참여자: <strong>{room.participants}명</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Clock className="w-5 h-5 text-blue-500" />
                                        <span>평균 공부: <strong>{room.avgTime}</strong></span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white rounded-full shadow-md"
                                        onClick={onJoinStudyRoom}
                                    >
                                        참여하기 →
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
