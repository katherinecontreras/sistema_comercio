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


class ProveedorBase(BaseModel):
    razon_social: str
    cuit: str
    contacto: str | None = None


class ProveedorCreate(ProveedorBase):
    pass


class ProveedorRead(ProveedorBase):
    id_proveedor: int

    class Config:
        from_attributes = True


class TipoRecursoBase(BaseModel):
    nombre: str


class TipoRecursoCreate(TipoRecursoBase):
    pass


class TipoRecursoRead(TipoRecursoBase):
    id_tipo_recurso: int

    class Config:
        from_attributes = True


class RecursoBase(BaseModel):
    id_tipo_recurso: int
    descripcion: str
    unidad: str
    costo_unitario_predeterminado: float
    id_proveedor_preferido: int | None = None


class RecursoCreate(RecursoBase):
    pass


class RecursoUpdate(BaseModel):
    id_tipo_recurso: int | None = None
    descripcion: str | None = None
    unidad: str | None = None
    costo_unitario_predeterminado: float | None = None
    id_proveedor_preferido: int | None = None


class RecursoRead(RecursoBase):
    id_recurso: int

    class Config:
        from_attributes = True


