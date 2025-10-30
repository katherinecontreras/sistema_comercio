from pydantic import BaseModel


class ClienteBase(BaseModel):
    razon_social: str
    cuit: str
    direccion: str | None = None


class ClienteCreate(ClienteBase):
    pass


class ClienteRead(ClienteBase):
    id_cliente: int
    razon_social: str
    cuit: str
    direccion: str | None = None

    class Config:
        from_attributes = True

