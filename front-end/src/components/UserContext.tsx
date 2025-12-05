import { createContext, useContext, useState, type ReactNode } from "react";

interface User {
  userId: number;
  nickname: string;
  email: string;
  exp: number;
  hasPokemon?: boolean;
}

interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  hasPokemon: boolean;
  setPokemon: (has: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = sessionStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [hasPokemon, setHasPokemon] = useState<boolean>(() => {
    const savedPokemon = sessionStorage.getItem("hasPokemon");
    return savedPokemon === "true";
  });

  const login = (userData: User) => {
    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));

    // 로그인 시 포켓몬 보유 여부도 함께 설정
    if (userData.hasPokemon !== undefined) {
      setHasPokemon(userData.hasPokemon);
      sessionStorage.setItem("hasPokemon", userData.hasPokemon.toString());
    }
  }

  const logout = () => {
    setUser(null);
    setHasPokemon(false);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("hasPokemon");
  };

  const setPokemon = (has: boolean) => {
    setHasPokemon(has);
    sessionStorage.setItem("hasPokemon", has.toString());
  };

  return (
    <UserContext.Provider value={{ user, login, logout, hasPokemon, setPokemon }}>
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
