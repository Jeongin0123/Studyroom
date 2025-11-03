// components/RoomContext.tsx
import React, { createContext, useContext, useState } from "react";
import { RoomData } from "./CreateStudyRoom";

interface RoomContextType {
  roomData: RoomData | null;
  setRoomData: (data: RoomData | null) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  return (
    <RoomContext.Provider value={{ roomData, setRoomData }}>
      {children}
    </RoomContext.Provider>
  );
}

export const useRoom = () => {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used within RoomProvider");
  return ctx;
};
