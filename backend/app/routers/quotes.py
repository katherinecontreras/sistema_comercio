from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime

from app.core.deps import role_required
from app.db.session import get_db
from app.db.models_quotes import Cotizacion, Obra, ItemObra, ItemObraCosto, Incremento
from app.schemas.quotes import (
    CotizacionCreate,
    CotizacionRead,
    ObraCreate,
    ObraRead,
    ItemCreate,
    ItemRead,
    CostoCreate,
    CostoRead,
    IncrementoCreate,
    IncrementoRead,
    TotalesCotizacion,
    TotalesItem,
)
from app.services.quotes_calc import calcular_totales_cotizacion
from app.services.pdf_export import generar_pdf_planilla
from fastapi.responses import StreamingResponse


router = APIRouter(prefix="/cotizaciones", tags=["cotizaciones"]) 


@router.post("", response_model=CotizacionRead, status_code=status.HTTP_201_CREATED)
def crear_cotizacion(payload: CotizacionCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    c = Cotizacion(**payload.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.get("", response_model=list[CotizacionRead])
def listar_cotizaciones(db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    return list(db.scalars(select(Cotizacion)).all())


@router.post("/{id_cotizacion}/obras", response_model=ObraRead, status_code=status.HTTP_201_CREATED)
def crear_obra(id_cotizacion: int, payload: ObraCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    if id_cotizacion != payload.id_cotizacion:
        raise HTTPException(status_code=400, detail="id_cotizacion inconsistente")
    o = Obra(**payload.model_dump())
    db.add(o)
    db.commit()
    db.refresh(o)
    return o


@router.post("/obras/{id_obra}/items", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
def crear_item(id_obra: int, payload: ItemCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    if id_obra != payload.id_obra:
        raise HTTPException(status_code=400, detail="id_obra inconsistente")
    i = ItemObra(**payload.model_dump())
    db.add(i)
    db.commit()
    db.refresh(i)
    return i


@router.post("/items/{id_item}/costos", response_model=CostoRead, status_code=status.HTTP_201_CREATED)
def agregar_costo(id_item: int, payload: CostoCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    if id_item != payload.id_item_obra:
        raise HTTPException(status_code=400, detail="id_item inconsistente")
    c = ItemObraCosto(**payload.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.post("/items/{id_item}/incrementos", response_model=IncrementoRead, status_code=status.HTTP_201_CREATED)
def agregar_incremento(id_item: int, payload: IncrementoCreate, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    if id_item != payload.id_item_obra:
        raise HTTPException(status_code=400, detail="id_item inconsistente")
    inc = Incremento(**payload.model_dump())
    db.add(inc)
    db.commit()
    db.refresh(inc)
    return inc


@router.get("/{id_cotizacion}/planilla", response_model=TotalesCotizacion)
def visualizar_planilla(id_cotizacion: int, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    cot = db.get(Cotizacion, id_cotizacion)
    if not cot:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")
    subtotal_general, total_general, items = calcular_totales_cotizacion(db, id_cotizacion)
    return TotalesCotizacion(
        id_cotizacion=id_cotizacion,
        subtotal_general=float(subtotal_general),
        total_general=float(total_general),
        items=[
            TotalesItem(
                id_item_obra=iid,
                subtotal_costos=float(subtot),
                total_incrementos=float(inc),
                total_item=float(total),
            )
            for (iid, subtot, inc, total) in items
        ],
    )


@router.get("/{id_cotizacion}/export/pdf")
def exportar_pdf(id_cotizacion: int, db: Session = Depends(get_db), _: None = Depends(role_required(["Cotizador", "Administrador"]))):
    cot = db.get(Cotizacion, id_cotizacion)
    if not cot:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")
    subtotal_general, total_general, items = calcular_totales_cotizacion(db, id_cotizacion)
    data = {
        "cliente": {},
        "nombre_proyecto": cot.nombre_proyecto,
        "items": [
            {
                "codigo": db.get(ItemObra, iid).codigo if db.get(ItemObra, iid) else "",
                "descripcion_tarea": db.get(ItemObra, iid).descripcion_tarea if db.get(ItemObra, iid) else "",
                "unidad": db.get(ItemObra, iid).unidad if db.get(ItemObra, iid) else "",
                "cantidad": float(db.get(ItemObra, iid).cantidad) if db.get(ItemObra, iid) else 0,
                "subtotal_costos": float(subtot),
                "total_incrementos": float(inc),
                "total_item": float(total),
            }
            for (iid, subtot, inc, total) in items
        ],
        "totales": {"subtotal_general": float(subtotal_general), "total_general": float(total_general)},
    }
    pdf = generar_pdf_planilla(data)
    return StreamingResponse(iter([pdf]), media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=cotizacion_{id_cotizacion}.pdf"})
