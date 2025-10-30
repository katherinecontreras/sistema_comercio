from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


# ============================================================================
# SCHEMAS BASE
# ============================================================================

class ObraBase(BaseModel):
    id_cliente: int
    codigo_proyecto: Optional[str] = None
    nombre_proyecto: str
    descripcion_proyecto: Optional[str] = None
    fecha_creacion: date
    fecha_entrega: Optional[date] = None
    fecha_recepcion: Optional[date] = None
    moneda: str = "USD"
    estado: str = "borrador"


class ObraCreate(ObraBase):
    pass


class ObraUpdate(BaseModel):
    codigo_proyecto: Optional[str] = None
    nombre_proyecto: Optional[str] = None
    descripcion_proyecto: Optional[str] = None
    fecha_entrega: Optional[date] = None
    fecha_recepcion: Optional[date] = None
    moneda: Optional[str] = None
    estado: Optional[str] = None


class ObraRead(ObraBase):
    id_obra: int
    id_cliente: int
    codigo_proyecto: str
    nombre_proyecto: str
    descripcion_proyecto: str
    fecha_creacion: date
    fecha_entrega: Optional[date] = None
    fecha_recepcion: Optional[date] = None
    moneda: str = "USD"
    estado: str = "borrador"

    class Config:
        from_attributes = True
