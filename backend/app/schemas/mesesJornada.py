from pydantic import BaseModel, Field
from typing import Optional

################################### MesResumen ########################################
class MesResumen(BaseModel):
    total_horas_normales: float
    total_horas_50porc: float
    total_horas_100porc: float
    total_horas_fisicas: float
    total_dias_trabajados: int
    horas_viaje: float


class MesResumenCreate(MesResumen):
    pass


class MesResumenUpdate(BaseModel):
    total_horas_normales: Optional[float] = None
    total_horas_50porc: Optional[float] = None
    total_horas_100porc: Optional[float] = None
    total_horas_fisicas: Optional[float] = None
    total_dias_trabajados: Optional[int] = None
    horas_viaje: Optional[float] = None


class MesResumenRead(MesResumen):
    id_mes: int

    class Config:
        from_attributes = True


################################### DiaMes ########################################

class DiaMes(BaseModel):
    dia: str = Field(..., min_length=1)
    hs_normales: float
    hs_50porc: float
    hs_100porc: float
    total_horas: float


class DiaMesCreate(DiaMes):
    pass


class DiaMesUpdate(BaseModel):
    dia: Optional[str] = None
    hs_normales: Optional[float] = None
    hs_50porc: Optional[float] = None
    hs_100porc: Optional[float] = None
    total_horas: Optional[float] = None



class DiaMesRead(DiaMes):
    id_dia: int

    class Config:
        from_attributes = True
