-- Roles
CREATE TABLE roles (
  id_rol SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT
);

-- Usuarios
CREATE TABLE usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  dni VARCHAR(20) NOT NULL UNIQUE,
  id_rol INTEGER REFERENCES roles(id_rol),
  activo BOOLEAN DEFAULT TRUE,
  password_hash VARCHAR(255) NOT NULL
);

-- Clientes
CREATE TABLE clientes (
  id_cliente SERIAL PRIMARY KEY,
  razon_social VARCHAR(250) NOT NULL,
  cuit VARCHAR(20) NOT NULL UNIQUE,
  direccion TEXT
);

-- Obras
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

-- Personal (mano de obra)
CREATE TABLE personal (
  id_personal SERIAL PRIMARY KEY,
  funcion VARCHAR(250) NOT NULL UNIQUE,
  sueldo_bruto DOUBLE PRECISION NOT NULL,
  descuentos DOUBLE PRECISION NOT NULL,
  porc_descuento DOUBLE PRECISION NOT NULL,
  sueldo_no_remunerado DOUBLE PRECISION NOT NULL,
  neto_mensual_con_vianda_xdia DOUBLE PRECISION NOT NULL,
  cargas_sociales DOUBLE PRECISION NOT NULL,
  porc_cargas_sociales_sobre_sueldo_bruto DOUBLE PRECISION NOT NULL,
  costo_total_mensual DOUBLE PRECISION NOT NULL,
  costo_mensual_sin_seguros DOUBLE PRECISION NOT NULL,
  seguros_art_mas_vo DOUBLE PRECISION NOT NULL,
  examen_medico_y_capacitacion DOUBLE PRECISION NOT NULL,
  indumentaria_y_epp DOUBLE PRECISION NOT NULL,
  pernoctes_y_viajes DOUBLE PRECISION NOT NULL,
  costo_total_mensual_apertura DOUBLE PRECISION NOT NULL
);


-- Datos básicos
INSERT INTO roles (nombre_rol, descripcion) VALUES 
('Administrador', 'Acceso completo al sistema'),
('Cotizador', 'Puede crear y gestionar cotizaciones');

INSERT INTO usuarios (nombre, dni, id_rol, password_hash) VALUES 
('Admin Sistema', '12345678', 1, '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzK8K2');

INSERT INTO clientes (razon_social, cuit, direccion) VALUES 
('Constructora ABC S.A.', '20-12345678-9', 'Av. Principal 123, Buenos Aires');
