-- =========================================
-- SCRIPT DE LIMPIEZA Y RECREACIÓN DE BASE DE DATOS
-- Sistema de Comercio - Cotizaciones
-- =========================================

-- PASO 1: ELIMINAR TODAS LAS TABLAS (en orden inverso por FK)
-- =========================================

DROP TABLE IF EXISTS incrementos CASCADE;
DROP TABLE IF EXISTS items_obra_costos CASCADE;
DROP TABLE IF EXISTS recursos CASCADE;
DROP TABLE IF EXISTS items_obra CASCADE;
DROP TABLE IF EXISTS obras CASCADE;
DROP TABLE IF EXISTS cotizaciones CASCADE;
DROP TABLE IF EXISTS tipos_recurso CASCADE;
DROP TABLE IF EXISTS especialidades CASCADE;
DROP TABLE IF EXISTS unidades CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- PASO 2: CREAR TABLAS EN ORDEN (respetando FK)
-- =========================================

-- Tabla: Roles
CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);

-- Tabla: Usuarios
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    dni VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    id_rol INTEGER NOT NULL REFERENCES roles(id_rol),
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla: Clientes
CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    razon_social VARCHAR(250) NOT NULL,
    cuit VARCHAR(50) NOT NULL,
    direccion TEXT
);

-- Tabla: Proveedores
CREATE TABLE proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    razon_social VARCHAR(250) NOT NULL,
    cuit VARCHAR(50) NOT NULL,
    contacto TEXT
);

-- Tabla: Unidades
CREATE TABLE unidades (
    id_unidad SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    simbolo VARCHAR(10),
    descripcion TEXT
);

