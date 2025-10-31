from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import select

from app.core.deps import role_required
from app.db.session import get_db
from app.db.models import Recurso, Tipo_recurso
from app.schemas.recursos import RecursoCreate, RecursoRead, RecursoUpdate, TipoRecursoCreate, TipoRecursoRead, TipoRecursoUpdate


router = APIRouter(prefix="/recursos", tags=["recursos"])

@router.get("/", response_model=List[RecursoRead])
def listar_recursos(db: Session = Depends(get_db)):
    return db.scalars(select(Recurso)).all()

@router.post("", response_model=RecursoRead, status_code=status.HTTP_201_CREATED)
def crear_recurso(
    payload: RecursoCreate, 
    db: Session = Depends(get_db), 
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Crear un nuevo recurso con campos de resumen inicializados"""
    recursos_data = payload.dict()

    recursos = Recurso(**recursos_data)
    db.add(recursos)
    db.commit()
    db.refresh(recursos)
    return recursos

@router.get("/{id}", response_model=RecursoRead)
def obtener_recurso(
    id: int, 
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Obtener un recurso por ID con datos completos"""
    recursos = db.scalar(select(Recurso).where(Recurso.id_recurso == id))
    if not recursos:
        raise HTTPException(status_code=404, detail="recursos no encontrada")
    return recursos

@router.put("/{id}", response_model=RecursoRead)
def actualizar_recurso(
    id: int,
    payload: RecursoUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Actualizar un recurso"""
    recursos = db.scalar(select(Recurso).where(Recurso.id_recurso == id))
    if not recursos:
        raise HTTPException(status_code=404, detail="recursos no encontrada")
    
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(recursos, field, value)
    
    db.commit()
    db.refresh(recursos)
    return recursos


@router.get("/", response_model=List[TipoRecursoRead])
def listar_tipos_recurso(db: Session = Depends(get_db)):
    return db.scalars(select(Tipo_recurso)).all()

@router.post("/tipoRecurso", response_model=TipoRecursoRead, status_code=status.HTTP_201_CREATED)
def crear_tipoRecurso(
    payload: TipoRecursoCreate, 
    db: Session = Depends(get_db), 
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Crear un nuevo recurso con campos de resumen inicializados"""
    tipoRecurso_data = payload.dict()

    tipoRecurso = Tipo_recurso(**tipoRecurso_data)
    db.add(tipoRecurso)
    db.commit()
    db.refresh(tipoRecurso)
    return tipoRecurso

@router.get("/tipoRecurso/{id}", response_model=TipoRecursoRead)
def obtener_tiposRecurso(
    id: int, 
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Obtener un recurso por ID con datos completos"""
    tipoRecurso = db.scalar(select(Tipo_recurso).where(Tipo_recurso.id_tipo_recurso == id))
    if not tipoRecurso:
        raise HTTPException(status_code=404, detail="tipoRecurso no encontrada")
    return tipoRecurso

@router.put("/tipoRecurso/{id}", response_model=TipoRecursoRead)
def actualizar_tipoRecurso(
    id: int,
    payload: TipoRecursoUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Actualizar un recurso"""
    tipoRecurso = db.scalar(select(Tipo_recurso).where(Tipo_recurso.id_tipo_recurso == id))
    if not tipoRecurso:
        raise HTTPException(status_code=404, detail="tipoRecurso no encontrada")
    
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(tipoRecurso, field, value)
    
    db.commit()
    db.refresh(tipoRecurso)
    return tipoRecurso

