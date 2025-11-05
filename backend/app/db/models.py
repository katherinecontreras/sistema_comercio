from sqlalchemy.orm import DeclarativeBase, relationship, Mapped, mapped_column
from sqlalchemy import Integer, String, Boolean, ForeignKey, Text, Date, Float
from datetime import date


class Base(DeclarativeBase):
    pass


class Rol(Base):
    __tablename__ = "roles"

    id_rol: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)
    
    usuarios = relationship("Usuario", back_populates="rol")


class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    dni: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    id_rol: Mapped[int] = mapped_column(Integer, ForeignKey("roles.id_rol"), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    
    rol = relationship("Rol", back_populates="usuarios")


class Cliente(Base):
    __tablename__ = "clientes"

    id_cliente: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    razon_social: Mapped[str] = mapped_column(String(250), unique=True, nullable=False)
    cuit: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    actividad: Mapped[str | None] = mapped_column(Text)
    
    obras = relationship("Obra", back_populates="cliente")

class Obra(Base):
    __tablename__ = "obras"

    id_obra: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_cliente: Mapped[int] = mapped_column(Integer, ForeignKey("clientes.id_cliente"), nullable=False)
    codigo_proyecto: Mapped[str | None] = mapped_column(String(50))
    nombre_proyecto: Mapped[str] = mapped_column(String(250), nullable=False)
    descripcion_proyecto: Mapped[str | None] = mapped_column(Text)
    fecha_creacion: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_entrega: Mapped[date | None] = mapped_column(Date)
    fecha_recepcion: Mapped[date | None] = mapped_column(Date)
    moneda: Mapped[str] = mapped_column(String(10), default="USD")
    estado: Mapped[str] = mapped_column(String(50), default="borrador")
   
    cliente = relationship("Cliente", back_populates="obras")
    # Relación 1:N con ItemObra (no agrega columnas en la DB)
    itemsObra = relationship("ItemObra", back_populates="obra", cascade="all, delete-orphan")

class ItemObra(Base):
    __tablename__ = "itemsObra"

    id_item_Obra: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_obra: Mapped[int] = mapped_column(Integer, ForeignKey("obras.id_obra"), nullable=False)
    descripcion: Mapped[str] = mapped_column(String(250), nullable=False)
    meses_operario: Mapped[float] = mapped_column(Float, nullable=False)
    capataz: Mapped[float] = mapped_column(Float, nullable=False)

    obra = relationship("Obra", back_populates="itemsObra")

class Tipo_recurso(Base):
    __tablename__ = "tiposRecurso"

    id_tipo_recurso: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    descripcion: Mapped[str] = mapped_column(String(250), nullable=False)
    # Relación 1:N con Recurso (no agrega columnas en la DB)
    recursos = relationship("Recurso", back_populates="tipo_recurso")

class Recurso(Base):
    __tablename__ = "recursos"

    id_recurso: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    descripcion: Mapped[str] = mapped_column(String(250), nullable=False)
    id_tipo_recurso: Mapped[int] = mapped_column(Integer, ForeignKey("tiposRecurso.id_tipo_recurso"), nullable=False)
    unidad: Mapped[str] = mapped_column(String(20), nullable=False)
    cantidad: Mapped[float] = mapped_column(Float, nullable=False)
    meses_operario: Mapped[float] = mapped_column(Float, nullable=False)

    tipo_recurso = relationship("Tipo_recurso", back_populates="recursos")

class Personal(Base):
    __tablename__ = "personal"

    id_personal: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    funcion: Mapped[str] = mapped_column(String(250), nullable=False)
    sueldo_bruto: Mapped[float] = mapped_column(Float, nullable=False)
    descuentos: Mapped[float] = mapped_column(Float, nullable=False)
    porc_descuento: Mapped[float] = mapped_column(Float, nullable=False)
    sueldo_no_remunerado: Mapped[float] = mapped_column(Float, nullable=False)
    neto_bolsillo_mensual: Mapped[float] = mapped_column(Float, nullable=False)
    cargas_sociales: Mapped[float] = mapped_column(Float, nullable=False)
    porc_cargas_sociales_sobre_sueldo_bruto: Mapped[float] = mapped_column(Float, nullable=False)
    costo_total_mensual: Mapped[float] = mapped_column(Float, nullable=False)
    costo_mensual_sin_seguros: Mapped[float] = mapped_column(Float, nullable=False)
    seguros_art_mas_vo: Mapped[float] = mapped_column(Float, nullable=False)
    examen_medico: Mapped[float] = mapped_column(Float, nullable=False)
    indumentaria_y_epp: Mapped[float] = mapped_column(Float, nullable=False)
    pernoctes_y_viajes: Mapped[float] = mapped_column(Float, nullable=False)
    costo_total_mensual_apertura: Mapped[float] = mapped_column(Float, nullable=False)

class Equipo(Base):
    __tablename__ = "equipos"

    id_equipo: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    detalle: Mapped[str] = mapped_column(String(250), nullable=False)
    Amortizacion: Mapped[float] = mapped_column("amortizacion", Float, nullable=False)
    Seguro: Mapped[float] = mapped_column("seguro", Float, nullable=False)
    Patente: Mapped[float] = mapped_column("patente", Float, nullable=False)
    Transporte: Mapped[float] = mapped_column("transporte", Float, nullable=False)
    Fee_alquiler: Mapped[float] = mapped_column("fee_alquiler", Float, nullable=False)
    Combustible: Mapped[float] = mapped_column("combustible", Float, nullable=False)
    Lubricantes: Mapped[float] = mapped_column("lubricantes", Float, nullable=False)
    Neumaticos: Mapped[float] = mapped_column("neumaticos", Float, nullable=False)
    Mantenim: Mapped[float] = mapped_column("mantenim", Float, nullable=False)
    Operador: Mapped[float] = mapped_column("operador", Float, nullable=False)
    Total_mes: Mapped[float] = mapped_column("total_mes", Float, nullable=False)

class MesResumen(Base):
    __tablename__ = "mesesResumen"

    id_mes: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    total_horas_normales: Mapped[float] = mapped_column(Float, nullable=False)
    total_horas_50porc: Mapped[float] = mapped_column(Float, nullable=False)
    total_horas_100porc: Mapped[float] = mapped_column(Float, nullable=False)
    total_horas_fisicas: Mapped[float] = mapped_column(Float, nullable=False)
    total_dias_trabajados: Mapped[int] = mapped_column(Float, nullable=False)
    horas_viaje: Mapped[float] = mapped_column(Float, nullable=False)

class DiaMes(Base):
    __tablename__ = "diasMes"

    id_dia: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    dia: Mapped[str] = mapped_column(String(8), nullable=False)
    hs_normales: Mapped[float] = mapped_column(Float, nullable=False)
    hs_50porc: Mapped[float] = mapped_column(Float, nullable=False)
    hs_100porc: Mapped[float] = mapped_column(Float, nullable=False)
    total_horas: Mapped[float] = mapped_column(Float, nullable=False)
