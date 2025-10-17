-- PostgreSQL schema for Sistema de Comercio - Cotizaciones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles y usuarios
CREATE TABLE IF NOT EXISTS roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    dni VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    id_rol INTEGER NOT NULL REFERENCES roles(id_rol),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuración global
CREATE TABLE IF NOT EXISTS configuracion (
    clave VARCHAR(150) PRIMARY KEY,
    valor VARCHAR(500) NOT NULL
);

-- Clientes y Proveedores
CREATE TABLE IF NOT EXISTS clientes (
    id_cliente SERIAL PRIMARY KEY,
    razon_social VARCHAR(250) NOT NULL,
    cuit VARCHAR(50) UNIQUE NOT NULL,
    direccion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    razon_social VARCHAR(250) NOT NULL,
    cuit VARCHAR(50) UNIQUE NOT NULL,
    contacto TEXT
);

-- Cotizaciones y estructura
CREATE TABLE IF NOT EXISTS cotizaciones (
    id_cotizacion SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL REFERENCES clientes(id_cliente),
    nombre_proyecto VARCHAR(250) NOT NULL,
    fecha_creacion DATE NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Borrador'
);

CREATE TABLE IF NOT EXISTS obras (
    id_obra SERIAL PRIMARY KEY,
    id_cotizacion INTEGER NOT NULL REFERENCES cotizaciones(id_cotizacion) ON DELETE CASCADE,
    nombre_obra VARCHAR(250) NOT NULL,
    descripcion TEXT
);

