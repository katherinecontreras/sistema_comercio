from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date
from decimal import Decimal


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
    total_partidas: int = 0
    total_subpartidas: int = 0
    total_costo_obra_sin_incremento: Decimal = Decimal('0')
    total_costo_obra_con_incrementos: Decimal = Decimal('0')
    total_duracion_obra: Decimal = Decimal('0')
    total_incrementos: Decimal = Decimal('0')
    costos_partidas: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class ObraResumenRead(ObraRead):
    recursos_por_planilla: Dict[int, int] = {}
    estadisticas_detalladas: Dict[str, Any] = {}


# ============================================================================
# SCHEMAS DE PARTIDAS
# ============================================================================

class PartidaBase(BaseModel):
    id_obra: int
    nombre_partida: str
    descripcion: Optional[str] = None
    codigo: Optional[str] = None
    tiene_subpartidas: bool = False
    duracion: Decimal = Decimal('0')
    id_tipo_tiempo: Optional[int] = None
    especialidad: Optional[List[Dict[str, Any]]] = None


class PartidaCreate(PartidaBase):
    pass


class PartidaUpdate(BaseModel):
    nombre_partida: Optional[str] = None
    descripcion: Optional[str] = None
    codigo: Optional[str] = None
    tiene_subpartidas: Optional[bool] = None
    duracion: Optional[Decimal] = None
    id_tipo_tiempo: Optional[int] = None
    especialidad: Optional[List[Dict[str, Any]]] = None


class PartidaRead(PartidaBase):
    id_partida: int
    tipo_tiempo: Optional[Dict[str, Any]] = None
    subpartidas: Optional[List['SubPartidaRead']] = None
    costos: Optional[List['PartidaCostoRead']] = None
    incrementos: Optional[List['IncrementoRead']] = None

    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS DE SUBPARTIDAS
# ============================================================================

class SubPartidaBase(BaseModel):
    id_partida: int
    codigo: Optional[str] = None
    descripcion_tarea: str
    id_especialidad: Optional[int] = None
    duracion: Optional[Decimal] = None
    id_tipo_tiempo: Optional[int] = None


class SubPartidaCreate(SubPartidaBase):
    pass


class SubPartidaUpdate(BaseModel):
    codigo: Optional[str] = None
    descripcion_tarea: Optional[str] = None
    id_especialidad: Optional[int] = None
    duracion: Optional[Decimal] = None
    id_tipo_tiempo: Optional[int] = None


class SubPartidaRead(SubPartidaBase):
    id_subpartida: int
    tipo_tiempo: Optional[Dict[str, Any]] = None
    costos: Optional[List['SubPartidaCostoRead']] = None
    incrementos: Optional[List['IncrementoRead']] = None

    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS DE COSTOS
# ============================================================================

class PartidaCostoBase(BaseModel):
    id_partida: int
    id_tipo_recurso: int
    id_recurso: int
    cantidad: Decimal
    precio_unitario: Decimal
    costo_total: Decimal
    porcentaje_de_uso: Decimal = Decimal('100.00')
    tiempo_de_uso: Decimal = Decimal('0')


class PartidaCostoCreate(PartidaCostoBase):
    pass


class PartidaCostoUpdate(BaseModel):
    cantidad: Optional[Decimal] = None
    precio_unitario: Optional[Decimal] = None
    costo_total: Optional[Decimal] = None
    porcentaje_de_uso: Optional[Decimal] = None
    tiempo_de_uso: Optional[Decimal] = None


class PartidaCostoRead(PartidaCostoBase):
    id_costo: int
    recurso: Optional[Dict[str, Any]] = None
    tipo_recurso: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class SubPartidaCostoBase(BaseModel):
    id_subpartida: int
    id_tipo_recurso: int
    id_recurso: int
    cantidad: Decimal
    precio_unitario: Decimal
    costo_total: Decimal
    porcentaje_de_uso: Decimal = Decimal('100.00')
    tiempo_de_uso: Decimal = Decimal('0')


class SubPartidaCostoCreate(SubPartidaCostoBase):
    pass


class SubPartidaCostoUpdate(BaseModel):
    cantidad: Optional[Decimal] = None
    precio_unitario: Optional[Decimal] = None
    costo_total: Optional[Decimal] = None
    porcentaje_de_uso: Optional[Decimal] = None
    tiempo_de_uso: Optional[Decimal] = None


class SubPartidaCostoRead(SubPartidaCostoBase):
    id_costo: int
    recurso: Optional[Dict[str, Any]] = None
    tipo_recurso: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS DE INCREMENTOS
# ============================================================================

