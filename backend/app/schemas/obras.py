from pydantic import BaseModel, Field
from datetime import date
from typing import List, Optional


# TipoTiempo
class TipoTiempoBase(BaseModel):
    nombre: str
    medida: str


class TipoTiempoCreate(TipoTiempoBase):
    pass


class TipoTiempoRead(TipoTiempoBase):
    id_tipo_tiempo: int

    class Config:
        from_attributes = True


# Obras
class ObraBase(BaseModel):
    id_cliente: int
    codigo_proyecto: Optional[str] = None
    nombre_proyecto: str
    descripcion_proyecto: Optional[str] = None
    fecha_creacion: date = Field(default_factory=date.today)
    fecha_entrega: Optional[date] = None
    fecha_recepcion: Optional[date] = None
    moneda: str = "USD"
    estado: str = "borrador"
    # Campos de resumen calculados
    total_partidas: int = 0
    total_subpartidas: int = 0
    total_costo_obra_sin_incremento: float = 0
    total_costo_obra_con_incrementos: float = 0
    total_duracion_obra: float = 0
    total_incrementos: float = 0
    costos_partidas: Optional[dict] = None


class ObraCreate(ObraBase):
    pass


class ObraRead(ObraBase):
    id_obra: int

    class Config:
        from_attributes = True


# Partidas
class PartidaBase(BaseModel):
    id_obra: int
    nombre_partida: str
    descripcion: Optional[str] = None
    codigo: Optional[str] = None
    duracion: float = 0
    id_tipo_tiempo: Optional[int] = None
    especialidad: Optional[dict] = None


class PartidaCreate(BaseModel):
    nombre_partida: str
    descripcion: Optional[str] = None
    codigo: Optional[str] = None
    duracion: float = 0
    id_tipo_tiempo: Optional[int] = None
    especialidad: Optional[dict] = None
    tiene_subpartidas: bool = False


class PartidaRead(PartidaBase):
    id_partida: int
    tiene_subpartidas: bool = False

    class Config:
        from_attributes = True


# SubPartidas
class SubPartidaBase(BaseModel):
    id_partida: int
    codigo: Optional[str] = None
    descripcion_tarea: str
    id_especialidad: Optional[int] = None


class SubPartidaCreate(SubPartidaBase):
    pass


class SubPartidaRead(SubPartidaBase):
    id_subpartida: int

    class Config:
        from_attributes = True


# Costos de Partidas
class PartidaCostoBase(BaseModel):
    id_recurso: int
    cantidad: float = 0
    precio_unitario_aplicado: float = 0
    total_linea: float = 0
    porcentaje_de_uso: float = 0
    tiempo_de_uso: float = 0


class PartidaCostoCreate(PartidaCostoBase):
    id_partida: int


class PartidaCostoRead(PartidaCostoBase):
    id_costo: int
    id_partida: int

    class Config:
        from_attributes = True


# Costos de SubPartidas
class SubPartidaCostoBase(BaseModel):
    id_recurso: int
    cantidad: float = 0
    precio_unitario_aplicado: float = 0
    total_linea: float = 0
    porcentaje_de_uso: float = 0
    tiempo_de_uso: float = 0


class SubPartidaCostoCreate(SubPartidaCostoBase):
    id_subpartida: int


class SubPartidaCostoRead(SubPartidaCostoBase):
    id_costo: int
    id_subpartida: int

    class Config:
        from_attributes = True


# Incrementos
class IncrementoBase(BaseModel):
    id_partida: Optional[int] = None
    id_subpartida: Optional[int] = None
    concepto: str
    descripcion: Optional[str] = None
    tipo_incremento: str = "porcentaje"
    valor: float = 0
    porcentaje: float = 0
    monto_calculado: float = 0


class IncrementoCreate(IncrementoBase):
    pass


class IncrementoRead(IncrementoBase):
    id_incremento: int

    class Config:
        from_attributes = True
