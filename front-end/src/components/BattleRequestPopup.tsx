import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { UserPlus } from "lucide-react";
import battleImg from "../assets/battle.png";

interface BattleRequestPopupProps {
    requesterName: string;
    onAccept: () => void;
    onReject: () => void;
}

export function BattleRequestPopup({ requesterName, onAccept, onReject }: BattleRequestPopupProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
            <Card className="max-w-3xl w-full p-12 bg-white shadow-2xl rounded-3xl border-8 border-yellow-300 animate-in zoom-in-95 duration-200">
                {/* 아이콘 */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="w-24 h-24 flex items-center justify-center bg-white">
                            <img src={battleImg} alt="배틀" className="w-30 h-24" />
                        </div>
                    </div>
                </div>

                {/* 제목 */}
                <h1 className="text-center mb-4 text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                    배틀 신청
                </h1>

                {/* 메시지 */}
                <p className="text-center text-xl text-gray-700 mb-10">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg border border-blue-200 font-semibold text-blue-700">
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
                        className="py-7 text-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
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
