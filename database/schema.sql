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

CREATE TABLE IF NOT EXISTS items_obra (
    id_item_obra SERIAL PRIMARY KEY,
    id_obra INTEGER NOT NULL REFERENCES obras(id_obra) ON DELETE CASCADE,
    id_item_padre INTEGER REFERENCES items_obra(id_item_obra) ON DELETE CASCADE,
    codigo VARCHAR(100),
    descripcion_tarea TEXT NOT NULL,
    especialidad VARCHAR(100),
    unidad VARCHAR(50),
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
    unidad VARCHAR(50) NOT NULL,
    costo_unitario_predeterminado NUMERIC(18,4) NOT NULL DEFAULT 0,
    id_proveedor_preferido INTEGER REFERENCES proveedores(id_proveedor),
    atributos JSONB
);

-- Asignaciones de costo e incrementos
CREATE TABLE IF NOT EXISTS items_obra_costos (
    id_item_costo SERIAL PRIMARY KEY,
    id_item_obra INTEGER NOT NULL REFERENCES items_obra(id_item_obra) ON DELETE CASCADE,
    id_recurso INTEGER NOT NULL REFERENCES recursos(id_recurso),
    cantidad NUMERIC(18,4) NOT NULL DEFAULT 0,
    precio_unitario_aplicado NUMERIC(18,4) NOT NULL DEFAULT 0,
    total_linea NUMERIC(18,4) NOT NULL DEFAULT 0
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


-- 4. Tipos de Recurso (Planillas)
INSERT INTO tipos_recurso (id_tipo_recurso, nombre) VALUES
    (1, 'Personal'),
    (2, 'Movil y Equipos'),
    (3, 'Materiales Piping'),
    (4, 'Válvulas'),
    (5, 'Instrumentos'),
    (6, 'Ingeniería y Documentación')
ON CONFLICT (id_tipo_recurso) DO NOTHING;


-- 5. Recursos (Catálogo basado en los Excel)
-- Personal
INSERT INTO recursos (id_tipo_recurso, descripcion, unidad, costo_unitario_predeterminado) VALUES
    (1, 'SUPERVISOR', 'HH', 21.50),
    (1, 'OFICIAL ESPECIALIZADO', 'HH', 15.80),
    (1, 'OFICIAL', 'HH', 13.50),
    (1, 'MEDIO OFICIAL', 'HH', 11.20),
    (1, 'AYUDANTE', 'HH', 9.80);

-- Movil y Equipos
INSERT INTO recursos (id_tipo_recurso, descripcion, unidad, costo_unitario_predeterminado) VALUES
    (2, 'CAMION GRUA 12 TN', 'HS', 85.00),
    (2, 'CAMION HIDROGRUA', 'HS', 70.00),
    (2, 'CAMIONETA 4X4', 'DIA', 150.00),
    (2, 'EQUIPO DE TERMOFUSION', 'DIA', 120.00),
    (2, 'GRUPO ELECTROGENO', 'DIA', 90.00);

-- Materiales Piping
INSERT INTO recursos (id_tipo_recurso, descripcion, unidad, costo_unitario_predeterminado) VALUES
    (3, 'CAÑO DE ACERO 4" SCH40', 'ML', 75.30),
    (3, 'BRIDA WN 4" 150#', 'UN', 55.00),
    (3, 'CODO 90° 4" SCH40', 'UN', 30.20),
    (3, 'VALVULA ESFERICA 4"', 'UN', 450.00);
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
INSERT INTO items_obra (id_item_obra, id_obra, id_item_padre, codigo, descripcion_tarea, especialidad, unidad, cantidad) VALUES
    (1, 1, NULL, 'A', 'OBRAS CIVILES', 'Civil', 'GLB', 1),
    (2, 1, NULL, 'B', 'OBRAS MECANICAS', 'Mecánica', 'GLB', 1),
    (3, 1, NULL, 'C', 'OBRAS DE INSTRUMENTOS', 'Instrumentos', 'GLB', 1);

-- Nivel 2 (Hijos de Obras Civiles)
INSERT INTO items_obra (id_item_obra, id_obra, id_item_padre, codigo, descripcion_tarea, especialidad, unidad, cantidad) VALUES
    (10, 1, 1, 'A.1', 'Movimiento de suelo y preparación de terreno', 'Civil', 'M3', 1200),
    (11, 1, 1, 'A.2', 'Construcción de bases y fundaciones', 'Civil', 'M3', 350);

-- Nivel 2 (Hijos de Obras Mecánicas)
INSERT INTO items_obra (id_item_obra, id_obra, id_item_padre, codigo, descripcion_tarea, especialidad, unidad, cantidad) VALUES
    (20, 1, 2, 'B.1', 'Prefabricado y montaje de piping', 'Mecánica', 'PULG', 5000),
    (21, 1, 2, 'B.2', 'Montaje de equipos y estructuras', 'Mecánica', 'TN', 25);


-- 9. Asignación de Costos a Items (items_obra_costos)
-- Costos para "Prefabricado y montaje de piping" (Item ID 20)
-- Usaremos los IDs de los recursos insertados previamente
INSERT INTO items_obra_costos (id_item_obra, id_recurso, cantidad, precio_unitario_aplicado, total_linea) VALUES
    -- Personal (IDs 1-5)
    (20, 1, 480, 21.50, 10320.00), -- Supervisor
    (20, 2, 1200, 15.80, 18960.00), -- Oficial Esp.
    (20, 5, 2000, 9.80, 19600.00), -- Ayudante
    -- Equipos (IDs 6-10)
    (20, 6, 150, 85.00, 12750.00), -- Camion Grua
    (20, 8, 90, 150.00, 13500.00), -- Camioneta
    -- Materiales (IDs 11-14)
    (20, 11, 800, 75.30, 60240.00), -- Caño 4"
    (20, 12, 120, 55.00, 6600.00); -- Brida 4"


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
SELECT pg_catalog.setval(pg_get_serial_sequence('tipos_recurso', 'id_tipo_recurso'), (SELECT MAX(id_tipo_recurso) FROM tipos_recurso)+1);
SELECT pg_catalog.setval(pg_get_serial_sequence('recursos', 'id_recurso'), (SELECT MAX(id_recurso) FROM recursos)+1);
SELECT pg_catalog.setval(pg_get_serial_sequence('cotizaciones', 'id_cotizacion'), (SELECT MAX(id_cotizacion) FROM cotizaciones)+1);
SELECT pg_catalog.setval(pg_get_serial_sequence('obras', 'id_obra'), (SELECT MAX(id_obra) FROM obras)+1);
SELECT pg_catalog.setval(pg_get_serial_sequence('items_obra', 'id_item_obra'), (SELECT MAX(id_item_obra) FROM items_obra)+1);
SELECT pg_catalog.setval(pg_get_serial_sequence('items_obra_costos', 'id_item_costo'), (SELECT MAX(id_item_costo) FROM items_obra_costos)+1);
SELECT pg_catalog.setval(pg_get_serial_sequence('incrementos', 'id_incremento'), (SELECT MAX(id_incremento) FROM incrementos)+1);



