from pydantic import BaseModel


class RolBase(BaseModel):
    nombre: str
    descripcion: str | None = None


class RolCreate(RolBase):
    pass


class RolRead(RolBase):
    id_rol: int
    nombre: str
    descripcion: str | None = None

    class Config:
        from_attributes = True


class UsuarioBase(BaseModel):
    nombre: str
    dni: str
    id_rol: int
    activo: bool = True
    password_hash: str


class UsuarioCreate(UsuarioBase):
    password_hash: str


class UsuarioUpdate(BaseModel):
    nombre: str | None = None
    dni: str | None = None
    id_rol: int | None = None
    activo: bool | None = None
    password_hash: str | None = None


class UsuarioRead(BaseModel):
    id_usuario: int
    nombre: str
    dni: str
    id_rol: int
    activo: bool
    password_hash: str

    class Config:
        from_attributes = True



