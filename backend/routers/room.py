from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from ..schemas.room import RoomParticipantsOut

router = APIRouter(
    prefix="/api/rooms",
    tags=["rooms"],
)


@router.get("/profile", response_model=List[RoomParticipantsOut])
def list_room_participants(db: Session = Depends(get_db)):
    """
    방별로 방 이름, 현재 참여자 수, 최대 참여자 수, 참여자 user_id 목록을 반환한다.
    """
    rows = (
        db.query(
            models.Room.room_id,
            models.Room.title,
            models.Room.capacity,
            models.Room.battle_enabled,
            models.RoomMember.user_id,
        )
        .outerjoin(
            models.RoomMember,
            models.RoomMember.room_id == models.Room.room_id,
        )
        .order_by(models.Room.room_id)
        .all()
    )

    if not rows:
        return []

    room_map = {}
    for room_id, title, capacity, battle_enabled, user_id in rows:
        if room_id not in room_map:
            room_map[room_id] = {
                "room_id": room_id,
                "title": title,
                "capacity": capacity,
                "battle_enabled": battle_enabled,
                "participant_user_ids": [],
            }
        if user_id is not None:
            room_map[room_id]["participant_user_ids"].append(user_id)

    return [
            room_id=data["room_id"],
            title=data["title"],
            capacity=data["capacity"],
            battle_enabled=data["battle_enabled"],
            participant_count=len(data["participant_user_ids"]),
            participant_user_ids=data["participant_user_ids"],
        )
        for data in room_map.values()
    ]
