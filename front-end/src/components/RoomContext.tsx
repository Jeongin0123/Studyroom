import React, { createContext, useContext, useState, useEffect } from "react";
import { RoomData } from "./CreateStudyRoom";

interface RoomContextType {
  roomData: RoomData | null;
  setRoomData: (data: RoomData | null) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const [roomData, setRoomData] = useState<RoomData | null>(() => {
    const saved = sessionStorage.getItem("roomData");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (roomData) {
      sessionStorage.setItem("roomData", JSON.stringify(roomData));
    } else {
      sessionStorage.removeItem("roomData");
    }
  }, [roomData]);

  return (
    <RoomContext.Provider value={{ roomData, setRoomData }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used within RoomProvider");
  return ctx;
};
