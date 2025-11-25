import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Swords, UserPlus } from "lucide-react";

interface BattleRequestPopupProps {
    requesterName: string;
    onAccept: () => void;
    onReject: () => void;
}

export function BattleRequestPopup({ requesterName, onAccept, onReject }: BattleRequestPopupProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
            <Card className="max-w-3xl w-full p-12 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border-2 border-purple-200 animate-in zoom-in-95 duration-200">
                {/* 아이콘 */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                            <Swords className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center border-4 border-white">
                            <UserPlus className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                {/* 제목 */}
                <h1 className="text-center mb-4 text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    배틀 신청
                </h1>

                {/* 메시지 */}
                <p className="text-center text-xl text-gray-700 mb-10">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200 font-semibold text-purple-700">
                        {requesterName}
                    </span>
                    <span className="mx-2">님으로부터</span>
                    <br />
                    <span className="mt-2 inline-block">배틀 신청이 들어왔습니다.</span>
                </p>

                {/* 버튼 그룹 */}
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        onClick={onAccept}
                        className="py-7 text-lg bg-gradient-to-r from-purple-400 via-purple-500 to-pink-500 hover:from-purple-500 hover:via-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                        수락
                    </Button>
                    <Button
                        onClick={onReject}
                        variant="outline"
                        className="py-7 text-lg bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 rounded-2xl shadow-sm hover:shadow-md transition-all hover:scale-105"
                    >
                        거절
                    </Button>
                </div>
            </Card>
        </div>
    );
}
