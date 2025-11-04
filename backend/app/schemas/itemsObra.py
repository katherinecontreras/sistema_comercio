from pydantic import BaseModel

class ItemObraBase(BaseModel):
    id_obra: int
    descripcion: str
    meses_operario: float
    capataz: float


class ItemObraCreate(ItemObraBase):
    id_obra: int
    descripcion: str
    meses_operario: float
    capataz: float


class ItemObraUpdate(BaseModel):
    id_obra: int | None = None
    descripcion: str | None = None
    meses_operario: float | None = None
    capataz: float | None = None


class ItemObraRead(BaseModel):
    id_item_Obra: int
    id_obra: int
    descripcion: str
    meses_operario: float
    capataz: float

    class Config:
        from_attributes = True



