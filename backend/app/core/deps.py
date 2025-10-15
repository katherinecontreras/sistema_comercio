from typing import Callable, Iterable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.config import settings
from app.db.session import get_db
from app.db.models import Usuario, Rol


oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    invalid_exc = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        dni: str | None = payload.get("sub")
        if not dni:
            raise invalid_exc
    except JWTError:
        raise invalid_exc

    user: Usuario | None = db.scalar(select(Usuario).where(Usuario.dni == dni))
    if not user or not user.activo:
        raise invalid_exc
    return user


def role_required(roles: Iterable[str]) -> Callable[[Usuario], Usuario]:
    def dependency(user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)) -> Usuario:
        role: Rol | None = db.get(Rol, user.id_rol)
        if not role or role.nombre_rol not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permiso denegado")
        return user

    return dependency


