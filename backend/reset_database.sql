-- Script para resetear la base de datos y crear la nueva estructura
-- ⚠️ ADVERTENCIA: Elimina TODOS los datos existentes

-- Eliminar todas las tablas
DROP TABLE IF EXISTS incrementos CASCADE;
DROP TABLE IF EXISTS subpartidas_costos CASCADE;
DROP TABLE IF EXISTS partidas_costos CASCADE;
DROP TABLE IF EXISTS subpartidas CASCADE;
DROP TABLE IF EXISTS partidas CASCADE;
DROP TABLE IF EXISTS obras CASCADE;
DROP TABLE IF EXISTS cotizaciones CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS recursos CASCADE;
DROP TABLE IF EXISTS tipos_recurso CASCADE;
DROP TABLE IF EXISTS especialidades CASCADE;
DROP TABLE IF EXISTS unidades CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;

-- Crear tablas base
CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    dni VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    id_rol INTEGER REFERENCES roles(id_rol),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    razon_social VARCHAR(250) NOT NULL,
    cuit VARCHAR(20) NOT NULL UNIQUE,
    direccion TEXT
);

CREATE TABLE especialidades (
    id_especialidad SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE unidades (
    id_unidad SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    simbolo VARCHAR(10),
    descripcion TEXT
);

CREATE TABLE tipos_recurso (
    id_tipo_recurso SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    icono VARCHAR(50)
);

CREATE TABLE recursos (
    id_recurso SERIAL PRIMARY KEY,
    id_tipo_recurso INTEGER REFERENCES tipos_recurso(id_tipo_recurso),
    descripcion TEXT NOT NULL,
    id_unidad INTEGER REFERENCES unidades(id_unidad),
    cantidad NUMERIC(18, 4) DEFAULT 0,
    costo_unitario_predeterminado NUMERIC(18, 4) DEFAULT 0,
    costo_total NUMERIC(18, 4) DEFAULT 0
);

-- Nueva estructura de obras
CREATE TABLE obras (
    id_obra SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES clientes(id_cliente),
    codigo_proyecto VARCHAR(50),
    nombre_proyecto VARCHAR(250) NOT NULL,
    descripcion_proyecto TEXT,
    fecha_creacion DATE NOT NULL,
    fecha_entrega DATE,
    fecha_recepcion DATE,
    moneda VARCHAR(10) DEFAULT 'USD',
    estado VARCHAR(50) DEFAULT 'borrador'
);

CREATE TABLE partidas (
    id_partida SERIAL PRIMARY KEY,
    id_obra INTEGER REFERENCES obras(id_obra),
    nombre_partida VARCHAR(250) NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(250),
    codigo VARCHAR(100),
    tiene_subpartidas BOOLEAN DEFAULT FALSE
);

CREATE TABLE subpartidas (
    id_subpartida SERIAL PRIMARY KEY,
    id_partida INTEGER REFERENCES partidas(id_partida),
    codigo VARCHAR(100),
    descripcion_tarea TEXT NOT NULL,
    id_especialidad INTEGER REFERENCES especialidades(id_especialidad),
    id_unidad INTEGER REFERENCES unidades(id_unidad),
    cantidad NUMERIC(18, 4) DEFAULT 0,
    precio_unitario NUMERIC(18, 4) DEFAULT 0
);

CREATE TABLE partidas_costos (
    id_costo SERIAL PRIMARY KEY,
    id_partida INTEGER REFERENCES partidas(id_partida),
    id_recurso INTEGER REFERENCES recursos(id_recurso),
    cantidad NUMERIC(18, 4) DEFAULT 0,
    precio_unitario_aplicado NUMERIC(18, 4) DEFAULT 0,
    total_linea NUMERIC(18, 4) DEFAULT 0
);

CREATE TABLE subpartidas_costos (
    id_costo SERIAL PRIMARY KEY,
    id_subpartida INTEGER REFERENCES subpartidas(id_subpartida),
    id_recurso INTEGER REFERENCES recursos(id_recurso),
    cantidad NUMERIC(18, 4) DEFAULT 0,
    precio_unitario_aplicado NUMERIC(18, 4) DEFAULT 0,
    total_linea NUMERIC(18, 4) DEFAULT 0
);

CREATE TABLE incrementos (
    id_incremento SERIAL PRIMARY KEY,
    id_partida INTEGER REFERENCES partidas(id_partida),
    id_subpartida INTEGER REFERENCES subpartidas(id_subpartida),
    concepto VARCHAR(250) NOT NULL,
    descripcion TEXT,
    tipo_incremento VARCHAR(50) DEFAULT 'porcentaje',
    valor NUMERIC(18, 4) DEFAULT 0,
    porcentaje NUMERIC(9, 4) DEFAULT 0,
    monto_calculado NUMERIC(18, 4) DEFAULT 0
);

-- Insertar datos básicos
INSERT INTO roles (nombre, descripcion) VALUES 
('Administrador', 'Acceso completo al sistema'),
('Cotizador', 'Puede crear y gestionar cotizaciones');

INSERT INTO usuarios (nombre, apellido, dni, email, password_hash, id_rol) VALUES 
('Admin', 'Sistema', '12345678', 'admin@sistema.com', '$2b$12$cEN8WtEUkIUz.p9jFP4iLu3dJpba55UcjqHaIoa7u0N0nGIkxqCwq', 1);

INSERT INTO clientes (razon_social, cuit, direccion) VALUES 
('Cliente Demo', '20-12345678-9', 'Dirección demo');

INSERT INTO especialidades (nombre, descripcion) VALUES 
('Electricidad', 'Instalaciones eléctricas'),
('Plomería', 'Sistemas de agua y gas'),
('Albañilería', 'Construcción en mampostería');

INSERT INTO unidades (nombre, simbolo, descripcion) VALUES 
('Metro', 'm', 'Unidad de longitud'),
('Metro cuadrado', 'm²', 'Unidad de superficie'),
('Hora', 'h', 'Unidad de tiempo');

INSERT INTO tipos_recurso (nombre, icono) VALUES 
('Mano de Obra', '👷'),
('Materiales', '🧱'),
('Equipos', '🚜');

INSERT INTO recursos (id_tipo_recurso, descripcion, id_unidad, cantidad, costo_unitario_predeterminado, costo_total) VALUES 
(1, 'Obrero general', 3, 1.0, 2500.00, 2500.00),
(1, 'Obrero especializado', 3, 1.0, 3500.00, 3500.00),
(2, 'Cemento Portland', 1, 1.0, 150.00, 150.00),
(2, 'Arena gruesa', 2, 1.0, 2500.00, 2500.00),
(3, 'Retroexcavadora', 3, 1.0, 15000.00, 15000.00);

-- Obra de ejemplo
INSERT INTO obras (id_cliente, codigo_proyecto, nombre_proyecto, descripcion_proyecto, fecha_creacion, moneda) VALUES 
(1, 'PROJ-001', 'Proyecto Demo', 'Proyecto de ejemplo para testing', '2024-01-01', 'USD');

INSERT INTO partidas (id_obra, nombre_partida, descripcion) VALUES 
(1, 'Excavación', 'Excavación para cimientos'),
(1, 'Estructura', 'Construcción de estructura principal');

INSERT INTO subpartidas (id_partida, descripcion_tarea, cantidad, precio_unitario) VALUES 
(1, 'Excavación manual', 10.0, 2500.00),
(1, 'Excavación mecánica', 5.0, 15000.00);

UPDATE partidas SET tiene_subpartidas = TRUE WHERE id_partida = 1;

-- Costos de ejemplo
INSERT INTO partidas_costos (id_partida, id_recurso, cantidad, precio_unitario_aplicado, total_linea) VALUES 
(2, 1, 20.0, 2500.00, 50000.00);

INSERT INTO subpartidas_costos (id_subpartida, id_recurso, cantidad, precio_unitario_aplicado, total_linea) VALUES 
(1, 1, 10.0, 2500.00, 25000.00),
(2, 3, 2.0, 15000.00, 30000.00);

-- Incrementos de ejemplo
INSERT INTO incrementos (id_partida, concepto, tipo_incremento, porcentaje) VALUES 
(1, 'Gastos Generales', 'porcentaje', 15.0),
(2, 'Utilidad', 'porcentaje', 20.0);

SELECT 'Base de datos creada exitosamente' as resultado;
