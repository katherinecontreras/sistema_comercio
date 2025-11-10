DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;


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
  actividad TEXT
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
  neto_bolsillo_mensual DOUBLE PRECISION NOT NULL,
  cargas_sociales DOUBLE PRECISION NOT NULL,
  porc_cargas_sociales_sobre_sueldo_bruto DOUBLE PRECISION NOT NULL,
  costo_total_mensual DOUBLE PRECISION NOT NULL,
  costo_mensual_sin_seguros DOUBLE PRECISION NOT NULL,
  seguros_art_mas_vo DOUBLE PRECISION NOT NULL,
  examen_medico DOUBLE PRECISION NOT NULL,
  indumentaria_y_epp DOUBLE PRECISION NOT NULL,
  pernoctes_y_viajes DOUBLE PRECISION NOT NULL,
  costo_total_mensual_apertura DOUBLE PRECISION NOT NULL
);

--Meses_resumen
CREATE TABLE mesesResumen (
  id_mes SERIAL PRIMARY KEY,
  total_horas_normales DOUBLE PRECISION NOT NULL,
  total_horas_50porc DOUBLE PRECISION NOT NULL,
  total_horas_100porc DOUBLE PRECISION NOT NULL,
  total_horas_fisicas DOUBLE PRECISION NOT NULL,
  total_dias_trabajados DOUBLE PRECISION NOT NULL,
  horas_viaje DOUBLE PRECISION NOT NULL
);
--Dias_mes
CREATE TABLE diasMes (
  id_dia SERIAL PRIMARY KEY,
  dia VARCHAR(8) NOT NULL UNIQUE,
  hs_normales DOUBLE PRECISION NOT NULL,
  hs_50porc DOUBLE PRECISION NOT NULL,
  hs_100porc DOUBLE PRECISION NOT NULL,
  total_horas DOUBLE PRECISION NOT NULL
);

-- Equipos
CREATE TABLE equipos (
    id_equipo SERIAL PRIMARY KEY, 
    detalle VARCHAR(250) NOT NULL,
    Amortizacion DOUBLE PRECISION NOT NULL,
    Seguro DOUBLE PRECISION NOT NULL,
    Patente DOUBLE PRECISION NOT NULL,
    Transporte DOUBLE PRECISION NOT NULL,
    Fee_alquiler DOUBLE PRECISION NOT NULL,
    Combustible DOUBLE PRECISION NOT NULL,
    Lubricantes DOUBLE PRECISION NOT NULL,
    Neumaticos DOUBLE PRECISION NOT NULL,
    Mantenim DOUBLE PRECISION NOT NULL,
    Operador DOUBLE PRECISION NOT NULL,
    Total_mes DOUBLE PRECISION NOT NULL
);

