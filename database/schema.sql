
-- PASO 1: Crear tablas base
CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    id_rol INTEGER REFERENCES roles(id_rol),
    activo BOOLEAN DEFAULT TRUE,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    razon_social VARCHAR(250) NOT NULL,
    cuit VARCHAR(20) NOT NULL UNIQUE,
    direccion TEXT
);

-- PASO 2: Crear tablas de catálogos
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

CREATE TABLE proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    nombre VARCHAR(250) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100)
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
    unidad VARCHAR(50),
    costo_unitario_predeterminado NUMERIC(18, 4) DEFAULT 0
);

-- PASO 3: Crear nueva estructura de obras
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

-- PASO 4: Insertar datos de ejemplo
-- Roles
INSERT INTO roles (nombre_rol, descripcion) VALUES 
('Administrador', 'Acceso completo al sistema'),
('Cotizador', 'Puede crear y gestionar cotizaciones');

-- Usuarios
INSERT INTO usuarios (nombre, dni, id_rol, password_hash) VALUES 
('Admin Sistema', '12345678', 1, '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzK8K2'),
('Juan Cotizador', '87654321', 2, '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzK8K2');

-- Clientes
INSERT INTO clientes (razon_social, cuit, direccion) VALUES 
('Constructora ABC S.A.', '20-12345678-9', 'Av. Principal 123, Buenos Aires'),
('Empresa XYZ S.R.L.', '30-87654321-0', 'Calle Secundaria 456, Córdoba'),
('Inversiones DEF S.A.', '27-11223344-5', 'Ruta Nacional 789, Rosario');

-- Especialidades
INSERT INTO especialidades (nombre, descripcion) VALUES 
('Electricidad', 'Instalaciones eléctricas y sistemas de iluminación'),
('Plomería', 'Sistemas de agua y gas'),
('Albañilería', 'Construcción en mampostería'),
('Pintura', 'Aplicación de pinturas y acabados'),
('Carpintería', 'Trabajos en madera');

-- Unidades
INSERT INTO unidades (nombre, simbolo, descripcion) VALUES 
('Metro', 'm', 'Unidad de longitud'),
('Metro cuadrado', 'm²', 'Unidad de superficie'),
('Metro cúbico', 'm³', 'Unidad de volumen'),
('Kilogramo', 'kg', 'Unidad de masa'),
('Hora', 'h', 'Unidad de tiempo'),
('Unidad', 'u', 'Unidad de conteo'),
('Hora hombre', 'HH', 'Unidad de trabajo');

-- Proveedores
INSERT INTO proveedores (nombre, contacto, telefono, email) VALUES 
('Materiales del Norte', 'Carlos López', '011-4567-8901', 'carlos@materialesnorte.com'),
('Ferretería Central', 'María González', '0341-234-5678', 'ventas@ferreteriacentral.com'),
('Distribuidora Sur', 'Roberto Silva', '0810-123-4567', 'info@distribuidorasur.com');

-- Tipos de Recursos (Planillas)
INSERT INTO tipos_recurso (nombre, icono) VALUES 
('Mano de Obra', '👷'),
('Materiales', '🧱'),
('Equipos', '🚜'),
('Herramientas', '🔧'),
('Servicios', '⚙️');

-- Recursos
INSERT INTO recursos (id_tipo_recurso, descripcion, unidad, costo_unitario_predeterminado) VALUES 
-- Mano de Obra
(1, 'Obrero general', 'HH', 2500.00),
(1, 'Obrero especializado', 'HH', 3500.00),
(1, 'Capataz', 'HH', 4500.00),
(1, 'Supervisor', 'HH', 6000.00),
(1, 'Ingeniero', 'HH', 8000.00),

-- Materiales
(2, 'Cemento Portland', 'kg', 150.00),
(2, 'Arena gruesa', 'm³', 2500.00),
(2, 'Piedra partida', 'm³', 3000.00),
(2, 'Ladrillos comunes', 'u', 25.00),
(2, 'Hierro del 8', 'kg', 180.00),
(2, 'Hierro del 12', 'kg', 200.00),

