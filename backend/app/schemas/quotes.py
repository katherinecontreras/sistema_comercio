from pydantic import BaseModel
from typing import List
from datetime import date


class CotizacionCreate(BaseModel):
    id_cliente: int
    nombre_proyecto: str
    fecha_creacion: str  # YYYY-MM-DD


class CotizacionRead(BaseModel):
    id_cotizacion: int
    id_cliente: int
    nombre_proyecto: str
    fecha_creacion: date
    estado: str

    class Config:
        from_attributes = True


class ObraCreate(BaseModel):
    id_cotizacion: int
    nombre_obra: str
    descripcion: str | None = None


class ObraRead(BaseModel):
    id_obra: int
    id_cotizacion: int
    nombre_obra: str
    descripcion: str | None

    class Config:
        from_attributes = True


class ItemCreate(BaseModel):
    id_obra: int
    id_item_padre: int | None = None
    codigo: str | None = None
    descripcion_tarea: str
    especialidad: str | None = None
    unidad: str | None = None
    cantidad: float


class ItemRead(BaseModel):
    id_item_obra: int
    id_obra: int
    id_item_padre: int | None
    codigo: str | None
    descripcion_tarea: str
    especialidad: str | None
    unidad: str | None
    cantidad: float

    class Config:
        from_attributes = True


class CostoCreate(BaseModel):
    id_item_obra: int
    id_recurso: int
    cantidad: float
    precio_unitario_aplicado: float


class CostoRead(BaseModel):
    id_item_costo: int
    id_item_obra: int
    id_recurso: int
    cantidad: float
    precio_unitario_aplicado: float
    total_linea: float

    class Config:
        from_attributes = True


class IncrementoCreate(BaseModel):
    id_item_obra: int
    descripcion: str
    porcentaje: float


class IncrementoRead(BaseModel):
    id_incremento: int
    id_item_obra: int
    descripcion: str
    porcentaje: float

    class Config:
        from_attributes = True


class TotalesItem(BaseModel):
    id_item_obra: int
    subtotal_costos: float
    total_incrementos: float
    total_item: float


class TotalesCotizacion(BaseModel):
    id_cotizacion: int
    subtotal_general: float
    total_general: float
    items: List[TotalesItem]




