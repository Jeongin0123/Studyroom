import { useState } from 'react';
import { CreateStudyRoom, RoomData } from './components/CreateStudyRoom';
import { CreateRoomPage } from './components/CreateRoomPage';
import { StudyRoom } from './components/StudyRoom';


export default function Roomhandle() {
  const [currentRoom, setCurrentRoom] = useState<RoomData | null>(null);

  const handleCreateRoom = (roomData: RoomData) => {
    setCurrentRoom(roomData);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
  };

  return (
    <>
      {!currentRoom ? (
        // <StudyRoom/>
        <CreateStudyRoom onCreateRoom={handleCreateRoom} />
      ) : (
        <CreateRoomPage roomData={currentRoom} onLeave={handleLeaveRoom} />
      )}
    </>
  );
}
