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
    for room_id, title, capacity, purpose, user_id in rows:
        if room_id not in room_map:
            room_map[room_id] = {
                "room_id": room_id,
                "title": title,
                "capacity": capacity,
                "purpose": purpose,
                "participant_user_ids": [],
            }
        if user_id is not None:
            room_map[room_id]["participant_user_ids"].append(user_id)
            all_user_ids.add(user_id)

    # 방별 평균 공부 시간 계산 (각 방에서만 공부한 시간)
    room_averages = {}
    for room_id in room_map.keys():
        # room_id 컬럼 제거로 방별 집중 시간은 계산 불가 → 0으로 반환
        room_averages[room_id] = 0.0

    return [
        RoomParticipantsOut(
            room_id=data["room_id"],
            title=data["title"],
            capacity=data["capacity"],
            purpose=data["purpose"],
            participant_count=len(data["participant_user_ids"]),
            participant_user_ids=data["participant_user_ids"],
            average_focus_time=room_averages.get(data["room_id"], 0.0),
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

    return {"message": "스터디룸이 생성되었습니다.", "room_id": new_room.room_id}


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
        purpose=room.purpose,
    )


@router.post("/out")
def leave_room(
    room_id: int = Query(..., description="방 ID"),
    user_id: int = Query(..., description="사용자 ID"),
    db: Session = Depends(get_db),
):
    """
    방에서 나가기.
    - 공부 시간을 Report 테이블에 저장
    - RoomMember에서 해당 사용자 삭제
    - role이 owner였다면:
        - 다른 인원이 남아있으면 무작위로 한 명을 owner로 승격
        - 다른 인원이 없으면 Room 자체 삭제
    """
    from datetime import datetime, date
    
    room = db.query(models.Room).filter(models.Room.room_id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="해당 스터디룸을 찾을 수 없습니다.")

    membership = (
        db.query(models.RoomMember)
        .filter(
            models.RoomMember.room_id == room_id,
            models.RoomMember.user_id == user_id,
        )
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 사용자는 이 방에 참여하고 있지 않습니다.",
        )

    was_owner = membership.role == "owner"
    
    # Calculate focus time and create Report entry
    leave_time = datetime.now()
    join_time = membership.join_time or leave_time  # Fallback if join_time is None
    
    # Calculate focus_time in minutes
    focus_duration = (leave_time - join_time).total_seconds() / 60
    focus_time_minutes = int(focus_duration)
    
    # Create Report entry
    new_report = models.Report(
        member_id=user_id,
        study_date=date.today(),
        focus_time=focus_time_minutes,
        join_time=join_time,
        leave_time=leave_time,
    )
    db.add(new_report)
    
    # Apply exp penalty based on drowsiness_count
    if membership.drowsiness_count > 0:
        user = db.query(models.User).filter(models.User.user_id == user_id).first()
        if user:
            # Penalty: 10 exp per drowsiness_count
            exp_penalty = membership.drowsiness_count * 10
            user.exp = max(0, user.exp - exp_penalty)  # Ensure exp doesn't go negative
    
    db.delete(membership)
    db.flush()

    remaining_members = (
        db.query(models.RoomMember)
        .filter(models.RoomMember.room_id == room_id)
        .all()
    )

    if not remaining_members:
        # 아무도 남지 않았으면 방 삭제
        db.delete(room)
        db.commit()
        return {"message": "방에서 나갔고, 마지막 참여자였기 때문에 스터디룸이 삭제되었습니다."}

    if was_owner:
        # 남은 멤버 중 무작위로 새 오너 선정
        new_owner = (
            db.query(models.RoomMember)
            .filter(models.RoomMember.room_id == room_id)
            .order_by(func.rand())
            .first()
        )
        if new_owner:
            new_owner.role = "owner"

    db.commit()
    return {"message": "방에서 나갔습니다."}
