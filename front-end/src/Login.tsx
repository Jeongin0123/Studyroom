import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import { Lock, User } from "lucide-react";
import { usePage } from "./components/PageContext"
import { useUser } from "./components/UserContext"

export default function Login() {
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { setCurrentPage } = usePage();
  const { login } = useUser();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("아이디와 비밀번호를 입력하세요");
      return;
    }

    login(username); // 로그인 상태 갱신

    console.log("로그인 시도:", { username, password });
    alert(`로그인 성공!\n아이디: ${username}`);
    
    setCurrentPage("home"); // Landing으로 이동
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center">로그인</CardTitle>
          <CardDescription className="text-center">
            아이디와 비밀번호를 입력하세요
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">아이디</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-600">로그인 상태 유지</span>
              </label>
              <a href="#" className="text-blue-600 hover:underline">
                비밀번호 찾기
              </a>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full">
              로그인
            </Button>
            <Button type="button" variant="outline" className="w-full">
              회원가입
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
