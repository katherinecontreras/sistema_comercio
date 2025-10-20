from pydantic import BaseModel
from typing import List
from datetime import date


class CotizacionCreate(BaseModel):
    id_cliente: int
    nombre_proyecto: str
    descripcion_proyecto: str | None = None
    fecha_creacion: date
    fecha_inicio: date | None = None
    fecha_vencimiento: date | None = None
    moneda: str | None = "ARS"
    estado: str | None = "Borrador"


class CotizacionRead(BaseModel):
    id_cotizacion: int
    id_cliente: int
    nombre_proyecto: str
    descripcion_proyecto: str | None = None
    fecha_creacion: date
    fecha_inicio: date | None = None
    fecha_vencimiento: date | None = None
    moneda: str | None = "ARS"
    estado: str

    class Config:
        from_attributes = True


class ObraCreate(BaseModel):
    id_cotizacion: int
    nombre_obra: str
    descripcion: str | None = None
    ubicacion: str | None = None


class ObraRead(BaseModel):
    id_obra: int
    id_cotizacion: int
    nombre_obra: str
    descripcion: str | None
    ubicacion: str | None = None

    class Config:
        from_attributes = True


class ItemCreate(BaseModel):
    id_obra: int
    id_item_padre: int | None = None
    codigo: str | None = None
    descripcion_tarea: str
    id_especialidad: int | None = None
    id_unidad: int | None = None
    cantidad: float = 0
    precio_unitario: float = 0


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
    total_linea: float


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
    concepto: str
    descripcion: str | None = None
    tipo_incremento: str = "porcentaje"
    valor: float
    porcentaje: float = 0
    monto_calculado: float = 0


class IncrementoRead(BaseModel):
    id_incremento: int
    id_item_obra: int
    concepto: str
    descripcion: str | None
    tipo_incremento: str
    valor: float
    porcentaje: float
    monto_calculado: float

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


