from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List

from app.core.deps import role_required
from app.db.session import get_db
from app.db.models import ItemObra
from app.schemas.itemsObra import ItemObraCreate, ItemObraRead, ItemObraUpdate


router = APIRouter(prefix="/itemsObra", tags=["itemsObra"])

@router.get("/", response_model=List[ItemObraRead])
def listar_itemsObra(db: Session = Depends(get_db)):
    return db.scalars(select(ItemObra)).all()

@router.post("", response_model=ItemObraRead, status_code=status.HTTP_201_CREATED)
def crear_itemObra(
    payload: ItemObraCreate, 
    db: Session = Depends(get_db), 
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Crear una nueva itemObra con campos de resumen inicializados"""
    itemsObra_data = payload.dict()

    itemsObra = ItemObra(**itemsObra_data)
    db.add(itemsObra)
    db.commit()
    db.refresh(itemsObra)
    return itemsObra

@router.get("/{id}", response_model=ItemObraRead)
def obtener_itemObra(
    id: int, 
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Obtener un itemObra por ID con datos completos"""
    itemsObra = db.scalar(select(ItemObra).where(ItemObra.id_item_Obra == id))
    if not itemsObra:
        raise HTTPException(status_code=404, detail="itemsObra no encontrada")
    return itemsObra

@router.put("/{id}", response_model=ItemObraRead)
def actualizar_itemObra(
    id: int,
    payload: ItemObraUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    """Actualizar un itemObra"""
    itemsObra = db.scalar(select(ItemObra).where(ItemObra.id_item_Obra == id))
    if not itemsObra:
        raise HTTPException(status_code=404, detail="itemsObra no encontrada")
    
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(itemsObra, field, value)
    
    db.commit()
    db.refresh(itemsObra)
    return itemsObra


