from typing import List, Optional

from pydantic import BaseModel, Field


class CalculoOperacion(BaseModel):
    tipo: str = "multiplicacion"  # "multiplicacion" | "division"
    headers_base: Optional[List[int]] = None
    headers_atributes: Optional[List[int]] = None


class Calculo(BaseModel):
    activo: bool = False
    isMultiple: bool = False
    operaciones: List[CalculoOperacion] = Field(default_factory=list)


class HeaderBase(BaseModel):
    id_header_base: int
    titulo: str
    active: bool = True
    calculo: Calculo = Field(default_factory=Calculo)
    order: Optional[int] = None


class HeaderBaseUpdate(BaseModel):
    titulo: Optional[str] = None
    active: Optional[bool] = None
    calculo: Optional[Calculo] = None
    order: Optional[int] = None


class OrderHeaderEntry(BaseModel):
    id: int
    order: int
    type: Optional[str] = Field(default="base")


class HeaderAtributo(BaseModel):
    id_header_atribute: int
    titulo: str
    isCantidad: bool = False
    calculo: Calculo = Field(default_factory=Calculo)
    total_costo_header: float = 0.0
    order: Optional[int] = None


class HeaderAtributoCreate(BaseModel):
    id_header_atribute: Optional[int] = None
    titulo: str
    isCantidad: bool = False
    calculo: Optional[Calculo] = None
    order: Optional[int] = None


class HeaderAtributoUpdate(BaseModel):
    titulo: Optional[str] = None
    isCantidad: Optional[bool] = None
    calculo: Optional[Calculo] = None
    order: Optional[int] = None


class HeaderBaseCalc(BaseModel):
    id_header_base: int
    titulo: Optional[str] = None
    calculo: Optional[Calculo] = None


class TotalCantidadItem(BaseModel):
    typeOfHeader: str
    idHeader: int
    total: float = 0.0


class TotalCantidadAggregate(BaseModel):
    total_cantidades: float = 0.0
    cantidades: List[TotalCantidadItem] = Field(default_factory=list)


class TipoMaterialCreate(BaseModel):
    titulo: str
    headers_base_calculations: Optional[List[HeaderBaseCalc]] = None
    headers_base_active: Optional[List[int]] = None
    headers_atributes: Optional[List[HeaderAtributoCreate]] = None
    order_headers: Optional[List[OrderHeaderEntry]] = None
    valor_dolar: Optional[float] = None


class TipoMaterialUpdate(BaseModel):
    titulo: Optional[str] = None
    headers_base: Optional[List[HeaderBaseUpdate]] = None
    headers_atributes: Optional[List[HeaderAtributoUpdate]] = None
    order_headers: Optional[List[OrderHeaderEntry]] = None
    valor_dolar: Optional[float] = None


class TipoMaterialRead(BaseModel):
    id_tipo_material: int
    titulo: str
    total_costo_unitario: float
    total_costo_total: float
    total_USD: float
    valor_dolar: float
    total_cantidad: TotalCantidadAggregate
    headers_base: List[HeaderBase]
    headers_atributes: Optional[List[HeaderAtributo]] = None
    order_headers: List[OrderHeaderEntry]
    materiales_count: int = 0

    class Config:
        from_attributes = True


class MaterialAtributo(BaseModel):
    id_header_atribute: int
    value: str


class MaterialBase(BaseModel):
    id_tipo_material: int
    detalle: str
    unidad: Optional[str] = None
    cantidad: Optional[str] = None
    costo_unitario: float
    atributos: Optional[List[MaterialAtributo]] = None


class MaterialCreate(MaterialBase):
    pass


class MaterialUpdate(BaseModel):
    detalle: Optional[str] = None
    unidad: Optional[str] = None
    cantidad: Optional[str] = None
    costo_unitario: Optional[float] = None
    atributos: Optional[List[MaterialAtributo]] = None


class MaterialRead(MaterialBase):
    id_material: int
    costo_total: float

    class Config:
        from_attributes = True

