from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Text, ForeignKey, Numeric

from app.db.models import Base


class Cliente(Base):
    __tablename__ = "clientes"

    id_cliente: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    razon_social: Mapped[str] = mapped_column(String(250))
    cuit: Mapped[str] = mapped_column(String(50))
    direccion: Mapped[str | None] = mapped_column(Text)


class Proveedor(Base):
    __tablename__ = "proveedores"

    id_proveedor: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    razon_social: Mapped[str] = mapped_column(String(250))
    cuit: Mapped[str] = mapped_column(String(50))
    contacto: Mapped[str | None] = mapped_column(Text)


class TipoRecurso(Base):
    __tablename__ = "tipos_recurso"

    id_tipo_recurso: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(120))


class Recurso(Base):
    __tablename__ = "recursos"

    id_recurso: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_tipo_recurso: Mapped[int] = mapped_column(Integer, ForeignKey("tipos_recurso.id_tipo_recurso"))
    descripcion: Mapped[str] = mapped_column(String(300))
    unidad: Mapped[str] = mapped_column(String(50))
    costo_unitario_predeterminado: Mapped[float] = mapped_column(Numeric(18, 4))
    id_proveedor_preferido: Mapped[int | None] = mapped_column(Integer, ForeignKey("proveedores.id_proveedor"))
    # atributos JSONB omitido en ORM por simplicidad en esta versión inicial


