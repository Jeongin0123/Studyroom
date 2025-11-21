import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Home, ChevronLeft } from "lucide-react";

export function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 여기에 회원가입 로직 추가
    console.log("Sign up:", formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-8">
      {/* Navigation buttons */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border-2 border-purple-300 hover:bg-purple-50 hover:border-purple-400 flex items-center justify-center shadow-md transition-all"
        >
          <Home className="w-5 h-5 text-purple-600" />
        </button>
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border-2 border-purple-300 hover:bg-purple-50 hover:border-purple-400 flex items-center justify-center shadow-md transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-purple-600" />
        </button>
      </div>

      {/* Sign Up Card */}
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-4 border-yellow-400 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-4 pt-8">
            <div className="mb-4 flex justify-center">
              <div className="bg-gray-300 rounded-lg px-8 py-4">
                <span className="text-2xl text-gray-700">LOGO</span>
              </div>
            </div>
            <h2 className="text-3xl text-gray-800 mb-2">
              포켓몬 스터디룸
            </h2>
            <p className="text-gray-600">함께 공부하는 즐거움!</p>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700">
                  사용자 이름
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="트레이너 이름을 입력하세요"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="rounded-full border-2 border-gray-300 focus:border-purple-400 px-4 py-5 bg-gray-50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  이메일
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-full border-2 border-gray-300 focus:border-purple-400 px-4 py-5 bg-gray-50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  비밀번호
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="rounded-full border-2 border-gray-300 focus:border-purple-400 px-4 py-5 bg-gray-50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  비밀번호 확인
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="rounded-full border-2 border-gray-300 focus:border-purple-400 px-4 py-5 bg-gray-50"
                  required
                />
              </div>

              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white rounded-full py-6 shadow-lg hover:shadow-xl transition-all mt-6"
              >
                회원가입
              </Button>

              <Button 
                type="button"
                variant="outline"
                onClick={() => navigate("/login")}
                className="w-full border-2 border-pink-400 text-pink-500 hover:bg-pink-50 rounded-full py-6 shadow-md transition-all"
              >
                로그인
              </Button>
            </form>

            <div className="flex justify-center gap-2 mt-6">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
