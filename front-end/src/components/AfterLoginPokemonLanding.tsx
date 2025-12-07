import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Users, Clock } from "lucide-react";
import { Footer } from "./Footer";
import logo from "../assets/logo.png";
import logoutImg from "../assets/logout.png";
import mypageImg from "../assets/mypage.png";
import bg from "../assets/bg.png";
import { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { useRoom } from "./RoomContext";

interface StudyRoomData {
    room_id: number;
    title: string;
    capacity: number;
    battle_enabled: number;
    purpose: string;
    participant_count: number;
    participant_user_ids: number[];
    average_focus_time: number;
}

interface AfterLoginPokemonLandingProps {
    onMyPage: () => void;
    onLogout: () => void;
    onCreateStudyRoom?: () => void;
    onViewPokemon?: () => void;
    onJoinStudyRoom?: () => void;
}

export function AfterLoginPokemonLanding({ onMyPage, onLogout, onCreateStudyRoom, onViewPokemon, onJoinStudyRoom }: AfterLoginPokemonLandingProps) {
    const [studyRooms, setStudyRooms] = useState<StudyRoomData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [slotOnePokemon, setSlotOnePokemon] = useState<any | null>(null);
    const { user } = useUser();
    const { setRoomData } = useRoom();

    // 스터디룸 목록 가져오기
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await fetch('/api/rooms/all/profile');
                const data = await response.json();

                if (response.ok) {
                    setStudyRooms(data);
                } else {
                    console.error('스터디룸 목록 가져오기 실패:', data);
                }
            } catch (error) {
                console.error('스터디룸 목록 가져오기 오류:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRooms();
    }, []);

    // 내 스터디몬 1번 슬롯 가져오기
    useEffect(() => {
        if (!user) {
            setSlotOnePokemon(null);
            return;
        }

        const fetchSlotOne = async () => {
            try {
                const response = await fetch(`/api/me/active-team?user_id=${user.userId}`);
                const data = await response.json();

                if (response.ok && Array.isArray(data)) {
                    const slot1 = data.find((p: any) => p.slot === 1) || null;
                    setSlotOnePokemon(slot1);
                } else {
                    console.error("포켓몬 팀 가져오기 실패:", data);
                    setSlotOnePokemon(null);
                }
            } catch (error) {
                console.error("포켓몬 팀 가져오기 오류:", error);
                setSlotOnePokemon(null);
            }
        };

        fetchSlotOne();
    }, [user]);

    // 스터디룸 참여하기
    const handleJoinRoom = async (roomId: number) => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            const response = await fetch(`/api/rooms/${roomId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.userId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.detail || '스터디룸 참여에 실패했습니다.');
                return;
            }

            // RoomContext에 방 정보 저장
            setRoomData({
                room_id: data.room_id,
                name: data.title,
                maxParticipants: data.capacity,
                battleMode: data.battle_enabled === 1,
                studyPurpose: data.purpose,
            });

            alert('스터디룸에 참여했습니다!');

            // 스터디룸 입장 페이지로 이동
            onJoinStudyRoom?.();
        } catch (error) {
            console.error('스터디룸 참여 오류:', error);
            alert('스터디룸 참여 중 오류가 발생했습니다.');
        }
    };

    // 공부 목적 한글 변환
    const getPurposeLabel = (purpose: string) => {
        const purposeMap: { [key: string]: string } = {
            exam: "시험 준비",
            certification: "자격증 준비",
            language: "어학 공부",
            programming: "프로그래밍 학습",
            homework: "과제/숙제",
            reading: "독서",
            other: "기타",
        };
        return purposeMap[purpose] || purpose;
    };

    // 평균 공부 시간 포맷팅 (초 -> 시간:분)
    const formatFocusTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}시간 ${minutes}분`;
        }
        return `${minutes}분`;
    };

    const slotOneImg = slotOnePokemon
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${slotOnePokemon.poke_id}.png`
        : "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2tlYmFsbCUyMHRveXxlbnwxfHx8fDE3NjMzNTk5Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080";
    const slotOneName = slotOnePokemon ? slotOnePokemon.name : "내 스터디몬";

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
                                <div className="mb-6 flex flex-col items-center gap-3">
                                    <ImageWithFallback
                                        src={slotOneImg}
                                        alt={slotOneName}
                                        className="w-38 h-38 object-contain drop-shadow-lg"
                                    />
                                    <div className="text-xl font-semibold text-purple-700" style={{ fontFamily: '"PF Stardust Bold", sans-serif' }}>
                                        {slotOneName}
                                    </div>
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

                    {isLoading ? (
                        <div className="text-center py-12">
                            <p className="text-xl text-gray-600">스터디룸 목록을 불러오는 중...</p>
                        </div>
                    ) : studyRooms.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-xl text-gray-600">현재 생성된 스터디룸이 없습니다.</p>
                            <p className="text-sm text-gray-500 mt-2">첫 번째 스터디룸을 만들어보세요!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {studyRooms.map((room) => {
                                const isFull = room.participant_count >= room.capacity;

                                return (
                                    <Card
                                        key={room.room_id}
                                        className="bg-white/90 backdrop-blur-sm border-3 border-blue-200 shadow-lg rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                                    >
                                        <CardHeader>
                                            <h3
                                                className="text-xl text-blue-700"
                                                style={{ fontFamily: '"PF Stardust Bold", sans-serif' }}
                                            >
                                                {room.title}
                                            </h3>
                                            <p className="text-sm text-gray-600">{getPurposeLabel(room.purpose)}</p>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Users className="w-5 h-5 text-purple-500" />
                                                <span>참여자: <strong>{room.participant_count}/{room.capacity}명</strong></span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Clock className="w-5 h-5 text-blue-500" />
                                                <span>평균 공부: <strong>{formatFocusTime(room.average_focus_time)}</strong></span>
                                            </div>
                                            {room.battle_enabled === 1 && (
                                                <div className="flex items-center gap-2 text-red-600">
                                                    <span className="text-sm">⚔️ 배틀 모드</span>
                                                </div>
                                            )}
                                        </CardContent>
                                        <CardFooter>
                                            <Button
                                                className={`w-full rounded-full shadow-md ${isFull
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500'
                                                    } text-white`}
                                                onClick={() => handleJoinRoom(room.room_id)}
                                                disabled={isFull}
                                            >
                                                {isFull ? '정원 마감 ✕' : '참여하기 →'}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