-- Tabla: Especialidades
CREATE TABLE especialidades (
    id_especialidad SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

-- Tabla: Tipos de Recurso (Planillas)
CREATE TABLE tipos_recurso (
    id_tipo_recurso SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL
);

-- Tabla: Recursos
CREATE TABLE recursos (
    id_recurso SERIAL PRIMARY KEY,
    id_tipo_recurso INTEGER NOT NULL REFERENCES tipos_recurso(id_tipo_recurso) ON DELETE CASCADE,
    descripcion VARCHAR(300) NOT NULL,
    id_unidad INTEGER NOT NULL REFERENCES unidades(id_unidad),
    cantidad NUMERIC(18, 4) DEFAULT 0,
    costo_unitario_predeterminado NUMERIC(18, 4) DEFAULT 0,
    costo_total NUMERIC(18, 4) DEFAULT 0,
    id_proveedor_preferido INTEGER REFERENCES proveedores(id_proveedor),
    atributos JSONB
);

-- Tabla: Cotizaciones
CREATE TABLE cotizaciones (
    id_cotizacion SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL REFERENCES clientes(id_cliente),
    codigo_proyecto VARCHAR(50),
    nombre_proyecto VARCHAR(250) NOT NULL,
    descripcion_proyecto TEXT,
    fecha_creacion DATE NOT NULL,
    fecha_entrega DATE,
    fecha_recepcion DATE,
    moneda VARCHAR(10) DEFAULT 'USD',
    estado VARCHAR(50) DEFAULT 'borrador'
);

-- Tabla: Obras
CREATE TABLE obras (
    id_obra SERIAL PRIMARY KEY,
    id_cotizacion INTEGER NOT NULL REFERENCES cotizaciones(id_cotizacion) ON DELETE CASCADE,
    nombre_obra VARCHAR(250) NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(250)
);

-- Tabla: Items de Obra
CREATE TABLE items_obra (
    id_item_obra SERIAL PRIMARY KEY,
    id_obra INTEGER NOT NULL REFERENCES obras(id_obra) ON DELETE CASCADE,
    id_item_padre INTEGER REFERENCES items_obra(id_item_obra),
    codigo VARCHAR(100),
    descripcion_tarea TEXT NOT NULL,
    id_especialidad INTEGER REFERENCES especialidades(id_especialidad),
    id_unidad INTEGER REFERENCES unidades(id_unidad),
    cantidad NUMERIC(18, 4) DEFAULT 0,
    precio_unitario NUMERIC(18, 4) DEFAULT 0
);

-- Tabla: Costos de Items (Item-Recurso)
CREATE TABLE items_obra_costos (
    id_item_costo SERIAL PRIMARY KEY,
    id_item_obra INTEGER NOT NULL REFERENCES items_obra(id_item_obra) ON DELETE CASCADE,
    id_recurso INTEGER NOT NULL REFERENCES recursos(id_recurso),
    cantidad NUMERIC(18, 4) DEFAULT 0,
    precio_unitario_aplicado NUMERIC(18, 4) DEFAULT 0,
    total_linea NUMERIC(18, 4) DEFAULT 0
);

-- Tabla: Incrementos
CREATE TABLE incrementos (
    id_incremento SERIAL PRIMARY KEY,
    id_item_obra INTEGER NOT NULL REFERENCES items_obra(id_item_obra) ON DELETE CASCADE,
    concepto VARCHAR(250) NOT NULL,
    descripcion TEXT,
    tipo_incremento VARCHAR(50) DEFAULT 'porcentaje',
    valor NUMERIC(18, 4) DEFAULT 0,
    porcentaje NUMERIC(9, 4) DEFAULT 0,
    monto_calculado NUMERIC(18, 4) DEFAULT 0
);

-- PASO 3: INSERTAR DATOS INICIALES
-- =========================================

-- Roles
INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Acceso completo al sistema'),
('Cotizador', 'Puede crear y gestionar cotizaciones'),
('Visor', 'Solo puede ver cotizaciones');

-- Usuario de prueba (password: admin123)
INSERT INTO usuarios (dni, nombre, apellido, email, password_hash, id_rol, activo) VALUES
('12345678', 'Admin', 'Sistema', 'admin@sistema.com', '$2b$12$HeYCOnJYqXLPrDCkh/SU5OMquDCHQIYvASLiPRTPAB2mzInmXs9rS', 1, TRUE);

-- Clientes de prueba
INSERT INTO clientes (razon_social, cuit, direccion) VALUES
('Empresa Demo S.A.', '30-12345678-9', 'Av. Siempre Viva 123, CABA'),
('Constructora XYZ', '30-87654321-0', 'Calle Falsa 456, Buenos Aires');

-- Proveedores de prueba
INSERT INTO proveedores (razon_social, cuit, contacto) VALUES
('Proveedor Industrial S.R.L.', '30-11111111-1', 'contacto@proveedor.com'),
('Materiales del Sur', '30-22222222-2', 'ventas@materialesur.com');

-- Unidades básicas
INSERT INTO unidades (nombre, simbolo, descripcion) VALUES
('unidad', 'un', 'Unidad genérica'),
('Metro', 'm', 'Unidad de longitud'),
('Metro cuadrado', 'm²', 'Unidad de superficie'),
('Metro cúbico', 'm³', 'Unidad de volumen'),
('Kilogramo', 'kg', 'Unidad de masa'),
('Litro', 'l', 'Unidad de capacidad'),
('Hora', 'h', 'Unidad de tiempo'),
('Pieza', 'pz', 'Pieza individual'),
('Global', 'gl', 'Precio global');

-- Especialidades básicas
INSERT INTO especialidades (nombre, descripcion) VALUES
('Arquitectura', 'Trabajos de diseño arquitectónico'),
('Estructura', 'Trabajos estructurales'),
('Electricidad', 'Instalaciones eléctricas'),
('Plomería', 'Instalaciones sanitarias'),
('HVAC', 'Climatización y ventilación'),
('Obra Civil', 'Trabajos de obra civil general');

-- Tipos de Recurso (Planillas)
INSERT INTO tipos_recurso (nombre) VALUES
('Materiales'),
('Mano de Obra'),
('Equipos'),
('Herramientas'),
('Servicios');

-- Recursos de ejemplo para cada tipo

-- Recursos de Materiales (id_tipo_recurso = 1)
INSERT INTO recursos (id_tipo_recurso, descripcion, id_unidad, cantidad, costo_unitario_predeterminado, costo_total) VALUES
(1, 'Cemento Portland 50kg', 8, 1, 850.00, 850.00),
(1, 'Arena fina m³', 4, 1, 1200.00, 1200.00),
(1, 'Ladrillo común', 8, 1000, 12.50, 12500.00),
(1, 'Hierro 8mm barra 12m', 8, 1, 2100.00, 2100.00),
(1, 'Pintura látex interior 20l', 8, 1, 4500.00, 4500.00);

-- Recursos de Mano de Obra (id_tipo_recurso = 2)
INSERT INTO recursos (id_tipo_recurso, descripcion, id_unidad, cantidad, costo_unitario_predeterminado, costo_total) VALUES
(2, 'Oficial albañil', 7, 1, 3500.00, 3500.00),
(2, 'Ayudante de albañil', 7, 1, 2800.00, 2800.00),
(2, 'Electricista matriculado', 7, 1, 4000.00, 4000.00),
(2, 'Plomero matriculado', 7, 1, 3800.00, 3800.00),
(2, 'Pintor profesional', 7, 1, 3200.00, 3200.00);

-- Recursos de Equipos (id_tipo_recurso = 3)
INSERT INTO recursos (id_tipo_recurso, descripcion, id_unidad, cantidad, costo_unitario_predeterminado, costo_total) VALUES
(3, 'Retroexcavadora día', 7, 1, 15000.00, 15000.00),
(3, 'Hormigonera 150l', 7, 1, 800.00, 800.00),
(3, 'Andamio tubular m²', 2, 1, 450.00, 450.00),
(3, 'Compresor aire 10HP', 7, 1, 2500.00, 2500.00);

-- PASO 4: CREAR ÍNDICES PARA PERFORMANCE
-- =========================================

CREATE INDEX idx_cotizaciones_cliente ON cotizaciones(id_cliente);
CREATE INDEX idx_cotizaciones_estado ON cotizaciones(estado);
CREATE INDEX idx_cotizaciones_codigo ON cotizaciones(codigo_proyecto);
CREATE INDEX idx_obras_cotizacion ON obras(id_cotizacion);
CREATE INDEX idx_items_obra ON items_obra(id_obra);
CREATE INDEX idx_items_padre ON items_obra(id_item_padre);
CREATE INDEX idx_costos_item ON items_obra_costos(id_item_obra);
CREATE INDEX idx_costos_recurso ON items_obra_costos(id_recurso);
CREATE INDEX idx_incrementos_item ON incrementos(id_item_obra);
CREATE INDEX idx_recursos_tipo ON recursos(id_tipo_recurso);
CREATE INDEX idx_recursos_unidad ON recursos(id_unidad);

-- PASO 5: VERIFICACIÓN
-- =========================================

SELECT 'TABLAS CREADAS:' as mensaje;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

SELECT 'DATOS INSERTADOS:' as mensaje;
SELECT 'Roles', COUNT(*) FROM roles
UNION ALL SELECT 'Usuarios', COUNT(*) FROM usuarios
UNION ALL SELECT 'Clientes', COUNT(*) FROM clientes
UNION ALL SELECT 'Proveedores', COUNT(*) FROM proveedores
UNION ALL SELECT 'Unidades', COUNT(*) FROM unidades
UNION ALL SELECT 'Especialidades', COUNT(*) FROM especialidades
UNION ALL SELECT 'Tipos de Recurso', COUNT(*) FROM tipos_recurso
UNION ALL SELECT 'Recursos', COUNT(*) FROM recursos;

-- =========================================
-- FIN DEL SCRIPT
-- =========================================