-- Tablas normalizadas para especialidades y unidades
CREATE TABLE IF NOT EXISTS especialidades (
    id_especialidad SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS unidades (
    id_unidad SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    simbolo VARCHAR(10),
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS items_obra (
    id_item_obra SERIAL PRIMARY KEY,
    id_obra INTEGER NOT NULL REFERENCES obras(id_obra) ON DELETE CASCADE,
    id_item_padre INTEGER REFERENCES items_obra(id_item_obra) ON DELETE CASCADE,
    codigo VARCHAR(100),
    descripcion_tarea TEXT NOT NULL,
    id_especialidad INTEGER REFERENCES especialidades(id_especialidad),
    id_unidad INTEGER REFERENCES unidades(id_unidad),
    cantidad NUMERIC(18,4) NOT NULL DEFAULT 0
);

-- Catálogo unificado
CREATE TABLE IF NOT EXISTS tipos_recurso (
    id_tipo_recurso SERIAL PRIMARY KEY,
    nombre VARCHAR(120) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS recursos (
    id_recurso SERIAL PRIMARY KEY,
    id_tipo_recurso INTEGER NOT NULL REFERENCES tipos_recurso(id_tipo_recurso),
    descripcion VARCHAR(300) NOT NULL,
    id_unidad INTEGER NOT NULL REFERENCES unidades(id_unidad),
    cantidad NUMERIC(18,4) NOT NULL DEFAULT 0,
    costo_unitario_predeterminado NUMERIC(18,4) NOT NULL DEFAULT 0,
    costo_total NUMERIC(18,4) NOT NULL DEFAULT 0,
    id_proveedor_preferido INTEGER REFERENCES proveedores(id_proveedor),
    atributos JSONB
);

-- Asignaciones de costo e incrementos
CREATE TABLE IF NOT EXISTS items_obra_costos (
    id_item_costo SERIAL PRIMARY KEY,
    id_item_obra INTEGER NOT NULL REFERENCES items_obra(id_item_obra) ON DELETE CASCADE,
    id_recurso INTEGER NOT NULL REFERENCES recursos(id_recurso),
    cantidad NUMERIC(18,4) NOT NULL DEFAULT 0,
    costo_total_item NUMERIC(18,4) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS incrementos (
    id_incremento SERIAL PRIMARY KEY,
    id_item_obra INTEGER NOT NULL REFERENCES items_obra(id_item_obra) ON DELETE CASCADE,
    descripcion VARCHAR(250) NOT NULL,
    porcentaje NUMERIC(9,4) NOT NULL
);

-- Índices y performance
CREATE INDEX IF NOT EXISTS idx_usuarios_dni ON usuarios(dni);
CREATE INDEX IF NOT EXISTS idx_clientes_cuit ON clientes(cuit);
CREATE INDEX IF NOT EXISTS idx_proveedores_cuit ON proveedores(cuit);
CREATE INDEX IF NOT EXISTS idx_items_obra_obra ON items_obra(id_obra);
CREATE INDEX IF NOT EXISTS idx_recursos_tipo ON recursos(id_tipo_recurso);
CREATE INDEX IF NOT EXISTS idx_costos_item ON items_obra_costos(id_item_obra);


INSERT INTO configuracion (clave, valor) VALUES
    ('IVA_PORCENTAJE', '21'),
    ('MARGEN_GANANCIA_GENERAL', '0')
ON CONFLICT DO NOTHING;

-- =================================================================
-- SCRIPT DE INSERCIÓN DE DATOS DE PRUEBA
-- Basado en la cotización "Satelites LAS - YPF"
-- =================================================================

-- Limpieza opcional (¡CUIDADO! Borra datos existentes)
/*
DELETE FROM incrementos;
DELETE FROM items_obra_costos;
DELETE FROM items_obra;
DELETE FROM obras;
DELETE FROM cotizaciones;
DELETE FROM recursos;
DELETE FROM tipos_recurso;
DELETE FROM proveedores;
DELETE FROM clientes;
DELETE FROM usuarios;
*/


-- 1. Roles (Ya existen en schema.sql, pero aseguramos que estén)
INSERT INTO roles (id_rol, nombre_rol, descripcion) VALUES
    (1, 'Administrador', 'Acceso completo al sistema'),
    (2, 'Cotizador', 'Crea cotizaciones y gestiona catálogos básicos')
ON CONFLICT (id_rol) DO NOTHING;


-- 2. Usuarios de Prueba
-- La contraseña para ambos es "admin123" y "cotizador123" respectivamente
INSERT INTO usuarios (nombre, dni, password_hash, id_rol, activo) VALUES
    ('Admin General', '11111111', '$2b$12$EixZaYVKm.up34J3h1K8meHj2yb7flqNe4Ccl3Fx7w5aM02Lz8P5i', 1, TRUE),
    ('Usuario Cotizador', '22222222', '$2b$12$a4c6nB6wL1vVch0L9I.gZuix2.BLM96gDfrq2dJ/f5P0gLp4oSFsS', 2, TRUE)
ON CONFLICT (dni) DO NOTHING;


-- 3. Clientes y Proveedores
INSERT INTO clientes (id_cliente, razon_social, cuit, direccion) VALUES
    (1, 'YPF S.A.', '30-54668997-9', 'Macacha Güemes 515, C1106BKK CABA, Argentina'),
    (2, 'Techint Ingeniería y Construcción', '30-54641347-9', 'Della Paolera 299, C1001ADA CABA, Argentina')
ON CONFLICT (id_cliente) DO NOTHING;

INSERT INTO proveedores (id_proveedor, razon_social, cuit, contacto) VALUES
    (1, 'ACINDAR S.A.', '30-50008949-7', 'Contacto de aceros'),
    (2, 'Distribuidora de Materiales Patagónicos S.R.L.', '30-71187654-3', 'Contacto de materiales varios'),
    (3, 'Servicios de Grúas del Sur', '30-68765432-1', 'Alquiler de equipos pesados')
ON CONFLICT (id_proveedor) DO NOTHING;


-- 4. Especialidades
INSERT INTO especialidades (id_especialidad, nombre, descripcion) VALUES
    (1, 'Civil', 'Especialidad en construcción civil'),
    (2, 'Mecánica', 'Especialidad en mecánica industrial'),
    (3, 'Eléctrica', 'Especialidad en instalaciones eléctricas'),
    (4, 'Instrumentación', 'Especialidad en instrumentación y control'),
    (5, 'Piping', 'Especialidad en tuberías y conexiones'),
    (6, 'Estructural', 'Especialidad en estructuras metálicas')
ON CONFLICT (id_especialidad) DO NOTHING;

-- 5. Unidades
INSERT INTO unidades (id_unidad, nombre, simbolo, descripcion) VALUES
    (1, 'Unidad', 'un', 'Unidad individual'),
    (2, 'Metro', 'm', 'Metro lineal'),
    (3, 'Metro Cuadrado', 'm²', 'Metro cuadrado'),
    (4, 'Metro Cúbico', 'm³', 'Metro cúbico'),
    (5, 'Hora', 'h', 'Hora de trabajo'),
    (6, 'Hora Hombre', 'HH', 'Hora hombre de trabajo'),
    (7, 'Kilogramo', 'kg', 'Kilogramo de peso'),
    (8, 'Tonelada', 'tn', 'Tonelada de peso'),
    (9, 'Pulgada', 'in', 'Pulgada de diámetro'),
    (10, 'Día', 'día', 'Día de trabajo')
ON CONFLICT (id_unidad) DO NOTHING;

-- 6. Tipos de Recurso (Planillas)
INSERT INTO tipos_recurso (id_tipo_recurso, nombre) VALUES
    (1, 'Personal'),
    (2, 'Movil y Equipos'),
    (3, 'Materiales Piping'),
    (4, 'Válvulas'),
    (5, 'Instrumentos'),
    (6, 'Ingeniería y Documentación')
ON CONFLICT (id_tipo_recurso) DO NOTHING;


-- 7. Recursos (Catálogo basado en los Excel)
-- Personal
INSERT INTO recursos (id_tipo_recurso, descripcion, id_unidad, cantidad, costo_unitario_predeterminado, costo_total) VALUES
    (1, 'SUPERVISOR', 6, 1, 21.50, 21.50),
    (1, 'OFICIAL ESPECIALIZADO', 6, 1, 15.80, 15.80),
    (1, 'OFICIAL', 6, 1, 13.50, 13.50),
    (1, 'MEDIO OFICIAL', 6, 1, 11.20, 11.20),
    (1, 'AYUDANTE', 6, 1, 9.80, 9.80);

-- Movil y Equipos
INSERT INTO recursos (id_tipo_recurso, descripcion, id_unidad, cantidad, costo_unitario_predeterminado, costo_total) VALUES
    (2, 'CAMION GRUA 12 TN', 5, 1, 85.00, 85.00),
    (2, 'CAMION HIDROGRUA', 5, 1, 70.00, 70.00),
    (2, 'CAMIONETA 4X4', 10, 1, 150.00, 150.00),
    (2, 'EQUIPO DE TERMOFUSION', 10, 1, 120.00, 120.00),
    (2, 'GRUPO ELECTROGENO', 10, 1, 90.00, 90.00);

-- Materiales Piping
INSERT INTO recursos (id_tipo_recurso, descripcion, id_unidad, cantidad, costo_unitario_predeterminado, costo_total) VALUES
    (3, 'CAÑO DE ACERO 4" SCH40', 2, 1, 75.30, 75.30),
    (3, 'BRIDA WN 4" 150#', 1, 1, 55.00, 55.00),
    (3, 'CODO 90° 4" SCH40', 1, 1, 30.20, 30.20),
    (3, 'VALVULA ESFERICA 4"', 1, 1, 450.00, 450.00);
-- ... y así sucesivamente para otros materiales


-- 6. Cotización Principal
INSERT INTO cotizaciones (id_cotizacion, id_cliente, nombre_proyecto, fecha_creacion, estado) VALUES
    (1, 1, 'Construcción Satélites LAS', '2025-05-22', 'Borrador')
ON CONFLICT (id_cotizacion) DO NOTHING;


-- 7. Obras dentro de la Cotización
INSERT INTO obras (id_obra, id_cotizacion, nombre_obra, descripcion) VALUES
    (1, 1, 'Obra Civil y Mecánica', 'Comprende todas las tareas de construcción civil y montaje mecánico para los satélites.')
ON CONFLICT (id_obra) DO NOTHING;


-- 8. Items de Obra (Estructura jerárquica)
-- Nivel 1

INSERT INTO items_obra (id_item_obra, id_obra, id_item_padre, codigo, descripcion_tarea, id_especialidad, id_unidad, cantidad) VALUES
    (1, 1, NULL, 'A', 'OBRAS CIVILES', 1, 1, 1),
    (2, 1, NULL, 'B', 'OBRAS MECANICAS', 2, 1, 1),
    (3, 1, NULL, 'C', 'OBRAS DE INSTRUMENTOS', 4, 1, 1);

-- Nivel 2 (Hijos de Obras Civiles)

INSERT INTO items_obra (id_item_obra, id_obra, id_item_padre, codigo, descripcion_tarea, id_especialidad, id_unidad, cantidad) VALUES
    (10, 1, 1, 'A.1', 'Movimiento de suelo y preparación de terreno', 1, 4, 1200),
    (11, 1, 1, 'A.2', 'Construcción de bases y fundaciones', 1, 4, 350);

-- Nivel 2 (Hijos de Obras Mecánicas)

INSERT INTO items_obra (id_item_obra, id_obra, id_item_padre, codigo, descripcion_tarea, id_especialidad, id_unidad, cantidad) VALUES
    (20, 1, 2, 'B.1', 'Prefabricado y montaje de piping', 2, 9, 5000),
    (21, 1, 2, 'B.2', 'Montaje de equipos y estructuras', 2, 8, 25);


-- 9. Asignación de Costos a Items (items_obra_costos)
-- Costos para "Prefabricado y montaje de piping" (Item ID 20)
-- Usaremos los IDs de los recursos insertados previamente
INSERT INTO items_obra_costos (id_item_obra, id_recurso, cantidad, costo_total_item) VALUES
    -- Personal (IDs 1-5)
    (20, 1, 480, 10320.00), -- Supervisor
    (20, 2, 1200, 18960.00), -- Oficial Esp.
    (20, 5, 2000, 19600.00), -- Ayudante
    -- Equipos (IDs 6-10)
    (20, 6, 150, 12750.00), -- Camion Grua
    (20, 8, 90, 13500.00), -- Camioneta
    -- Materiales (IDs 11-14)
    (20, 11, 800, 60240.00), -- Caño 4"
    (20, 12, 120, 6600.00); -- Brida 4"


-- 10. Incrementos sobre los Items
-- Aplicaremos los incrementos a los 3 items principales (IDs 1, 2, 3)
-- Incrementos para OBRAS CIVILES (ID 1)
INSERT INTO incrementos (id_item_obra, descripcion, porcentaje) VALUES
    (1, 'GASTOS GENERALES', 15.50),
    (1, 'UTILIDADES', 10.00),
    (1, 'IMPUESTOS', 3.50);

-- Incrementos para OBRAS MECANICAS (ID 2)
INSERT INTO incrementos (id_item_obra, descripcion, porcentaje) VALUES
    (2, 'GASTOS GENERALES', 15.50),
    (2, 'UTILIDADES', 10.00),
    (2, 'IMPUESTOS', 3.50);

-- Incrementos para OBRAS DE INSTRUMENTOS (ID 3)
INSERT INTO incrementos (id_item_obra, descripcion, porcentaje) VALUES
    (3, 'GASTOS GENERALES', 15.50),
    (3, 'UTILIDADES', 10.00),
    (3, 'IMPUESTOS', 3.50);


-- =================================================================
-- REINICIAR SECUENCIAS
-- Es importante para que los próximos INSERTs automáticos no fallen
-- =================================================================
SELECT pg_catalog.setval(pg_get_serial_sequence('roles', 'id_rol'), (SELECT MAX(id_rol) FROM roles)+1);
SELECT pg_catalog.setval(pg_get_serial_sequence('usuarios', 'id_usuario'), (SELECT MAX(id_usuario) FROM usuarios)+1);
SELECT pg_catalog.setval(pg_get_serial_sequence('clientes', 'id_cliente'), (SELECT MAX(id_cliente) FROM clientes)+1);
SELECT pg_catalog.setval(pg_get_serial_sequence('proveedores', 'id_proveedor'), (SELECT MAX(id_proveedor) FROM proveedores)+1);
SELECT pg_catalog.setval(pg_get_serial_sequence('especialidades', 'id_especialidad'), (SELECT MAX(id_especialidad) FROM especialidades)+1);
SELECT pg_catalog.setval(pg_get_serial_sequence('unidades', 'id_unidad'), (SELECT MAX(id_unidad) FROM unidades)+1);
SELECT pg_catalog.setval(pg_get_serial_sequence('tipos_recurso', 'id_tipo_recurso'), (SELECT MAX(id_tipo_recurso) FROM tipos_recurso)+1);
SELECT pg_catalog.setval(pg_get_serial_sequence('recursos', 'id_recurso'), (SELECT MAX(id_recurso) FROM recursos)+1);
SELECT pg_catalog.setval(pg_get_serial_sequence('cotizaciones', 'id_cotizacion'), (SELECT MAX(id_cotizacion) FROM cotizaciones)+1);
SELECT pg_catalog.setval(pg_get_serial_sequence('obras', 'id_obra'), (SELECT MAX(id_obra) FROM obras)+1);
SELECT pg_catalog.setval(pg_get_serial_sequence('items_obra', 'id_item_obra'), (SELECT MAX(id_item_obra) FROM items_obra)+1);
SELECT pg_catalog.setval(pg_get_serial_sequence('items_obra_costos', 'id_item_costo'), (SELECT MAX(id_item_costo) FROM items_obra_costos)+1);
SELECT pg_catalog.setval(pg_get_serial_sequence('incrementos', 'id_incremento'), (SELECT MAX(id_incremento) FROM incrementos)+1);