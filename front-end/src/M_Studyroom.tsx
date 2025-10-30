import { useState } from 'react';
import { CreateStudyRoom, RoomData } from './components/CreateStudyRoom';
import { M_StudyRoom } from './components/M_StudyRoom';

export default function M_StudyRoom() {
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
        <CreateStudyRoom onCreateRoom={handleCreateRoom} />
      ) : (
        <M_StudyRoom roomData={currentRoom} onLeave={handleLeaveRoom} />
      )}
    </>
  );
}
