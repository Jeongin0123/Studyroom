import { useState } from 'react';
import { CreateStudyRoom, RoomData } from './components/CreateStudyRoom';
import { StudyRoom } from './components/StudyRoom';

export default function StudyRoom() {
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
        <StudyRoom roomData={currentRoom} onLeave={handleLeaveRoom} />
      )}
    </>
  );
}
