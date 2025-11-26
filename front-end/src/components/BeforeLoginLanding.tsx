import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import logo from "../assets/logo.png";
import bg from "../assets/bg.png";
import loginImg from "../assets/login.png";
import signupImg from "../assets/signup.png";
import container1 from "../assets/container1.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Users, Clock } from "lucide-react";

interface BeforeLoginLandingProps {
    onNavigateToLogin?: () => void;
    onNavigateToSignup?: () => void;
}

export function BeforeLoginLanding({ onNavigateToLogin, onNavigateToSignup }: BeforeLoginLandingProps) {
    const studyRooms = [
        {
            id: 1,
            name: "수능 국어 집중반",
            participants: 12,
            avgStudyTime: "2시간 30분",
            description: "국어 문학 함께 공부해요"
        },
        {
            id: 2,
            name: "토익 900+ 도전",
            participants: 8,
            avgStudyTime: "3시간 15분",
            description: "토익 고득점 목표 스터디"
        },
        {
            id: 3,
            name: "코딩테스트 준비",
            participants: 15,
            avgStudyTime: "4시간 20분",
            description: "알고리즘 문제 풀이"
        },
        {
            id: 4,
            name: "공무원 시험 준비",
            participants: 20,
            avgStudyTime: "5시간 10분",
            description: "9급 공무원 함께 준비"
        },
        {
            id: 5,
            name: "자격증 스터디",
            participants: 6,
            avgStudyTime: "2시간 45분",
            description: "정보처리기사 준비"
        },
        {
            id: 6,
            name: "영어회화 연습",
            participants: 10,
            avgStudyTime: "1시간 50분",
            description: "매일 영어로 대화하기"
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
            <header className="flex items-center justify-between px-8 py-6">
                <div className="flex-1" />
                <div className="flex-1 flex justify-center">
                    <img src={logo} alt="STUDYMON" className="h-48 w-auto max-w-none drop-shadow-lg" />
                </div>
                <div className="flex-1 flex justify-end gap-3">
                    <button
                        className="bg-transparent hover:opacity-90 transition"
                        onClick={onNavigateToLogin}
                    >
                        <img src={loginImg} alt="Login" className="h-12 w-auto" />
                    </button>
                    <button
                        className="bg-transparent hover:opacity-90 transition"
                        onClick={onNavigateToSignup}
                    >
                        <img src={signupImg} alt="Sign up" className="h-12 w-auto" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 items-stretch">
                    {/* Left Main Section */}
                    <div className="lg:col-span-2 h-full">
                        <div
                            className="h-full overflow-hidden flex flex-col border-4 border-transparent"
                            style={{
                                backgroundImage: `url(${container1})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                borderRadius: "0x",
                            }}
                        >
                            <div
                                className="p-12 flex flex-col h-full"
                                //style={{ borderRadius: "200px" }}
                            >
                                <div className="mb-6">
                                    <h2 className="text-5xl mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        스터디몬과 함께 즐겁게 공부해요!
                                    </h2>
                                    <p className="text-2xl text-purple-500 mb-6">
                                        졸음 감지 & 내장 AI 챗봇 기능
                                    </p>
                                </div>

                                <div className="space-y-4 mb-8 text-gray-700 flex-1">
                                    <p className="text-lg">
                                        📚 <strong>스터디몬</strong>은 여러분의 공부를 더욱 즐겁고 효율적으로 만들어주는 AI 기반 학습 플랫폼입니다.
                                    </p>
                                    <p className="text-lg">
                                        💤 <strong>졸음 감지 시스템</strong>으로 집중력이 떨어질 때 알려드리고, 귀여운 포켓몬 친구들이 응원해줍니다.
                                    </p>
                                    <p className="text-lg">
                                        🤖 <strong>AI 챗봇</strong>이 궁금한 내용을 바로바로 설명해주고, 학습 계획도 함께 세워드립니다.
                                    </p>
                                    <p className="text-lg">
                                        👥 <strong>스터디룸</strong>에서 친구들과 함께 공부하며 배틀도 해보세요!
                                    </p>
                                    <p className="text-lg">
                                        🎮 공부할수록 <strong>포켓몬이 성장</strong>하고, 다양한 보상을 받을 수 있습니다.
                                    </p>
                                </div>

                                <div className="mt-auto">
                                    <Button
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white rounded-full px-10 py-6 text-xl shadow-xl hover:shadow-2xl transition-all"
                                        onClick={onNavigateToLogin}
                                    >
                                        ⚡ 스터디룸 만들기
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Pokemon Room */}
                    <div className="lg:col-span-1 h-full">
                        <Card className="h-full bg-gradient-to-br from-red-100 to-pink-100 border-4 border-red-300 shadow-2xl rounded-3xl overflow-hidden flex flex-col">
                            <CardHeader className="pb-4">
                                <h3 className="text-2xl text-center text-red-600">
                                    나만의 포켓몬 만들기
                                </h3>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center px-6 pb-6 flex-1">
                                <div className="w-48 h-48 mb-6 rounded-full bg-white/50 flex items-center justify-center shadow-lg">
                                    <img
                                        src="https://64.media.tumblr.com/tumblr_lvwmhdE0lN1qg0dcvo1_500.gif"
                                        alt="포켓몬 이미지"
                                        className="w-40 h-40 object-contain rounded-full"
                                    />
                                </div>
                                <p className="text-center text-gray-700 mb-6">
                                    🌟 공부를 시작하면 나만의 스터디몬이 태어나요!
                                    <br /><br />
                                    📈 공부 시간이 쌓일수록 스터디몬이 레벨업하고 진화합니다.
                                    <br /><br />
                                    🎁 다양한 스터디몬을 수집하고 친구들과 공유해보세요!
                                </p>
                                <div className="mt-auto w-full">
                                    <Button
                                        className="w-full bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 text-white rounded-full px-8 py-5 shadow-lg"
                                        onClick={onNavigateToSignup}
                                    >
                                        ✨ 내 포켓몬 만들기
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Public Study Rooms */}
                <div>
                    <h2 className="text-4xl mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        🌍 공개 스터디룸
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {studyRooms.map((room) => (
                            <Card
                                key={room.id}
                                className="bg-white/90 backdrop-blur-sm border-3 border-blue-200 shadow-lg rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                            >
                                <CardHeader>
                                    <h3 className="text-xl text-blue-700">
                                        {room.name}
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
                                        <span>평균 공부: <strong>{room.avgStudyTime}</strong></span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white rounded-full shadow-md"
                                        onClick={onNavigateToLogin}
                                    >
                                        참여하기 →
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
