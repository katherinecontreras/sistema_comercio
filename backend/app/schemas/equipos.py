from pydantic import BaseModel, Field
from typing import Optional


class EquipoBase(BaseModel):
    detalle: str = Field(..., min_length=1)
    Amortizacion: float
    Seguro: float
    Patente: float
    Transporte: float
    Fee_alquiler: float
    Combustible: float
    Lubricantes: float
    Neumaticos: float
    Mantenim: float
    Operador: float
    Total_mes: float


class EquipoCreate(EquipoBase):
    pass


class EquipoUpdate(BaseModel):
    detalle: Optional[str] = None
    Amortizacion: Optional[float] = None
    Seguro: Optional[float] = None
    Patente: Optional[float] = None
    Transporte: Optional[float] = None
    Fee_alquiler: Optional[float] = None
    Combustible: Optional[float] = None
    Lubricantes: Optional[float] = None
    Neumaticos: Optional[float] = None
    Mantenim: Optional[float] = None
    Operador: Optional[float] = None
    Total_mes: Optional[float] = None


class EquipoRead(EquipoBase):
    id_equipo: int

    class Config:
        from_attributes = True



