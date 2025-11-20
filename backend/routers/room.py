from typing import List, Dict

from fastapi import APIRouter, Depends
from sqlalchemy import func
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

    room_map: Dict[int, Dict] = {}
    all_user_ids = set()
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
            all_user_ids.add(user_id)

    focus_totals = {}
    if all_user_ids:
        focus_rows = (
            db.query(
                models.Report.member_id,
                func.coalesce(func.sum(models.Report.focus_time), 0),
            )
            .filter(models.Report.member_id.in_(all_user_ids))
            .group_by(models.Report.member_id)
            .all()
        )
        focus_totals = {member_id: total for member_id, total in focus_rows}

    return [
        RoomParticipantsOut(
            room_id=data["room_id"],
            title=data["title"],
            capacity=data["capacity"],
            battle_enabled=data["battle_enabled"],
            participant_count=len(data["participant_user_ids"]),
            participant_user_ids=data["participant_user_ids"],
            average_focus_time=(
                sum(focus_totals.get(uid, 0) for uid in data["participant_user_ids"])
                / len(data["participant_user_ids"])
                if data["participant_user_ids"]
                else 0.0
            ),
        )
        for data in room_map.values()
    ]