CREATE TABLE "tiposCosto" (
  id_tipo_costo SERIAL PRIMARY KEY,
  tipo VARCHAR(10) NOT NULL,
  descripcion VARCHAR(255),
  costo_total DOUBLE PRECISION NOT NULL DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE costos (
  id_costo SERIAL PRIMARY KEY,
  id_tipo_costo INTEGER NOT NULL REFERENCES "tiposCosto"(id_tipo_costo) ON DELETE CASCADE,
  detalle VARCHAR(255) NOT NULL,
  "values" JSONB NOT NULL DEFAULT '[]'::jsonb,
  unidad VARCHAR(20) NOT NULL DEFAULT 'mes',
  costo_unitario DOUBLE PRECISION NOT NULL DEFAULT 0,
  cantidad DOUBLE PRECISION NOT NULL DEFAULT 0,
  costo_total DOUBLE PRECISION NOT NULL DEFAULT 0,
  "itemsObra" JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE itemsObra (
  id_item_Obra SERIAL PRIMARY KEY,
  id_obra INTEGER REFERENCES obras(id_obra) ON DELETE RESTRICT,
  descripcion VARCHAR(250) NOT NULL,
  meses_operario DOUBLE PRECISION NOT NULL DEFAULT 0,
  capataz DOUBLE PRECISION NOT NULL DEFAULT 0
);

-- Tipos de recurso
CREATE TABLE "tiposRecurso" (
  id_tipo_recurso SERIAL PRIMARY KEY,
  descripcion VARCHAR(250) NOT NULL UNIQUE
);

-- Recursos
CREATE TABLE recursos (
  id_recurso SERIAL PRIMARY KEY,
  descripcion VARCHAR(250) NOT NULL,
  id_tipo_recurso INTEGER NOT NULL REFERENCES "tiposRecurso"(id_tipo_recurso) ON DELETE RESTRICT,
  unidad VARCHAR(20) NOT NULL,
  cantidad DOUBLE PRECISION NOT NULL DEFAULT 0,
  meses_operario DOUBLE PRECISION NOT NULL DEFAULT 0
);


-- Datos básicos
--el insert de equipos y personal se hacer a traves de la carga de excel

INSERT INTO roles (nombre, descripcion) VALUES 
('Administrador', 'Acceso completo al sistema'),
('Cotizador', 'Puede crear y gestionar cotizaciones');

INSERT INTO usuarios (nombre, dni, id_rol, password_hash) VALUES 
('Admin Sistema', '12345678', 1, '$2b$10$7pU5GqLkWhUseWJp5aDkYOdaLJPsaI6yAARwppcD5v6h3WJ6S8aJS');

INSERT INTO clientes (razon_social, cuit, actividad) VALUES
('YPF SA', '30-54668997-9', 'OPERADORA GAS Y PETROLEO'),
('TRANSPORTADORA DE GAS DEL SUR SA', '30-65786206-8', 'OPERADORA DE DUCTOS'),
('TECPETROL SA', '30-59266547-2', 'OPERADORA GAS Y PETROLEO'),
('YAC LINDERO ATRAVESADO', '30-63679858-0', 'OPERADORA GAS Y PETROLEO'),
('PAMPA ENERGIA SA CHIUIDOS', '30-63714786-9', 'OPERADORA GAS Y PETROLEO'),
('UTE LOS TOLDOS (TECPETROL)', '30-71217040-5', 'OPERADORA GAS Y PETROLEO');

-- Carga inicial de tipos de recurso
INSERT INTO "tiposRecurso" (descripcion) VALUES
('Replanteos ,estudios e ingenieria de detalle'),
('Gestion de compras y abastecimiento de materiales'),
('Movilizacion y demovilizacion de  personal , obrador y equipos , y cursos'),
('Movimientos de suelos y obra civil'),
('Construccion de caminos de acceso'),
('Construccion de locacion'),
('Construcciones de HºAº  H.30 premoldeadas  en  base'),
('Fabricacion y montaje de estructuras metalicas  y  equipos'),
('Fabricaciones en taller de estructuras metalicas'),
('Montaje de estructuras  metalicas y equipos en planta'),
('Fabricacion y montaje del piping'),
('Fabricaciones en taller spooles del piping  y otros'),
('Montaje del piping en planta  y otros'),
('Obra de electricidad'),
('Obra de instrumentos'),
('Precomisionado ,comisionado ,asistencia de PEM y Seguimiento'),
('Documentacion final ,data book ,carteleria');

-- Insertar recursos para cada tipo de recurso
-- Nota: unidad es VARCHAR(20), cantidad y meses_operario son float con default 0

-- Tipo 1: Replanteos ,estudios e ingenieria de detalle
INSERT INTO recursos (descripcion, id_tipo_recurso, unidad, cantidad, meses_operario) VALUES
('Relevamientos y replanteos', 1, 'Docs', 0, 0),
('Verificacion y analisis de consistencias', 1, 'Docs', 0, 0),
('Verificacion y revision del Hazop', 1, 'Docs', 0, 0),
('General', 1, 'Docs', 0, 0),
('Procesos', 1, 'Docs', 0, 0),
('Movimiento de suelos', 1, 'Docs', 0, 0),
('Obra civil', 1, 'Docs', 0, 0),
('Obra mecanica', 1, 'Docs', 0, 0),
('Obra  de piping', 1, 'Docs', 0, 0),
('Obra de electricidad', 1, 'Docs', 0, 0),
('Obra de instrumentos  y control', 1, 'Docs', 0, 0),
('Confeccion de procedimientos e instructivos de trabajo en gral y por especialidad', 1, 'Docs', 0, 0),
('Confeccion de plan de inspeccion y ensayos', 1, 'Docs', 0, 0),
('Estudio de suelos', 1, 'Docs', 0, 0),
('Gestiones de soldaduras', 1, 'Jornada', 0, 0),
('Pasaje de georadar ,deteccion e informes', 1, 'Docs', 0, 0),
('Gestiones iniciales Seguridad e Higiene', 1, 'Docs', 0, 0);

-- Tipo 2: Gestion de compras y abastecimiento de materiales
INSERT INTO recursos (descripcion, id_tipo_recurso, unidad, cantidad, meses_operario) VALUES
('Gestion de  compras y abastecimiento de materiales multiespecialidad', 2, 'Gl', 0, 0);

-- Tipo 3: Movilizacion y demovilizacion de  personal , obrador y equipos , y cursos
INSERT INTO recursos (descripcion, id_tipo_recurso, unidad, cantidad, meses_operario) VALUES
('Movilizacion y desmovilizacion de obrador , personal y equipos', 3, 'Gl', 0, 0),
('Servicio de maestranza', 3, 'mes', 0, 0),
('Afectacion del personal  a  cursos', 3, 'Jornada', 0, 0),
('Talleres de riesgo en trabajos de construccion y montaje  (  1 x mes )', 3, 'Gl', 0, 0);

-- Tipo 4: Movimientos de suelos  y obra civil
INSERT INTO recursos (descripcion, id_tipo_recurso, unidad, cantidad, meses_operario) VALUES
('Replanteos para construccion', 4, 'Gl', 0, 0),
('Delimitacion de areas  y  carteleria de seguridad', 4, 'Gl', 0, 0);

-- Tipo 5: Construccion de  caminos de acceso
INSERT INTO recursos (descripcion, id_tipo_recurso, unidad, cantidad, meses_operario) VALUES
('Retiro de capa  vegetal   y disposicion del material', 5, 'm3', 0, 0),
('Desmontes', 5, 'm3', 0, 0),
('Relleno y compactacion', 5, 'm3', 0, 0);

-- Tipo 6: Construccion de locacion
INSERT INTO recursos (descripcion, id_tipo_recurso, unidad, cantidad, meses_operario) VALUES
('Retiro de capa  vegetal   y disposicion del material', 6, 'm3', 0, 0),
('Desmontes', 6, 'm3', 0, 0),
('Relleno y compactacion', 6, 'm3', 0, 0),
('Carga , transporte y descarga de materiales  en obra', 6, 'u', 0, 0),
('Excavaciones  ,retiro y disposicion', 6, 'm3', 0, 0),
('Relleno compactado para bases', 6, 'm3', 0, 0),
('Hormigon de limpieza  H.15', 6, 'u', 0, 0);

-- Tipo 7: Construcciones de HºAº  H.30   premoldeadas  en  base
INSERT INTO recursos (descripcion, id_tipo_recurso, unidad, cantidad, meses_operario) VALUES
('Construccion de  bases soportes de   piping', 7, 'm3', 0, 0),
('Bases de apoyo  pasarela  y  otros', 7, 'm3', 0, 0),
('Construccion base de  separador  sleepers', 7, 'm3', 0, 0),
('Construccion contencion separador', 7, 'm3', 0, 0),
('Construccion base de colector de entrada', 7, 'm3', 0, 0),
('Construccion base de cuadro de valvulas  sleeper', 7, 'm3', 0, 0),
('Construccion bases de racks de cañerias', 7, 'm3', 0, 0),
('Construccion base de  equipos de Aire Instrumentos  sleeper', 7, 'm3', 0, 0),
('Construccion base de transformador', 7, 'm3', 0, 0),
('Construccion base de tableros BT y de Control', 7, 'm3', 0, 0),
('Construccion camaras de drenajes', 7, 'm3', 0, 0),
('Construccion bases de  Columnas de iluminacion', 7, 'm3', 0, 0),
('Construccion bases de  Torres  de iluminacion', 7, 'm3', 0, 0),
('Construccion base de  Skid de quimicos  parafinas  y corrosion', 7, 'm3', 0, 0),
('Construccion de camaras de E & I', 7, 'm3', 0, 0),
('Construccion soportes pedestales de E & I', 7, 'm3', 0, 0),
('Construccion  base de bombas de transferencia', 7, 'm3', 0, 0),
('Construccion base de mastil', 7, 'm3', 0, 0),
('Construccion de dados de anclaje cercado', 7, 'm3', 0, 0),
('Construccion de veredas  ( 100 mts de ancho 0,80 )', 7, 'm3', 0, 0),
('Preparacion de superficie  y pintura de estructuras de hormigon', 7, 'm2', 0, 0),
('Carga , transporte y descarga de premoldeados en obra', 7, 'Viaje', 0, 0),
('Montaje  en obra de  bases premoldeadas  con  hidrogrua', 7, 'u', 0, 0),
('Montaje  en obra de  bases premoldeadas con gruas', 7, 'u', 0, 0),
('Colocacion de veredas', 7, 'm', 0, 0),
('Relleno y sellado de juntas', 7, 'Gl', 0, 0),
('Montaje de cercos  prefabricados de estructuras metalicas con puertas y portones', 7, 'm', 0, 0),
('Retoques de pintura', 7, 'Gl', 0, 0),
('Terminaciones   y limpieza de obra civil', 7, 'Gl', 0, 0);

-- Tipo 8: Fabricacion y montaje de estructuras metalicas  y  equipos (nota: no aparece en tu lista, pero está en tiposRecurso)
-- Sin recursos para este tipo

-- Tipo 9: Fabricaciones en taller de estructuras metalicas
INSERT INTO recursos (descripcion, id_tipo_recurso, unidad, cantidad, meses_operario) VALUES
('Soportes Metalicos piping  para cañerias', 9, 'kg', 0, 0),
('Platinas  embebidas  en  premoldeados de hormigon', 9, 'kg', 0, 0),
('Pasarela', 9, 'kg', 0, 0),
('Racks de cañerias', 9, 'kg', 0, 0),
('Estructura de manifold', 9, 'kg', 0, 0),
('Plataforma de montaje de tableros de E &  I ( incluye  semicubierto sobre tableros )', 9, 'kg', 0, 0),
('Construccion de soportes de  botoneras y cables', 9, 'kg', 0, 0),
('Construccion tapas de camaras de E & I Construccion tapa de camaras de drenajes', 9, 'kg', 0, 0),
('END   de estructuras metalicas', 9, 'Gl', 0, 0),
('Preparacion y superficie  y pintura', 9, 'm2', 0, 0),
('Acondicionamiento para transporte', 9, 'u', 0, 0);

-- Tipo 10: Montaje de estructuras  metalicas y equipos en planta
INSERT INTO recursos (descripcion, id_tipo_recurso, unidad, cantidad, meses_operario) VALUES
('Carga , transporte y descarga  de materiales en obra   ( provision Simetra )', 10, 'Viaje', 0, 0),
('Carga , transporte y descarga  de materiales en obra   ( provision YPF SA )', 10, 'Viajes', 0, 0),
('Colocacion de anclajes', 10, 'u', 0, 0),
('Montaje de estructuras  metalicas de soporteria  y tapas', 10, 'u', 0, 0),
('Montaje de estructuras  de racks  y colector  con piping  premontados en taller', 10, 'u', 0, 0),
('Montaje de pasarelas', 10, 'u', 0, 0),
('Montaje  de  separador general SB-001  , skid  001A y skid  001B', 10, 'u', 0, 0),
('Montaje de plataforma para tableros de E & I', 10, 'u', 0, 0),
('Montaje de bombas de transferencia  BP-201/202/203', 10, 'u', 0, 0),
('Montaje de filtros   FCC-202/202/203 Montaje de skid de quimicos', 10, 'u', 0, 0),
('Montaje  de skid de aire instrumentos', 10, 'u', 0, 0),
('Terminaciones y limpieza de obra mecanica', 10, 'Gl', 0, 0);

-- Tipo 11: Fabricacion y montaje del piping (nota: no aparece en tu lista)
-- Sin recursos para este tipo

-- Tipo 12: Fabricaciones en taller   spooles del piping  y otros
INSERT INTO recursos (descripcion, id_tipo_recurso, unidad, cantidad, meses_operario) VALUES
('Carga , transporte y descarga  de materiales  para  fabricacion en taller', 12, 'Gl', 0, 0),
('Corte  , biselado y soldadura de spools  en taller    - END', 12, 'Pulgadas', 0, 0),
('Prueba hidraulica de spools ( llenado , PH , vaciado y secado )', 12, 'Tramos', 0, 0),
('Pruebas de valvulas  en taller mayores a   2  en taller', 12, 'u', 0, 0),
('Pruebas de valvulas  en taller  menores o iguales   a 2 en taller', 12, 'u', 0, 0),
('Preparacion de superficie y pintura  de spools', 12, 'm2', 0, 0),
('Montaje de  spools de cañerias  en 4  racks  y 2 colectores , colocar U Bolts', 12, 'u', 0, 0),
('Ajuste y torqueos de uniones bridadas', 12, 'u', 0, 0),
('Acondicionamiento de spools y racks  para transporte', 12, 'Gl', 0, 0);

-- Tipo 13: Montaje del piping en planta  y otros
INSERT INTO recursos (descripcion, id_tipo_recurso, unidad, cantidad, meses_operario) VALUES
('Cateos', 13, 'm3', 0, 0),
('Carga , transporte y descarga  de materiales  prefabricados en obra', 13, 'Viaje', 0, 0),
('Presentacion , montaje de spools  de bombas de transferencia', 13, 'u', 0, 0),
('Montaje de cañerias  de aire instrumentos', 13, 'm', 0, 0),
('Montaje de cañerias de drenajes  y ajustes', 13, 'm', 0, 0),
('Ajustes y torqueos de  uniones bridadas en campo', 13, 'u', 0, 0),
('Prueba hidraulica de spools ( llenado , PH , vaciado y secado )', 13, 'Tramos', 0, 0),
('Retoques  finales de pintura', 13, 'm2', 0, 0),
('Cama de arena', 13, 'u', 0, 0),
('Aislaciones  termicas y tracing', 13, 'u', 0, 0),
('Terminaciones  varias  y limpieza de obra de piping', 13, 'u', 0, 0);

-- Tipo 14: Obra de electricidad
INSERT INTO recursos (descripcion, id_tipo_recurso, unidad, cantidad, meses_operario) VALUES
('Replanteos de obra electrica', 14, 'Gl', 0, 0),
('Carga , transporte y descarga  de materiales  en obra', 14, 'Viaje', 0, 0),
('Excavaciones , tapadas y retiros   para PATs', 14, 'm3', 0, 0),
('Montaje  de tablero  TGBT  y transformador', 14, 'u', 0, 0),
('Montaje de tablero TSAI-CA-SAT', 14, 'u', 0, 0),
('Equipo  SAI-CA-SAT +  baterias', 14, 'u', 0, 0),
('Montaje y equipamiento de  columna de iluminacion localizada', 14, 'u', 0, 0),
('Montaje y equipamiento de  torres de iluminacion', 14, 'u', 0, 0),
('Construccion de canalizaciones  por bandejas portacables', 14, 'm', 0, 0),
('Montaje de conduits aereos', 14, 'm', 0, 0),
('Montaje de JBs de iluminacion', 14, 'u', 0, 0),
('Montaje de JBs  de tracing  y TC', 14, 'u', 0, 0),
('Montaje de  botoneras de marcha - parada', 14, 'u', 0, 0),
('Montaje de tomacorrientes', 14, 'u', 0, 0),
('Colocacion de prensacables  y acometidas', 14, 'u', 0, 0),
('Tendido  de cables de potencia  ( BT + MT )', 14, 'm', 0, 0),
('Conexionado de cables de potencia  y comando  (BT + MT )', 14, 'puntas', 0, 0),
('Construccion de sistema de puestas a tierra', 14, 'm', 0, 0),
('Conexiones de PATs  a equipos y estructuras ,  y descargas atmosfericas', 14, 'u', 0, 0),
('Colocacion de jabalinas', 14, 'u', 0, 0),
('Proteccion catodica , terminaciones y limpieza de obra electrica', 14, 'Gl', 0, 0);

-- Tipo 15: Obra de instrumentos
INSERT INTO recursos (descripcion, id_tipo_recurso, unidad, cantidad, meses_operario) VALUES
('Replanteos  de obras de instrumentos', 15, 'Gl', 0, 0),
('Carga , transporte y descarga de materiales en obra', 15, 'Viaje', 0, 0),
('Montaje de tablero SCP y  SIS', 15, 'u', 0, 0),
('Construccion de canalizaciones  por bandejas portacables', 15, 'm', 0, 0),
('Montaje de conduits aereos', 15, 'm', 0, 0),
('Manometros varios', 15, 'u', 0, 0),
('Transmisor de presion de proceso', 15, 'u', 0, 0),
('Vaina + RTD', 15, 'u', 0, 0),
('Cuña diferencial 10 #300', 15, 'u', 0, 0),
('FV002  4 #300', 15, 'u', 0, 0),
('PDIT para filtros', 15, 'u', 0, 0),
('Puente de medicion  12 #300', 15, 'u', 0, 0),
('Computador de flujo  Flo Boos', 15, 'u', 0, 0),
('SDV 12 #300 con actuador neumatico', 15, 'u', 0, 0),
('PCV autorregulada 1 #150 AI', 15, 'u', 0, 0),
('PSV 1 x 2 #150 AI', 15, 'u', 0, 0),
('PSV 2 x 3 #300-#150 crudo', 15, 'u', 0, 0),
('Arrestallama 2 #150 venteo sumidero', 15, 'u', 0, 0),
('Inyectores de quimicos', 15, 'u', 0, 0),
('Pulsador de aviso / paro HS', 15, 'u', 0, 0),
('Montaje de JBs', 15, 'u', 0, 0),
('Montaje de mastil basculante de comunicaciones', 15, 'u', 0, 0),
('Colocacion de prensacables  y acometidas', 15, 'u', 0, 0),
('Tendido  de cables de instrumentacion', 15, 'm', 0, 0),
('Conexionado de cables de instrumentacion', 15, 'Puntas', 0, 0),
('Montaje de tubings  y conectores AISI  para instrumentos', 15, 'm', 0, 0),
('Montaje de  tubing  y conectores AISI para  Inyeccion de quimicos', 15, 'm', 0, 0),
('Terminaciones y limpieza de obra de instrumentos', 15, 'Gl', 0, 0);

-- Tipo 16: Precomisionado , comisionado , asistencia de PEM   y  Seguimiento
INSERT INTO recursos (descripcion, id_tipo_recurso, unidad, cantidad, meses_operario) VALUES
('Precomisionado y comisionado de  piping', 16, 'Gl', 0, 0),
('Precomisionado y comisionado mecanico', 16, 'Gl', 0, 0),
('Precomisionado y comisionado de  electricidad', 16, 'Gl', 0, 0),
('Precomisionado y comisionado de  instrumentos  y control', 16, 'Gl', 0, 0),
('Asistencia de Vendors', 16, 'Gl', 0, 0),
('Calibraciones de instrumentos', 16, 'Gl', 0, 0),
('Test de fugas', 16, 'Gl', 0, 0),
('Inertizados con nitrogeno', 16, 'Gl', 0, 0),
('Asistencia de PEM', 16, 'Gl', 0, 0),
('Pruebas de exigencias', 16, 'Gl', 0, 0),
('Seguimiento', 16, 'Gl', 0, 0);

-- Tipo 17: Documentacion final  , data book  ,  carteleria
INSERT INTO recursos (descripcion, id_tipo_recurso, unidad, cantidad, meses_operario) VALUES
('Documentacion  de mark-ups y CAO  de obra', 17, 'Gl', 0, 0),
('Confeccion y entrega de data book', 17, 'Gl', 0, 0),
('Carteleria  e identificaciones', 17, 'Gl', 0, 0);

