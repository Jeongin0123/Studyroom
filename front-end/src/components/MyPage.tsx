import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  User, 
  Trophy, 
  Coins, 
  Flame, 
  Calendar, 
  BookOpen, 
  Award,
  Settings,
  LogOut,
  BarChart3,
  FileText
} from "lucide-react";

export default function MyPage() {
  // Mock user data
  const userData = {
    name: "피카츄 트레이너",
    level: 25,
    currentExp: 750,
    maxExp: 1000,
    studyStreak: 15,
    totalStudyHours: 142,
    completedSessions: 48,
    points: 2450,
    rank: "골드",
    pokemon: "피카츄",
    badges: [
      { name: "7일 연속", icon: "🔥" },
      { name: "100시간", icon: "⏰" },
      { name: "첫 완주", icon: "🏆" },
    ],
    stats: [
      { label: "오늘 공부시간", value: "3시간 20분", icon: BookOpen },
      { label: "이번 주", value: "18시간", icon: Calendar },
      { label: "이번 달", value: "72시간", icon: Trophy },
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-yellow-600">포켓몬 스터디룸</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <div className="w-64 flex-shrink-0 space-y-4">
            {/* Profile Image Card */}
            <Card className="p-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-200 to-orange-200 border-4 border-yellow-400 flex items-center justify-center shadow-lg">
                    <span className="text-6xl">⚡</span>
                  </div>
                  <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 hover:bg-yellow-600">
                    Lv.{userData.level}
                  </Badge>
                </div>
                <h3 className="text-center mb-1">{userData.name}</h3>
                <Badge variant="outline" className="bg-yellow-50">
                  {userData.pokemon}
                </Badge>
              </div>
            </Card>

            {/* Report Bar */}
            <Card className="overflow-hidden">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 py-6 rounded-none hover:bg-yellow-50"
              >
                <BarChart3 className="w-5 h-5 text-yellow-600" />
                <span>리포트</span>
              </Button>
              <div className="border-t">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 py-4 rounded-none hover:bg-yellow-50"
                >
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">주간 리포트</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 py-4 rounded-none hover:bg-yellow-50"
                >
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">월간 리포트</span>
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Card */}
            <Card className="p-6 mb-6 bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-yellow-400 flex items-center justify-center shadow-lg">
                    <span className="text-5xl">⚡</span>
                  </div>
                  <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 hover:bg-yellow-600">
                    Lv.{userData.level}
                  </Badge>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2>{userData.name}</h2>
                    <Badge variant="outline" className="bg-white">
                      {userData.pokemon}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    <span className="text-yellow-700">{userData.rank} 랭크</span>
                    <span className="text-gray-400 mx-2">•</span>
                    <Coins className="w-4 h-4 text-yellow-600" />
                    <span className="text-yellow-700">{userData.points.toLocaleString()} P</span>
                  </div>

                  {/* Experience Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>다음 레벨까지</span>
                      <span>{userData.currentExp} / {userData.maxExp} XP</span>
                    </div>
                    <Progress value={(userData.currentExp / userData.maxExp) * 100} className="h-2" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Study Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {userData.stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-yellow-700">{stat.value}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Achievements Section */}
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-yellow-600" />
                <h3>획득한 배지</h3>
              </div>
              <div className="flex gap-3 flex-wrap">
                {userData.badges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200 hover:border-yellow-400 transition-colors min-w-[100px]"
                  >
                    <span className="text-3xl">{badge.icon}</span>
                    <span className="text-sm text-center">{badge.name}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Study Streak */}
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-orange-700">연속 학습 기록</h3>
                    <p className="text-gray-600">{userData.studyStreak}일 연속 달성 중!</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl text-orange-600">{userData.studyStreak}</div>
                  <div className="text-sm text-gray-600">일</div>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card className="p-4 text-center">
                <p className="text-gray-600 mb-1">총 학습 시간</p>
                <p className="text-2xl text-yellow-600">{userData.totalStudyHours}시간</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-gray-600 mb-1">완료한 세션</p>
                <p className="text-2xl text-yellow-600">{userData.completedSessions}회</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}