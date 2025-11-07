from pydantic import BaseModel, Field
from typing import Optional

################################### MesResumen ########################################
class MesResumen(BaseModel):
    id_cliente: int
    total_horas_normales: int
    total_horas_50porc: int
    total_horas_100porc: int
    total_horas_fisicas: int
    total_dias_trabajados: int
    valor_mult_horas_viaje: float
    horas_viaje: int


class MesResumenCreate(BaseModel):
    id_cliente: int


class MesResumenUpdate(BaseModel):
    total_horas_normales: Optional[int] = None
    total_horas_50porc: Optional[int] = None
    total_horas_100porc: Optional[int] = None
    total_horas_fisicas: Optional[int] = None
    total_dias_trabajados: Optional[int] = None
    valor_mult_horas_viaje: Optional[float] = None
    horas_viaje: Optional[int] = None


class MesResumenRead(MesResumen):
    id_mes: int

    class Config:
        from_attributes = True


################################### DiaMes ########################################

class DiaMes(BaseModel):
    id_mes: int
    fecha: int = Field(..., ge=1, le=31)
    dia: str = Field(..., min_length=1, max_length=9)
    hs_normales: int
    hs_50porc: int
    hs_100porc: int
    total_horas: int


class DiaMesCreate(BaseModel):
    id_mes: int
    fecha: int = Field(..., ge=1, le=31)
    dia: str = Field(..., min_length=1, max_length=9)
    hs_normales: int = 0
    hs_50porc: int = 0
    hs_100porc: int = 0
    total_horas: int = 0


class DiaMesUpdate(BaseModel):
    dia: Optional[str] = Field(None, min_length=1, max_length=9)
    hs_normales: Optional[int] = None
    hs_50porc: Optional[int] = None
    hs_100porc: Optional[int] = None
    total_horas: Optional[int] = None



class DiaMesRead(DiaMes):
    id_dia: int

    class Config:
        from_attributes = True
