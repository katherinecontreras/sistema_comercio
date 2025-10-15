from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.deps import role_required
from app.db.session import get_db
from app.db.models import Rol
from app.schemas.users import RolCreate, RolRead


router = APIRouter(prefix="/roles", tags=["roles"]) 


@router.get("", response_model=list[RolRead])
def list_roles(db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador"]))):
    return list(db.scalars(select(Rol)).all())


@router.post("", response_model=RolRead, status_code=status.HTTP_201_CREATED)
def create_role(payload: RolCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador"]))):
    existing = db.scalar(select(Rol).where(Rol.nombre_rol == payload.nombre_rol))
    if existing:
        raise HTTPException(status_code=400, detail="El rol ya existe")
    role = Rol(nombre_rol=payload.nombre_rol, descripcion=payload.descripcion)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role



