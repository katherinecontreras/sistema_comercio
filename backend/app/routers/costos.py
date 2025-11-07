from typing import List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import role_required
from app.db.models import Costo, TipoCosto
from app.db.session import get_db
from app.schemas.costos import (
    CostoCreate,
    CostoRead,
    CostoUpdate,
    TipoCostoCreate,
    TipoCostoRead,
    TipoCostoUpdate,
)


router = APIRouter(prefix="/costos", tags=["Costos"])


def _extract_item_identifier(item: Dict[str, Any]) -> Any:
    for key in ("idItem", "id", "id_item"):
        if key in item:
            return item[key]
    return None


def _extract_item_total(item: Dict[str, Any]) -> float:
    for key in ("total", "costo_total"):
        value = item.get(key)
        if value is not None:
            return float(value)
    return 0.0


def recalculate_tipo_costo(db: Session, tipo_costo: TipoCosto) -> None:
    total = 0.0
    items_totals: Dict[Any, float] = {}

    for costo in tipo_costo.costos:
        total += float(costo.costo_total or 0.0)
        for item in costo.itemsObra or []:
            item_id = _extract_item_identifier(item)
            if item_id is None:
                continue
            items_totals[item_id] = items_totals.get(item_id, 0.0) + _extract_item_total(item)

    tipo_costo.costo_total = total

    if tipo_costo.items:
        updated_items = []
        for entry in tipo_costo.items:
            item_id = _extract_item_identifier(entry)
            if item_id is None:
                updated_items.append(entry)
                continue
            nuevo_total = items_totals.get(item_id, 0.0)
            actualizado = {**entry}
            if "costo_total" in actualizado:
                actualizado["costo_total"] = nuevo_total
            elif "total" in actualizado:
                actualizado["total"] = nuevo_total
            else:
                actualizado["costo_total"] = nuevo_total
            updated_items.append(actualizado)
        tipo_costo.items = updated_items

    db.add(tipo_costo)


@router.get("/tipos", response_model=List[TipoCostoRead])
def listar_tipos_costo(db: Session = Depends(get_db)):
    return db.scalars(select(TipoCosto)).all()


@router.post("/tipos", response_model=TipoCostoRead, status_code=status.HTTP_201_CREATED)
def crear_tipo_costo(
    payload: TipoCostoCreate,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    tipo_costo = TipoCosto(**payload.model_dump())
    db.add(tipo_costo)
    db.commit()
    db.refresh(tipo_costo)
    return tipo_costo


@router.get("/tipos/{id_tipo_costo}", response_model=TipoCostoRead)
def obtener_tipo_costo(id_tipo_costo: int, db: Session = Depends(get_db)):
    tipo_costo = db.get(TipoCosto, id_tipo_costo)
    if not tipo_costo:
        raise HTTPException(status_code=404, detail="Tipo de costo no encontrado")
    return tipo_costo


@router.put("/tipos/{id_tipo_costo}", response_model=TipoCostoRead)
def actualizar_tipo_costo(
    id_tipo_costo: int,
    payload: TipoCostoUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    tipo_costo = db.get(TipoCosto, id_tipo_costo)
    if not tipo_costo:
        raise HTTPException(status_code=404, detail="Tipo de costo no encontrado")

    for campo, valor in payload.model_dump(exclude_unset=True).items():
        setattr(tipo_costo, campo, valor)

    recalculate_tipo_costo(db, tipo_costo)
    db.commit()
    db.refresh(tipo_costo)
    return tipo_costo


@router.delete("/tipos/{id_tipo_costo}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_tipo_costo(
    id_tipo_costo: int,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    tipo_costo = db.get(TipoCosto, id_tipo_costo)
    if not tipo_costo:
        raise HTTPException(status_code=404, detail="Tipo de costo no encontrado")

    db.delete(tipo_costo)
    db.commit()


@router.get("/", response_model=List[CostoRead])
def listar_costos(db: Session = Depends(get_db)):
    return db.scalars(select(Costo)).all()


@router.post("/", response_model=CostoRead, status_code=status.HTTP_201_CREATED)
def crear_costo(
    payload: CostoCreate,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    tipo_costo = db.get(TipoCosto, payload.id_tipo_costo)
    if not tipo_costo:
        raise HTTPException(status_code=404, detail="Tipo de costo asociado no existe")

    costo = Costo(**payload.model_dump())
    db.add(costo)
    db.flush()

    recalculate_tipo_costo(db, tipo_costo)
    db.commit()
    db.refresh(costo)
    return costo


@router.get("/{id_costo}", response_model=CostoRead)
def obtener_costo(id_costo: int, db: Session = Depends(get_db)):
    costo = db.get(Costo, id_costo)
    if not costo:
        raise HTTPException(status_code=404, detail="Costo no encontrado")
    return costo


@router.put("/{id_costo}", response_model=CostoRead)
def actualizar_costo(
    id_costo: int,
    payload: CostoUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    costo = db.get(Costo, id_costo)
    if not costo:
        raise HTTPException(status_code=404, detail="Costo no encontrado")

    datos = payload.model_dump(exclude_unset=True)
    tipo_costo_origen = costo.tipo_costo
    if "id_tipo_costo" in datos:
        tipo_costo_destino = db.get(TipoCosto, datos["id_tipo_costo"])
        if not tipo_costo_destino:
            raise HTTPException(status_code=404, detail="Tipo de costo destino no existe")
    else:
        tipo_costo_destino = tipo_costo_origen

    for campo, valor in datos.items():
        setattr(costo, campo, valor)

    db.flush()
    tipo_costo_actual = costo.tipo_costo

    if tipo_costo_destino and tipo_costo_destino.id_tipo_costo != (tipo_costo_origen.id_tipo_costo if tipo_costo_origen else None):
        recalculate_tipo_costo(db, tipo_costo_destino)

    if tipo_costo_origen and tipo_costo_origen.id_tipo_costo != (tipo_costo_destino.id_tipo_costo if tipo_costo_destino else None):
        recalculate_tipo_costo(db, tipo_costo_origen)
    elif tipo_costo_actual:
        recalculate_tipo_costo(db, tipo_costo_actual)

    db.commit()
    db.refresh(costo)
    return costo


@router.delete("/{id_costo}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_costo(
    id_costo: int,
    db: Session = Depends(get_db),
    _: None = Depends(role_required(["Cotizador", "Administrador"]))
):
    costo = db.get(Costo, id_costo)
    if not costo:
        raise HTTPException(status_code=404, detail="Costo no encontrado")

    tipo_costo = costo.tipo_costo
    db.delete(costo)
    db.flush()

    if tipo_costo:
        recalculate_tipo_costo(db, tipo_costo)

    db.commit()

