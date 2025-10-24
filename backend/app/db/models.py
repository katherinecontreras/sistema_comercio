from sqlalchemy.orm import DeclarativeBase, relationship, Mapped, mapped_column
from sqlalchemy import Integer, String, Boolean, ForeignKey, Text, Numeric, Date, JSON
from datetime import date


class Base(DeclarativeBase):
    pass


class Rol(Base):
    __tablename__ = "roles"

    id_rol: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)
    
    usuarios = relationship("Usuario", back_populates="rol")


class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    dni: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    id_rol: Mapped[int] = mapped_column(Integer, ForeignKey("roles.id_rol"), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    
    rol = relationship("Rol", back_populates="usuarios")


class Cliente(Base):
    __tablename__ = "clientes"

    id_cliente: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    razon_social: Mapped[str] = mapped_column(String(250), nullable=False)
    cuit: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    direccion: Mapped[str | None] = mapped_column(Text)
    
    obras = relationship("Obra", back_populates="cliente")


class Especialidad(Base):
    __tablename__ = "especialidades"

    id_especialidad: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)


class Unidad(Base):
    __tablename__ = "unidades"

    id_unidad: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    simbolo: Mapped[str | None] = mapped_column(String(10))
    descripcion: Mapped[str | None] = mapped_column(Text)


class TipoRecurso(Base):
    __tablename__ = "tipos_recurso"

    id_tipo_recurso: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    icono: Mapped[str | None] = mapped_column(String(50))
    
    recursos = relationship("Recurso", back_populates="tipo_recurso")


class TipoTiempo(Base):
    __tablename__ = "tipo_de_tiempo"

    id_tipo_tiempo: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    medida: Mapped[str] = mapped_column(String(10), nullable=False)


class Recurso(Base):
    __tablename__ = "recursos"

    id_recurso: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_tipo_recurso: Mapped[int] = mapped_column(Integer, ForeignKey("tipos_recurso.id_tipo_recurso"), nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    id_unidad: Mapped[int | None] = mapped_column(Integer, ForeignKey("unidades.id_unidad"))
    cantidad: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    costo_unitario_predeterminado: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    costo_total: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    id_proveedor_preferido: Mapped[int | None] = mapped_column(Integer, nullable=True)
    atributos: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    tipo_recurso = relationship("TipoRecurso", back_populates="recursos")
    unidad = relationship("Unidad")


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
    # Campos de resumen calculados
    total_partidas: Mapped[int] = mapped_column(Integer, default=0)
    total_subpartidas: Mapped[int] = mapped_column(Integer, default=0)
    total_costo_obra_sin_incremento: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    total_costo_obra_con_incrementos: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    total_duracion_obra: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    total_incrementos: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    costos_partidas: Mapped[dict | None] = mapped_column(JSON)
    
    cliente = relationship("Cliente", back_populates="obras")
    partidas = relationship("Partida", back_populates="obra", cascade="all, delete-orphan")


class Partida(Base):
    __tablename__ = "partidas"

    id_partida: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_obra: Mapped[int] = mapped_column(Integer, ForeignKey("obras.id_obra"), nullable=False)
    nombre_partida: Mapped[str] = mapped_column(String(250), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)
    codigo: Mapped[str | None] = mapped_column(String(100))
    tiene_subpartidas: Mapped[bool] = mapped_column(Boolean, default=False)
    # Nuevos campos
    duracion: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    id_tipo_tiempo: Mapped[int | None] = mapped_column(Integer, ForeignKey("tipo_de_tiempo.id_tipo_tiempo"))
    especialidad: Mapped[dict | None] = mapped_column(JSON)
    
    obra = relationship("Obra", back_populates="partidas")
    tipo_tiempo = relationship("TipoTiempo")
    subpartidas = relationship("SubPartida", back_populates="partida", cascade="all, delete-orphan")
    costos = relationship("PartidaCosto", back_populates="partida", cascade="all, delete-orphan")
    incrementos = relationship("Incremento", back_populates="partida", cascade="all, delete-orphan")


class SubPartida(Base):
    __tablename__ = "subpartidas"

    id_subpartida: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_partida: Mapped[int] = mapped_column(Integer, ForeignKey("partidas.id_partida"), nullable=False)
    codigo: Mapped[str | None] = mapped_column(String(100))
    descripcion_tarea: Mapped[str] = mapped_column(Text, nullable=False)
    id_especialidad: Mapped[int | None] = mapped_column(Integer, ForeignKey("especialidades.id_especialidad"))
    
    partida = relationship("Partida", back_populates="subpartidas")
    especialidad = relationship("Especialidad")
    costos = relationship("SubPartidaCosto", back_populates="subpartida", cascade="all, delete-orphan")
    incrementos = relationship("Incremento", back_populates="subpartida", cascade="all, delete-orphan")


class PartidaCosto(Base):
    __tablename__ = "partidas_costos"

    id_costo: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_partida: Mapped[int] = mapped_column(Integer, ForeignKey("partidas.id_partida"), nullable=False)
    id_recurso: Mapped[int] = mapped_column(Integer, ForeignKey("recursos.id_recurso"), nullable=False)
    cantidad: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    precio_unitario_aplicado: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    total_linea: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    # Nuevos campos
    porcentaje_de_uso: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    tiempo_de_uso: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    
    partida = relationship("Partida", back_populates="costos")


class SubPartidaCosto(Base):
    __tablename__ = "subpartidas_costos"

    id_costo: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_subpartida: Mapped[int] = mapped_column(Integer, ForeignKey("subpartidas.id_subpartida"), nullable=False)
    id_recurso: Mapped[int] = mapped_column(Integer, ForeignKey("recursos.id_recurso"), nullable=False)
    cantidad: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    precio_unitario_aplicado: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    total_linea: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    # Nuevos campos
    porcentaje_de_uso: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    tiempo_de_uso: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    
    subpartida = relationship("SubPartida", back_populates="costos")


class Incremento(Base):
    __tablename__ = "incrementos"

    id_incremento: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_partida: Mapped[int | None] = mapped_column(Integer, ForeignKey("partidas.id_partida"))
    id_subpartida: Mapped[int | None] = mapped_column(Integer, ForeignKey("subpartidas.id_subpartida"))
    concepto: Mapped[str] = mapped_column(String(250), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)
    tipo_incremento: Mapped[str] = mapped_column(String(50), default="porcentaje")
    valor: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    porcentaje: Mapped[float] = mapped_column(Numeric(9, 4), default=0)
    monto_calculado: Mapped[float] = mapped_column(Numeric(18, 4), default=0)
    
    partida = relationship("Partida", back_populates="incrementos")
    subpartida = relationship("SubPartida", back_populates="incrementos")