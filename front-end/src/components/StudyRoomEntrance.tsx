import WebcamView from "../WebcamView";
import { Button } from "./ui/button";
import { usePage } from "./PageContext";
import { Card, CardContent } from "./ui/card";

export function StudyRoomEntrance() {
    const { setCurrentPage } = usePage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-xl">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">스터디룸 입장</h1>
                        <Button variant="outline" onClick={() => setCurrentPage('home')}>
                            취소
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="aspect-video bg-black/90 rounded-xl overflow-hidden shadow-inner">
                                <WebcamView />
                            </div>
                            <p className="text-sm text-gray-600 text-center">
                                카메라와 마이크가 잘 작동하는지 확인해주세요.
                            </p>
                        </div>

                        <div className="flex flex-col justify-center space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-gray-700">입장 전 체크리스트</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-center gap-2">
                                        <span>✅</span> 카메라가 켜져 있나요?
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span>✅</span> 마이크가 작동하나요?
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span>✅</span> 주변이 너무 시끄럽지 않은가요?
                                    </li>
                                </ul>
                            </div>

                            <div className="pt-4">
                                <Button
                                    className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all hover:scale-[1.02]"
                                    onClick={() => setCurrentPage('studyroom')}
                                >
                                    입장하기
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
