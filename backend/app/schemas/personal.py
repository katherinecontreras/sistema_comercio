from pydantic import BaseModel, Field
from typing import Optional


class PersonalBase(BaseModel):
    funcion: str = Field(..., min_length=1)
    sueldo_bruto: float
    descuentos: float
    porc_descuento: float
    sueldo_no_remunerado: float
    neto_bolsillo_mensual: float
    cargas_sociales: float
    porc_cargas_sociales_sobre_sueldo_bruto: float
    costo_total_mensual: float
    costo_mensual_sin_seguros: float
    seguros_art_mas_vo: float
    examen_medico: float
    indumentaria_y_epp: float
    pernoctes_y_viajes: float
    costo_total_mensual_apertura: float


class PersonalCreate(PersonalBase):
    pass


class PersonalUpdate(BaseModel):
    funcion: Optional[str] = None
    sueldo_bruto: Optional[float] = None
    descuentos: Optional[float] = None
    porc_descuento: Optional[float] = None
    sueldo_no_remunerado: Optional[float] = None
    neto_bolsillo_mensual: Optional[float] = None
    cargas_sociales: Optional[float] = None
    porc_cargas_sociales_sobre_sueldo_bruto: Optional[float] = None
    costo_total_mensual: Optional[float] = None
    costo_mensual_sin_seguros: Optional[float] = None
    seguros_art_mas_vo: Optional[float] = None
    examen_medico: Optional[float] = None
    indumentaria_y_epp: Optional[float] = None
    pernoctes_y_viajes: Optional[float] = None
    costo_total_mensual_apertura: Optional[float] = None


class PersonalRead(PersonalBase):
    id_personal: int

    class Config:
        from_attributes = True



