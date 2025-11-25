import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Users, Clock } from 'lucide-react';

interface AfterLoginLandingProps {
    onMyPage: () => void;
    onLogout: () => void;
    onCreateStudyRoom?: () => void;
    onCreatePokemon?: () => void;
    onJoinStudyRoom?: () => void;
}

export function AfterLoginLanding({ onMyPage, onLogout, onCreateStudyRoom, onCreatePokemon, onJoinStudyRoom }: AfterLoginLandingProps) {
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
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-8">
            {/* Header */}
            <header className="flex justify-between items-center mb-16">
                <h1 className="text-6xl tracking-wide" style={{
                    background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '3px 3px 0px rgba(0,0,0,0.1)',
                    fontWeight: 900
                }}>
                    STUDYMON
                </h1>

                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        className="bg-white text-gray-700 border-gray-300 px-8 py-6 rounded-full hover:bg-gray-50"
                        onClick={onMyPage}
                    >
                        My page
                    </Button>
                    <Button
                        className="px-8 py-6 rounded-full text-white"
                        style={{
                            background: 'linear-gradient(135deg, #EC4899 0%, #D946EF 100%)'
                        }}
                        onClick={onLogout}
                    >
                        Logout
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
                {/* Left Section - 더 넓게 */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-12 shadow-lg border-4 border-purple-200">
                    <h2 className="text-5xl mb-8" style={{
                        background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #F43F5E 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        스터디몬과 함께하는 즐거운 공부!
                    </h2>

                    <p className="text-2xl mb-10" style={{
                        background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        졸음 감지 & 스터디몬 내장 AI 챗봇 기능
                    </p>

                    <div className="space-y-6 mb-10">
                        <div className="flex gap-3">
                            <span className="text-2xl">📚</span>
                            <p className="text-gray-700">
                                <strong>스터디몬</strong>은 여러분의 공부를 더욱 즐겁고 효율적으로 만들어주는 AI 기반 학습 플랫폼입니다.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <span className="text-2xl">💤</span>
                            <p className="text-gray-700">
                                <strong>졸음 감지 시스템</strong>으로 집중력이 떨어질 때 알려드리고, 귀여운 포켓몬 친구들이 응원해줍니다.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <span className="text-2xl">🤖</span>
                            <p className="text-gray-700">
                                <strong>AI 챗봇</strong>이 궁금한 내용을 바로바로 설명해주고, 학습 계획도 함께 세워드립니다.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <span className="text-2xl">👥</span>
                            <p className="text-gray-700">
                                <strong>스터디룸</strong>에서 친구들과 함께 공부하며 동기부여를 받아보세요!
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <span className="text-2xl">🎮</span>
                            <p className="text-gray-700">
                                공부할수록 <strong>포켓몬이 성장</strong>하고, 다양한 보상을 받을 수 있습니다.
                            </p>
                        </div>
                    </div>

                    <Button
                        className="px-10 py-7 rounded-full text-xl"
                        style={{
                            background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'
                        }}
                        onClick={onCreateStudyRoom}
                    >
                        ⚡ 스터디룸 만들기
                    </Button>
                </div>

                {/* Right Section - 더 작게 */}
                <div className="lg:col-span-1 bg-gradient-to-br from-pink-100 to-pink-50 rounded-3xl p-8 shadow-lg border-4 border-pink-300">
                    <h2 className="text-3xl mb-6 text-center" style={{
                        background: 'linear-gradient(135deg, #F43F5E 0%, #EC4899 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        나만의 포켓몬 만들기
                    </h2>

                    <div className="bg-white rounded-full w-48 h-48 mx-auto mb-6 flex items-center justify-center shadow-md">
                        <ImageWithFallback
                            src="https://images.unsplash.com/photo-1613771404721-1f92d799e49f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2tlYmFsbCUyMHRveXxlbnwxfHx8fDE3NjMzNTk5Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                            alt="Pokemon cards"
                            className="w-36 h-36 object-cover rounded-2xl"
                        />
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex gap-2">
                            <span className="text-xl">✨</span>
                            <p className="text-gray-700 text-sm">
                                공부를 시작하면 나만의 스터디몬이 태어나요!
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <span className="text-xl">📝</span>
                            <p className="text-gray-700 text-sm">
                                공부 시간이 쌓일수록 스터디몬이 레벨업하고 진화합니다.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <span className="text-xl">🎁</span>
                            <p className="text-gray-700 text-sm">
                                다양한 스터디몬을 수집하고 친구들과 공유해보세요!
                            </p>
                        </div>
                    </div>

                    <Button
                        className="w-full py-6 rounded-full text-white shadow-lg"
                        style={{
                            background: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)'
                        }}
                        onClick={onCreatePokemon}
                    >
                        ✨ 내 포켓몬 만들기
                    </Button>
                </div>
            </div>

            {/* 공개 스터디룸 Section */}
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <h2 className="text-4xl text-center" style={{
                        background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        공개 스터디룸
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studyRooms.map((room, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-lg"
                        >
                            <h3 className="text-xl mb-2" style={{
                                background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                {room.title}
                            </h3>
                            <p className="text-gray-600 mb-4">{room.description}</p>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-purple-600">
                                    <Users className="w-4 h-4" />
                                    <span>참여자: {room.participants}명</span>
                                </div>
                                <div className="flex items-center gap-2 text-purple-600">
                                    <Clock className="w-4 h-4" />
                                    <span>평균 공부: {room.avgTime}</span>
                                </div>
                            </div>

                            <Button
                                className="w-full py-5 rounded-full text-white"
                                style={{
                                    background: 'linear-gradient(135deg, #60A5FA 0%, #A855F7 100%)'
                                }}
                                onClick={onJoinStudyRoom}
                            >
                                참여하기 →
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
