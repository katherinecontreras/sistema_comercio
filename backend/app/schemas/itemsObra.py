from pydantic import BaseModel

class ItemObraBase(BaseModel):
    descripcion: str
    meses_operario: float
    capataz: float


class ItemObraCreate(ItemObraBase):
    descripcion: str
    meses_operario: float
    capataz: float


class ItemObraUpdate(BaseModel):
    descripcion: str | None = None
    meses_operario: float | None = None
    capataz: float | None = None


class ItemObraRead(BaseModel):
    id_item_Obra: int
    descripcion: str
    meses_operario: float
    capataz: float

    class Config:
        from_attributes = True



