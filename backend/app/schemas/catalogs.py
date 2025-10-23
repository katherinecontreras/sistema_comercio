from pydantic import BaseModel


class ClienteBase(BaseModel):
    razon_social: str
    cuit: str
    direccion: str | None = None


class ClienteCreate(ClienteBase):
    pass


class ClienteRead(ClienteBase):
    id_cliente: int

    class Config:
        from_attributes = True


class TipoRecursoBase(BaseModel):
    nombre: str
    icono: str | None = None


class TipoRecursoCreate(TipoRecursoBase):
    pass


class TipoRecursoRead(TipoRecursoBase):
    id_tipo_recurso: int

    class Config:
        from_attributes = True


class RecursoBase(BaseModel):
    id_tipo_recurso: int
    descripcion: str
    id_unidad: int
    cantidad: float = 0
    costo_unitario_predeterminado: float = 0
    costo_total: float = 0
    id_proveedor_preferido: int | None = None
    atributos: dict | None = None


class RecursoCreate(RecursoBase):
    pass


class RecursoUpdate(BaseModel):
    id_tipo_recurso: int | None = None
    descripcion: str | None = None
    id_unidad: int | None = None
    cantidad: float | None = None
    costo_unitario_predeterminado: float | None = None
    costo_total: float | None = None
    id_proveedor_preferido: int | None = None
    atributos: dict | None = None


class RecursoRead(BaseModel):
    id_recurso: int
    id_tipo_recurso: int
    descripcion: str
    id_unidad: int
    cantidad: float
    costo_unitario_predeterminado: float
    costo_total: float
    id_proveedor_preferido: int | None = None
    atributos: dict | None = None
    # Campo calculado para compatibilidad (será llenado por la relación)
    unidad: str = ""

    class Config:
        from_attributes = True


class EspecialidadBase(BaseModel):
    nombre: str
    descripcion: str | None = None


class EspecialidadCreate(EspecialidadBase):
    pass


class EspecialidadRead(EspecialidadBase):
    id_especialidad: int

    class Config:
        from_attributes = True


class UnidadBase(BaseModel):
    nombre: str
    simbolo: str | None = None
    descripcion: str | None = None


class UnidadCreate(UnidadBase):
    pass


class UnidadRead(UnidadBase):
    id_unidad: int

    class Config:
        from_attributes = True


