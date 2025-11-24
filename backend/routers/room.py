from typing import List, Dict

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from ..schemas.room import (
    RoomParticipantsOut,
    RoomCreate,
    RoomJoinRequest,
    RoomJoinResponse,
)

router = APIRouter(
    prefix="/api/rooms",
    tags=["rooms"],
)


def get_current_user(
    user_id: int = Query(..., description="현재 사용자 ID"),
    db: Session = Depends(get_db),
) -> models.User:
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자 인증에 실패했습니다.",
        )
    return user


@router.get("/all/profile", response_model=List[RoomParticipantsOut])
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
            models.Room.purpose,
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
    for room_id, title, capacity, battle_enabled, purpose, user_id in rows:
        if room_id not in room_map:
            room_map[room_id] = {
                "room_id": room_id,
                "title": title,
                "capacity": capacity,
                "battle_enabled": battle_enabled,
                "purpose": purpose,
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
            purpose=data["purpose"],
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


@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_room(
    payload: RoomCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = (
        db.query(models.Room)
        .filter(models.Room.title == payload.title)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 스터디룸 이름입니다.",
        )

    existing_membership = (
        db.query(models.RoomMember)
        .filter(models.RoomMember.user_id == current_user.user_id)
        .first()
    )
    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 참여하고 있는 스터디룸이 있습니다.",
        )

    new_room = models.Room(
        title=payload.title,
        capacity=payload.capacity,
        purpose=payload.purpose,
        battle_enabled=payload.battle_enabled,
    )
    db.add(new_room)
    db.flush()

    owner_member = models.RoomMember(
        room_id=new_room.room_id,
        user_id=current_user.user_id,
        role="owner",
    )
    db.add(owner_member)

    db.commit()
    db.refresh(new_room)

    return {"message": "스터디룸이 생성되었습니다."}


@router.post("/{room_id}/join", response_model=RoomJoinResponse)
def join_room(
    room_id: int,
    payload: RoomJoinRequest,
    db: Session = Depends(get_db),
):
    room = db.query(models.Room).filter(models.Room.room_id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="해당 스터디룸을 찾을 수 없습니다.")

    user = db.query(models.User).filter(models.User.user_id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="해당 사용자를 찾을 수 없습니다.")

    existing_member = (
        db.query(models.RoomMember)
        .filter(
            models.RoomMember.room_id == room_id,
            models.RoomMember.user_id == payload.user_id,
        )
        .first()
    )
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 참여 중인 스터디룸입니다.",
        )

    other_membership = (
        db.query(models.RoomMember)
        .filter(
            models.RoomMember.user_id == payload.user_id,
            models.RoomMember.room_id != room_id,
        )
        .first()
    )
    if other_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 참여하고 있는 스터디룸이 있습니다.",
        )

    current_count = (
        db.query(models.RoomMember)
        .filter(models.RoomMember.room_id == room_id)
        .count()
    )
    if room.capacity is not None and current_count >= room.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 정원이 가득 찼습니다.",
        )

    new_member = models.RoomMember(
        room_id=room_id,
        user_id=payload.user_id,
        role="member",
    )
    db.add(new_member)
    db.commit()

    return RoomJoinResponse(
        message="참여되었습니다.",
        room_id=room.room_id,
        title=room.title,
        capacity=room.capacity,
        battle_enabled=room.battle_enabled,
        purpose=room.purpose,
    )
