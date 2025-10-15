from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Text, ForeignKey, Numeric, Date

from app.db.models import Base


class Cotizacion(Base):
    __tablename__ = "cotizaciones"

    id_cotizacion: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_cliente: Mapped[int] = mapped_column(Integer, ForeignKey("clientes.id_cliente"))
    nombre_proyecto: Mapped[str] = mapped_column(String(250))
    fecha_creacion: Mapped[str] = mapped_column(Date)
    estado: Mapped[str] = mapped_column(String(50), default="Borrador")

    obras = relationship("Obra", back_populates="cotizacion", cascade="all, delete-orphan")


class Obra(Base):
    __tablename__ = "obras"

    id_obra: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_cotizacion: Mapped[int] = mapped_column(Integer, ForeignKey("cotizaciones.id_cotizacion"))
    nombre_obra: Mapped[str] = mapped_column(String(250))
    descripcion: Mapped[str | None] = mapped_column(Text)

    cotizacion = relationship("Cotizacion", back_populates="obras")
    items = relationship("ItemObra", back_populates="obra", cascade="all, delete-orphan")


class ItemObra(Base):
    __tablename__ = "items_obra"

    id_item_obra: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_obra: Mapped[int] = mapped_column(Integer, ForeignKey("obras.id_obra"))
    id_item_padre: Mapped[int | None] = mapped_column(Integer, ForeignKey("items_obra.id_item_obra"))
    codigo: Mapped[str | None] = mapped_column(String(100))
    descripcion_tarea: Mapped[str] = mapped_column(Text)
    especialidad: Mapped[str | None] = mapped_column(String(100))
    unidad: Mapped[str | None] = mapped_column(String(50))
    cantidad: Mapped[float] = mapped_column(Numeric(18, 4), default=0)

    obra = relationship("Obra", back_populates="items")
    padre = relationship("ItemObra", remote_side=[id_item_obra])
    costos = relationship("ItemObraCosto", back_populates="item", cascade="all, delete-orphan")
    incrementos = relationship("Incremento", back_populates="item", cascade="all, delete-orphan")


class ItemObraCosto(Base):
    __tablename__ = "items_obra_costos"

    id_item_costo: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_item_obra: Mapped[int] = mapped_column(Integer, ForeignKey("items_obra.id_item_obra"))
    id_recurso: Mapped[int] = mapped_column(Integer, ForeignKey("recursos.id_recurso"))
    cantidad: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    precio_unitario_aplicado: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    total_linea: Mapped[float] = mapped_column(Numeric(18, 4), default=0)

    item = relationship("ItemObra", back_populates="costos")


class Incremento(Base):
    __tablename__ = "incrementos"

    id_incremento: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_item_obra: Mapped[int] = mapped_column(Integer, ForeignKey("items_obra.id_item_obra"))
    descripcion: Mapped[str] = mapped_column(String(250))
    porcentaje: Mapped[float] = mapped_column(Numeric(9, 4))

    item = relationship("ItemObra")


