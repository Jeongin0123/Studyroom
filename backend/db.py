# Legacy compatibility shim: re-export objects from backend.database
from backend.database import (  # noqa: F401
    Base,
    SessionLocal,
    engine,
    get_db,
    get_session,
)
