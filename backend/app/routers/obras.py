from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.deps import role_required
from app.db.session import get_db
from app.db.models import Obra
from app.schemas.obras import ObraCreate, ObraRead, ObraUpdate


router = APIRouter(prefix="/obras", tags=["obras"])

@router.get("/", response_model=list[ObraRead])
def listar_Obras(db: Session = Depends(get_db)):
    return db.scalars(select(Obra)).all()


@router.post("", response_model=ObraRead, status_code=status.HTTP_201_CREATED)
def crear_obra(
    payload: ObraCreate, 
    db: Session = Depends(get_db), 
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Crear una nueva obra con campos de resumen inicializados"""
    obra_data = payload.dict()

    obra = Obra(**obra_data)
    db.add(obra)
    db.commit()
    db.refresh(obra)
    return obra


@router.get("/{id}", response_model=ObraRead)
def obtener_obra(
    id: int, 
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Obtener una obra por ID con datos completos"""
    obra = db.scalar(select(Obra).where(Obra.id_obra == id))
    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    return obra


@router.put("/{id}", response_model=ObraRead)
def actualizar_obra(
    id: int,
    payload: ObraUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Actualizar una obra"""
    obra = db.scalar(select(Obra).where(Obra.id_obra == id))
    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(obra, field, value)
    
    db.commit()
    db.refresh(obra)
    return obra