-- Equipos
(3, 'Retroexcavadora', 'h', 15000.00),
(3, 'Camión volcador', 'h', 8000.00),
(3, 'Hormigonera', 'h', 2000.00),
(3, 'Martillo neumático', 'h', 1500.00),

-- Herramientas
(4, 'Martillo', 'h', 500.00),
(4, 'Destornillador', 'h', 200.00),
(4, 'Nivel', 'h', 300.00),
(4, 'Cinta métrica', 'h', 100.00),

-- Servicios
(5, 'Alquiler de andamios', 'día', 5000.00),
(5, 'Servicio de limpieza', 'h', 2000.00),
(5, 'Seguridad', 'h', 3000.00);

-- Obras de ejemplo
INSERT INTO obras (id_cliente, codigo_proyecto, nombre_proyecto, descripcion_proyecto, fecha_creacion, fecha_entrega, moneda) VALUES 
(1, 'PROJ-001', 'Edificio Residencial', 'Construcción de edificio de 10 pisos con 40 departamentos', '2024-01-15', '2024-12-31', 'USD'),
(2, 'PROJ-002', 'Obra Industrial', 'Ampliación de planta industrial con nuevas instalaciones', '2024-02-01', '2024-10-15', 'USD'),
(3, 'PROJ-003', 'Centro Comercial', 'Construcción de centro comercial con locales y estacionamiento', '2024-03-01', '2025-06-30', 'USD');

-- Partidas de ejemplo
INSERT INTO partidas (id_obra, nombre_partida, descripcion, ubicacion, codigo) VALUES 
-- Obra 1
(1, 'Excavación y Movimiento de Suelos', 'Excavación para cimientos y sótanos', 'Planta baja', 'EXC-001'),
(1, 'Estructura de Hormigón', 'Construcción de estructura principal', 'Todos los pisos', 'EST-001'),
(1, 'Instalaciones', 'Instalaciones eléctricas, plomería y gas', 'Todo el edificio', 'INS-001'),

-- Obra 2
(2, 'Preparación del Terreno', 'Limpieza y nivelación del terreno', 'Área principal', 'PRE-001'),
(2, 'Construcción de Naves', 'Estructura metálica para naves industriales', 'Zona de producción', 'NAV-001'),

-- Obra 3
(3, 'Cimientos y Estructura', 'Fundaciones y estructura de hormigón', 'Planta baja', 'CIM-001'),
(3, 'Obra Seca', 'Mampostería, cielorrasos y divisiones', 'Todos los niveles', 'SEC-001');

-- Subpartidas de ejemplo
INSERT INTO subpartidas (id_partida, codigo, descripcion_tarea, id_especialidad, id_unidad, cantidad, precio_unitario) VALUES 
-- Partida 1 (Excavación)
(1, 'EXC-001-01', 'Excavación manual para cimientos', 3, 3, 50.0, 2500.00),
(1, 'EXC-001-02', 'Excavación mecánica para sótanos', 3, 3, 200.0, 15000.00),

-- Partida 2 (Estructura)
(2, 'EST-001-01', 'Hormigón armado para losas', 3, 3, 500.0, 25000.00),
(2, 'EST-001-02', 'Hormigón armado para columnas', 3, 3, 100.0, 30000.00),

-- Partida 3 (Instalaciones)
(3, 'INS-001-01', 'Instalación eléctrica general', 1, 1, 1000.0, 150.00),
(3, 'INS-001-02', 'Instalación de plomería', 2, 1, 500.0, 200.00);

-- Marcar partidas que tienen subpartidas
UPDATE partidas SET tiene_subpartidas = TRUE WHERE id_partida IN (1, 2, 3);

