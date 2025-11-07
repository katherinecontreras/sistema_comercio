from typing import List, Optional

from pydantic import BaseModel, Field


class TipoCostoItem(BaseModel):
    id: int
    tipo: Optional[str] = None
    desc: Optional[str] = None
    costo_total: float = 0.0


class TipoCostoBase(BaseModel):
    tipo: str = Field(..., max_length=10)
    costo_total: float = 0.0
    items: List[TipoCostoItem] = Field(default_factory=list)


class TipoCostoCreate(TipoCostoBase):
    pass


class TipoCostoUpdate(BaseModel):
    tipo: Optional[str] = Field(default=None, max_length=10)
    costo_total: Optional[float] = None
    items: Optional[List[TipoCostoItem]] = None


class TipoCostoRead(TipoCostoBase):
    id_tipo_costo: int

    class Config:
        from_attributes = True


class CostoValue(BaseModel):
    name: str
    value: float = 0.0


class CostoItemObra(BaseModel):
    idItem: int
    cantidad: float = 0.0
    total: float = 0.0
    porcentaje: float = 0.0


class CostoBase(BaseModel):
    id_tipo_costo: int
    detalle: str
    values: List[CostoValue] = Field(default_factory=list)
    afectacion: Optional[dict] = None
    unidad: str = "mes"
    costo_unitario: float = 0.0
    cantidad: float = 0.0
    costo_total: float = 0.0
    itemsObra: List[CostoItemObra] = Field(default_factory=list)


class CostoCreate(CostoBase):
    pass


class CostoUpdate(BaseModel):
    id_tipo_costo: Optional[int] = None
    detalle: Optional[str] = None
    values: Optional[List[CostoValue]] = None
    afectacion: Optional[dict] = None
    unidad: Optional[str] = None
    costo_unitario: Optional[float] = None
    cantidad: Optional[float] = None
    costo_total: Optional[float] = None
    itemsObra: Optional[List[CostoItemObra]] = None


class CostoRead(CostoBase):
    id_costo: int

    class Config:
        from_attributes = True

