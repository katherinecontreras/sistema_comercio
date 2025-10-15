from pydantic import BaseModel


class RolBase(BaseModel):
    nombre_rol: str
    descripcion: str | None = None


class RolCreate(RolBase):
    pass


class RolRead(RolBase):
    id_rol: int

    class Config:
        from_attributes = True


class UsuarioBase(BaseModel):
    nombre: str
    dni: str
    id_rol: int
    activo: bool = True


class UsuarioCreate(UsuarioBase):
    password: str


class UsuarioUpdate(BaseModel):
    nombre: str | None = None
    id_rol: int | None = None
    activo: bool | None = None
    password: str | None = None


class UsuarioRead(BaseModel):
    id_usuario: int
    nombre: str
    dni: str
    id_rol: int
    activo: bool

    class Config:
        from_attributes = True