-- Costos de ejemplo para partidas sin subpartidas
INSERT INTO partidas_costos (id_partida, id_recurso, cantidad, precio_unitario_aplicado, total_linea) VALUES 
(4, 1, 40.0, 2500.00, 100000.00),  -- Obrero general para preparación
(4, 6, 10.0, 150.00, 1500.00),     -- Cemento
(5, 1, 80.0, 2500.00, 200000.00),  -- Obrero general para naves
(5, 6, 20.0, 150.00, 3000.00),     -- Cemento
(6, 1, 60.0, 2500.00, 150000.00),  -- Obrero general para cimientos
(6, 6, 15.0, 150.00, 2250.00),     -- Cemento
(7, 1, 100.0, 2500.00, 250000.00), -- Obrero general para obra seca
(7, 6, 25.0, 150.00, 3750.00);     -- Cemento

-- Costos de ejemplo para subpartidas
INSERT INTO subpartidas_costos (id_subpartida, id_recurso, cantidad, precio_unitario_aplicado, total_linea) VALUES 
(1, 1, 20.0, 2500.00, 50000.00),   -- Obrero general excavación manual
(1, 11, 8.0, 15000.00, 120000.00), -- Retroexcavadora
(2, 1, 30.0, 2500.00, 75000.00),   -- Obrero general excavación mecánica
(2, 11, 12.0, 15000.00, 180000.00), -- Retroexcavadora
(3, 1, 40.0, 2500.00, 100000.00),   -- Obrero general hormigón losas
(3, 6, 100.0, 150.00, 15000.00),   -- Cemento
(3, 7, 20.0, 3000.00, 60000.00),   -- Arena
(4, 1, 25.0, 2500.00, 62500.00),   -- Obrero general hormigón columnas
(4, 6, 50.0, 150.00, 7500.00),     -- Cemento
(4, 7, 10.0, 3000.00, 30000.00),   -- Arena
(5, 1, 50.0, 2500.00, 125000.00),   -- Obrero general instalación eléctrica
(5, 2, 10.0, 3500.00, 35000.00),   -- Obrero especializado
(6, 1, 30.0, 2500.00, 75000.00),   -- Obrero general instalación plomería
(6, 2, 5.0, 3500.00, 17500.00);     -- Obrero especializado

-- Incrementos de ejemplo
INSERT INTO incrementos (id_partida, concepto, descripcion, tipo_incremento, valor, porcentaje, monto_calculado) VALUES 
(1, 'Gastos Generales', 'Gastos administrativos y de dirección', 'porcentaje', 0, 15.0, 0),
(2, 'Utilidad', 'Margen de utilidad del proyecto', 'porcentaje', 0, 20.0, 0),
(3, 'Seguro de Obra', 'Póliza de seguro durante la construcción', 'monto_fijo', 50000.00, 0, 50000.00);

-- PASO 5: Crear índices para mejorar rendimiento
CREATE INDEX idx_obras_cliente ON obras(id_cliente);
CREATE INDEX idx_partidas_obra ON partidas(id_obra);
CREATE INDEX idx_subpartidas_partida ON subpartidas(id_partida);
CREATE INDEX idx_partidas_costos_partida ON partidas_costos(id_partida);
CREATE INDEX idx_subpartidas_costos_subpartida ON subpartidas_costos(id_subpartida);
CREATE INDEX idx_incrementos_partida ON incrementos(id_partida);
CREATE INDEX idx_incrementos_subpartida ON incrementos(id_subpartida);

-- PASO 6: Verificar datos insertados
SELECT 'Obras creadas:' as info, COUNT(*) as cantidad FROM obras
UNION ALL
SELECT 'Partidas creadas:', COUNT(*) FROM partidas
UNION ALL
SELECT 'Subpartidas creadas:', COUNT(*) FROM subpartidas
UNION ALL
SELECT 'Recursos creados:', COUNT(*) FROM recursos
UNION ALL
SELECT 'Tipos de recursos:', COUNT(*) FROM tipos_recurso;
