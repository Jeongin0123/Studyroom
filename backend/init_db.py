# remind/init_db.py (임시)
from db import engine, Base
import models
Base.metadata.create_all(bind=engine)
print("tables created")
