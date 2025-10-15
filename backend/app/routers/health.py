from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db


router = APIRouter(prefix="/health", tags=["health"]) 


@router.get("", summary="Healthcheck")
def healthcheck(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {
        "app": settings.APP_NAME,
        "status": "ok",
        "db": "ok",
        "version": "v1",
    }




