from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.deps import role_required
from app.core.security import get_password_hash
from app.db.session import get_db
from app.db.models import Usuario
from app.schemas.users import UsuarioCreate, UsuarioRead, UsuarioUpdate


router = APIRouter(prefix="/usuarios", tags=["usuarios"]) 


@router.get("", response_model=list[UsuarioRead])
def list_users(db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador"]))):
    return list(db.scalars(select(Usuario)).all())


@router.post("", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
def create_user(payload: UsuarioCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador"]))):
    existing = db.scalar(select(Usuario).where(Usuario.dni == payload.dni))
    if existing:
        raise HTTPException(status_code=400, detail="El DNI ya existe")
    user = Usuario(
        nombre=payload.nombre,
        dni=payload.dni,
        id_rol=payload.id_rol,
        activo=payload.activo,
        password_hash=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{id_usuario}", response_model=UsuarioRead)
def update_user(id_usuario: int, payload: UsuarioUpdate, db: Session = Depends(get_db), _: None = Depends(role_required(["Administrador"]))):
    user = db.get(Usuario, id_usuario)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if payload.nombre is not None:
        user.nombre = payload.nombre
    if payload.id_rol is not None:
        user.id_rol = payload.id_rol
    if payload.activo is not None:
        user.activo = payload.activo
    if payload.password is not None:
        user.password_hash = get_password_hash(payload.password)
    db.commit()
    db.refresh(user)
    return user

