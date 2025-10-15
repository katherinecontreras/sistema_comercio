from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.config import settings
from app.core.security import verify_password, create_access_token
from app.db.session import get_db
from app.db.models import Usuario, Rol
from app.schemas.auth import LoginRequest, TokenResponse


router = APIRouter(prefix="/auth", tags=["auth"]) 


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user: Usuario | None = db.scalar(select(Usuario).where(Usuario.dni == payload.dni))
    if not user or not user.activo:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    role: Rol | None = db.get(Rol, user.id_rol)
    claims = {"role": role.nombre_rol if role else None, "uid": str(user.id_usuario)}
    token = create_access_token(subject=user.dni, additional_claims=claims)
    return TokenResponse(access_token=token)





