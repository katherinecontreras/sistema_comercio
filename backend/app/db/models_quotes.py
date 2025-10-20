from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Text, ForeignKey, Numeric, Date
from datetime import date

from app.db.models import Base


class Cotizacion(Base):
    __tablename__ = "cotizaciones"

    id_cotizacion: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_cliente: Mapped[int] = mapped_column(Integer, ForeignKey("clientes.id_cliente"))
    nombre_proyecto: Mapped[str] = mapped_column(String(250))
    descripcion_proyecto: Mapped[str | None] = mapped_column(Text)
    fecha_creacion: Mapped[date] = mapped_column(Date)
    fecha_inicio: Mapped[date | None] = mapped_column(Date)
    fecha_vencimiento: Mapped[date | None] = mapped_column(Date)
    moneda: Mapped[str] = mapped_column(String(10), default="USD")
    estado: Mapped[str] = mapped_column(String(50), default="borrador")

    obras = relationship("Obra", back_populates="cotizacion", cascade="all, delete-orphan")


class Obra(Base):
    __tablename__ = "obras"

    id_obra: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_cotizacion: Mapped[int] = mapped_column(Integer, ForeignKey("cotizaciones.id_cotizacion"))
    nombre_obra: Mapped[str] = mapped_column(String(250))
    descripcion: Mapped[str | None] = mapped_column(Text)
    ubicacion: Mapped[str | None] = mapped_column(String(250))

    cotizacion = relationship("Cotizacion", back_populates="obras")
    items = relationship("ItemObra", back_populates="obra", cascade="all, delete-orphan")


class ItemObra(Base):
    __tablename__ = "items_obra"

    id_item_obra: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_obra: Mapped[int] = mapped_column(Integer, ForeignKey("obras.id_obra"))
    id_item_padre: Mapped[int | None] = mapped_column(Integer, ForeignKey("items_obra.id_item_obra"))
    codigo: Mapped[str | None] = mapped_column(String(100))
    descripcion_tarea: Mapped[str] = mapped_column(Text)
    id_especialidad: Mapped[int | None] = mapped_column(Integer, ForeignKey("especialidades.id_especialidad"))
    id_unidad: Mapped[int | None] = mapped_column(Integer, ForeignKey("unidades.id_unidad"))
    cantidad: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    precio_unitario: Mapped[float] = mapped_column(Numeric(18, 4), default=0)

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
    concepto: Mapped[str] = mapped_column(String(250))
    descripcion: Mapped[str | None] = mapped_column(Text)
    tipo_incremento: Mapped[str] = mapped_column(String(50), default="porcentaje")
    valor: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    porcentaje: Mapped[float] = mapped_column(Numeric(9, 4), default=0)
    monto_calculado: Mapped[float] = mapped_column(Numeric(18, 4), default=0)

    item = relationship("ItemObra", back_populates="incrementos")




