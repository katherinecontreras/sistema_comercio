from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.db.models import Tipo_recurso, Recurso
from app.schemas.recursos import (
    TipoRecursoRead,
    TipoRecursoCreate,
    TipoRecursoUpdate,
    RecursoRead,
    RecursoCreate,
    RecursoUpdate,
)

router = APIRouter(prefix="/recursos", tags=["recursos"])


@router.get("/tiposRecurso", response_model=List[TipoRecursoRead])
def listar_tipos_recurso(db: Session = Depends(get_db)):
    return db.scalars(select(Tipo_recurso)).all()


@router.post("/tipoRecurso", response_model=TipoRecursoRead, status_code=status.HTTP_201_CREATED)
def crear_tipo_recurso(payload: TipoRecursoCreate, db: Session = Depends(get_db)):
    existente = db.scalar(select(Tipo_recurso).where(Tipo_recurso.descripcion == payload.descripcion))
    if existente:
        raise HTTPException(status_code=400, detail="El tipo de recurso ya existe")
    nuevo = Tipo_recurso(descripcion=payload.descripcion)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.put("/tipoRecurso/{id}", response_model=TipoRecursoRead)
def actualizar_tipo_recurso(id: int, payload: TipoRecursoUpdate, db: Session = Depends(get_db)):
    tipo = db.get(Tipo_recurso, id)
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de recurso no encontrado")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(tipo, field, value)
    db.commit()
    db.refresh(tipo)
    return tipo


@router.get("/", response_model=List[RecursoRead])
def listar_recursos(tipoId: int | None = Query(default=None, alias="tipoId"), db: Session = Depends(get_db)):
    stmt = select(Recurso)
    if tipoId is not None:
        stmt = stmt.where(Recurso.id_tipo_recurso == tipoId)
    return db.scalars(stmt).all()


@router.post("/", response_model=RecursoRead, status_code=status.HTTP_201_CREATED)
def crear_recurso(payload: RecursoCreate, db: Session = Depends(get_db)):
    # validar tipo
    tipo = db.get(Tipo_recurso, payload.id_tipo_recurso)
    if not tipo:
        raise HTTPException(status_code=400, detail="Tipo de recurso inválido")
    rec = Recurso(**payload.dict())
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


@router.put("/{id}", response_model=RecursoRead)
def actualizar_recurso(id: int, payload: RecursoUpdate, db: Session = Depends(get_db)):
    rec = db.get(Recurso, id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recurso no encontrado")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(rec, field, value)
    db.commit()
    db.refresh(rec)
    return rec
