-- Script de migración para la nueva estructura
-- ⚠️ ADVERTENCIA: Este script modifica la estructura existente

-- 1. Crear tabla tipo_de_tiempo
CREATE TABLE tipo_de_tiempo (
    id_tipo_tiempo SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    medida VARCHAR(10) NOT NULL
);

-- Insertar datos básicos de tipos de tiempo
INSERT INTO tipo_de_tiempo (nombre, medida) VALUES 
('horas', 'hrs'),
('días', 'ds'),
('meses', 'ms'),
('años', 'as');

-- 2. Modificar tabla partidas
-- Agregar nuevos campos
ALTER TABLE partidas ADD COLUMN duracion NUMERIC(18, 4) DEFAULT 0;
ALTER TABLE partidas ADD COLUMN id_tipo_tiempo INTEGER REFERENCES tipo_de_tiempo(id_tipo_tiempo);
ALTER TABLE partidas ADD COLUMN especialidad JSON;

-- Eliminar campo ubicacion
ALTER TABLE partidas DROP COLUMN IF EXISTS ubicacion;

-- 3. Modificar tabla subpartidas
-- Eliminar campos
ALTER TABLE subpartidas DROP COLUMN IF EXISTS id_unidad;
ALTER TABLE subpartidas DROP COLUMN IF EXISTS precio_unitario;
ALTER TABLE subpartidas DROP COLUMN IF EXISTS cantidad;

-- 4. Modificar tabla partidas_costos
-- Agregar nuevos campos
ALTER TABLE partidas_costos ADD COLUMN porcentaje_de_uso NUMERIC(5, 2) DEFAULT 0;
ALTER TABLE partidas_costos ADD COLUMN tiempo_de_uso NUMERIC(18, 4) DEFAULT 0;

-- 5. Modificar tabla subpartidas_costos
-- Agregar nuevos campos
ALTER TABLE subpartidas_costos ADD COLUMN porcentaje_de_uso NUMERIC(5, 2) DEFAULT 0;
ALTER TABLE subpartidas_costos ADD COLUMN tiempo_de_uso NUMERIC(18, 4) DEFAULT 0;

-- 6. Modificar tabla obras
-- Agregar campos de resumen calculados
ALTER TABLE obras ADD COLUMN total_partidas INTEGER DEFAULT 0;
ALTER TABLE obras ADD COLUMN total_subpartidas INTEGER DEFAULT 0;
ALTER TABLE obras ADD COLUMN total_costo_obra_sin_incremento NUMERIC(18, 4) DEFAULT 0;
ALTER TABLE obras ADD COLUMN total_costo_obra_con_incrementos NUMERIC(18, 4) DEFAULT 0;
ALTER TABLE obras ADD COLUMN total_duracion_obra NUMERIC(18, 4) DEFAULT 0;
ALTER TABLE obras ADD COLUMN total_incrementos NUMERIC(18, 4) DEFAULT 0;
ALTER TABLE obras ADD COLUMN costos_partidas JSON;

-- 7. Actualizar datos existentes (opcional)
-- Establecer valores por defecto para campos nuevos
UPDATE partidas SET duracion = 1 WHERE duracion IS NULL;
UPDATE partidas SET id_tipo_tiempo = 1 WHERE id_tipo_tiempo IS NULL; -- 1 = horas por defecto

-- 8. Crear índices para mejorar rendimiento
CREATE INDEX idx_partidas_tipo_tiempo ON partidas(id_tipo_tiempo);
CREATE INDEX idx_partidas_costos_porcentaje ON partidas_costos(porcentaje_de_uso);
CREATE INDEX idx_subpartidas_costos_porcentaje ON subpartidas_costos(porcentaje_de_uso);

-- 9. Verificar cambios
SELECT 'Tabla tipo_de_tiempo creada:' as info, COUNT(*) as cantidad FROM tipo_de_tiempo
UNION ALL
SELECT 'Partidas con duracion:', COUNT(*) FROM partidas WHERE duracion IS NOT NULL
UNION ALL
SELECT 'Partidas con tipo_tiempo:', COUNT(*) FROM partidas WHERE id_tipo_tiempo IS NOT NULL
UNION ALL
SELECT 'Costos con porcentaje:', COUNT(*) FROM partidas_costos WHERE porcentaje_de_uso IS NOT NULL;