class IncrementoBase(BaseModel):
    id_obra: int
    id_partida: Optional[int] = None
    id_subpartida: Optional[int] = None
    concepto: str
    descripcion: Optional[str] = None
    tipo_incremento: str  # 'porcentaje' o 'monto_fijo'
    valor: Decimal
    porcentaje: Optional[Decimal] = None
    monto_calculado: Decimal


class IncrementoCreate(IncrementoBase):
    pass


class IncrementoUpdate(BaseModel):
    concepto: Optional[str] = None
    descripcion: Optional[str] = None
    tipo_incremento: Optional[str] = None
    valor: Optional[Decimal] = None
    porcentaje: Optional[Decimal] = None
    monto_calculado: Optional[Decimal] = None


class IncrementoRead(IncrementoBase):
    id_incremento: int
    partida: Optional[Dict[str, Any]] = None
    subpartida: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS DE TIPOS DE TIEMPO
# ============================================================================

class TipoTiempoBase(BaseModel):
    nombre: str
    medida: str


class TipoTiempoCreate(TipoTiempoBase):
    pass


class TipoTiempoRead(TipoTiempoBase):
    id_tipo_tiempo: int

    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS DE RECURSOS OPTIMIZADOS
# ============================================================================

class RecursoRead(BaseModel):
    id_recurso: int
    id_tipo_recurso: int
    descripcion: str
    id_unidad: Optional[int] = None
    cantidad: Decimal
    costo_unitario_predeterminado: Decimal
    costo_total: Decimal
    id_proveedor_preferido: Optional[int] = None
    atributos: Optional[Dict[str, Any]] = None
    unidad: Optional[Dict[str, Any]] = None
    tipo_recurso: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS DE ESTADÍSTICAS
# ============================================================================

class EstadisticasObra(BaseModel):
    total_partidas: int
    total_subpartidas: int
    total_planillas: int
    total_recursos: int
    costo_total_sin_incrementos: Decimal
    costo_total_con_incrementos: Decimal
    total_incrementos: Decimal
    duracion_total: Decimal
    partidas_con_subpartidas: int
    partidas_sin_subpartidas: int


class ResumenDetallado(BaseModel):
    obra: ObraRead
    estadisticas: EstadisticasObra
    partidas: List[PartidaRead]
    incrementos: List[IncrementoRead]
    costos_por_partida: Dict[int, Dict[str, Any]]
    recursos_por_planilla: Dict[int, List[RecursoRead]]


# ============================================================================
# SCHEMAS DE BÚSQUEDA Y FILTROS
# ============================================================================

class FiltroObras(BaseModel):
    id_cliente: Optional[int] = None
    estado: Optional[str] = None
    fecha_desde: Optional[date] = None
    fecha_hasta: Optional[date] = None
    moneda: Optional[str] = None


class BusquedaRecursos(BaseModel):
    id_tipo_recurso: Optional[int] = None
    descripcion: Optional[str] = None
    id_unidad: Optional[int] = None
    precio_minimo: Optional[Decimal] = None
    precio_maximo: Optional[Decimal] = None


# ============================================================================
# SCHEMAS DE RESPUESTAS PAGINADAS
# ============================================================================

class PaginacionParams(BaseModel):
    pagina: int = Field(default=1, ge=1)
    tamaño: int = Field(default=20, ge=1, le=100)


class RespuestaPaginada(BaseModel):
    datos: List[Any]
    total: int
    pagina: int
    tamaño: int
    paginas_totales: int


# ============================================================================
# SCHEMAS DE VALIDACIÓN
# ============================================================================

class ValidacionPartida(BaseModel):
    nombre_partida: bool = True
    duracion: bool = True
    tipo_tiempo: bool = True
    especialidad: bool = True


class ValidacionSubPartida(BaseModel):
    descripcion_tarea: bool = True
    duracion: bool = True
    tipo_tiempo: bool = True


class ValidacionCosto(BaseModel):
    cantidad: bool = True
    precio_unitario: bool = True
    porcentaje_de_uso: bool = True
    tiempo_de_uso: bool = True


# ============================================================================
# SCHEMAS DE EXPORTACIÓN
# ============================================================================

class ExportacionObra(BaseModel):
    formato: str = Field(..., regex="^(excel|pdf|csv)$")
    incluir_recursos: bool = True
    incluir_incrementos: bool = True
    incluir_detalles: bool = True


class ExportacionRecursos(BaseModel):
    formato: str = Field(..., regex="^(excel|csv)$")
    id_tipo_recurso: Optional[int] = None
    incluir_atributos: bool = True
    incluir_precios: bool = True
