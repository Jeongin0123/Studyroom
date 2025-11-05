# remind/PokemonRoute/focus_rules.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db import get_db                # ✅ 의존성 주입용 세션
from models import UserPokemon, FocusEventLog

router = APIRouter(prefix="/focus", tags=["focus"])


class FocusEventIn(BaseModel):
    user_id: int
    event_type: str        # 'FOCUS_PLUS' | 'DROWSY'
    metric: float = 0.0    # 예: 집중분, 졸음확률


EVOLVE_THRESH = [0, 60, 180]   # 1→2:60, 2→3:180 (원하면 조절)
PENALTY_DROWSY = 10


@router.post("/event")
def apply_event(e: FocusEventIn, session: Session = Depends(get_db)):
    """집중/졸음 이벤트를 적용하고 포켓몬 상태를 갱신."""
    up = session.query(UserPokemon).filter_by(user_id=e.user_id).first()
    if not up:
        return {"ok": False, "error": "user_pokemon missing"}

    log = FocusEventLog(
        user_id=e.user_id, event_type=e.event_type, score=0, payload={"metric": e.metric}
    )

    if e.event_type == "FOCUS_PLUS":
        # 예: 1분당 EXP +1 (음수 방지)
        gained = int(max(0, e.metric))
        up.exp += gained
        log.score = gained

    elif e.event_type == "DROWSY":
        # 에너지 패널티 적용
        up.energy = max(0, up.energy - PENALTY_DROWSY)
        log.score = -PENALTY_DROWSY

    # ── 진화/퇴화 판정 ─────────────────────────────────────────────
    before = up.stage

    # 에너지 고갈 시 한 단계 하락(퇴화) + 최소 회복 버퍼
    if up.energy == 0 and up.stage > 1:
        up.stage -= 1
        up.energy = 30

    # EXP 임계치 달성 시 단계 상승(진화)
    for s, th in enumerate(EVOLVE_THRESH, start=1):
        if up.exp >= th:
            up.stage = max(up.stage, s)

    evolved = (before != up.stage)
    # ─────────────────────────────────────────────────────────────

    session.add_all([log, up])
    session.commit()

    return {
        "ok": True,
        "stage": up.stage,
        "energy": up.energy,
        "exp": up.exp,
        "evolved": evolved,
    }
