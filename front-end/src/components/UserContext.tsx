import { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
  user: string | null;
  login: (username: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(() => {
  const savedUser = sessionStorage.getItem("user");
  return savedUser ? savedUser : null;
});

  const login = (username: string) => {
    setUser(username); // 아마 닉네임으로 바꿔야 하긴 함.
    sessionStorage.setItem("user", username);
  }
  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// 로그인 하지 않았을 때, useUser을 제공. 대표적으로 Landing페이지에 처음 접근 시, 해당 컨텍스트를 null로 제공.
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
