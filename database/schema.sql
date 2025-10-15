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

-- Datos iniciales mínimos
INSERT INTO roles (nombre_rol, descripcion) VALUES
    ('Administrador', 'Acceso completo al sistema'),
    ('Cotizador', 'Crea cotizaciones y gestiona catálogos básicos')
ON CONFLICT DO NOTHING;

INSERT INTO configuracion (clave, valor) VALUES
    ('IVA_PORCENTAJE', '21'),
    ('MARGEN_GANANCIA_GENERAL', '0')
ON CONFLICT DO NOTHING;




