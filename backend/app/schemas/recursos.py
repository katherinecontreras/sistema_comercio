from pydantic import BaseModel

class TipoRecursoBase(BaseModel):
    descripcion: str


class TipoRecursoCreate(TipoRecursoBase):
    descripcion: str


class TipoRecursoUpdate(BaseModel):
    descripcion: str | None = None


class TipoRecursoRead(BaseModel):
    id_tipo_recurso: int
    descripcion: str

    class Config:
        from_attributes = True


class RecursoBase(BaseModel):
    descripcion: str
    unidad: str
    cantidad: float
    meses_operario: float


class RecursoCreate(RecursoBase):
    descripcion: str
    unidad: str
    cantidad: float
    meses_operario: float


class RecursoUpdate(BaseModel):
    descripcion: str | None = None
    unidad: str | None = None
    cantidad: float | None = None
    meses_operario: float | None = None


class RecursoRead(BaseModel):
    id_recurso: int
    id_tipo_recurso: int
    descripcion: str
    unidad: str
    cantidad: float
    meses_operario: float

    class Config:
        from_attributes = True


