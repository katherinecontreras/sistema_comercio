-- Migración para agregar campos de incrementos y cálculos automáticos
-- Ejecutar este script en la base de datos existente

-- 1. Crear tabla tipo_de_tiempo si no existe
CREATE TABLE IF NOT EXISTS tipo_de_tiempo (
    id_tipo_tiempo SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    medida VARCHAR(10) NOT NULL
);

-- Insertar tipos de tiempo básicos si no existen
INSERT INTO tipo_de_tiempo (nombre, medida) VALUES 
    ('horas', 'hrs'),
    ('días', 'ds'),
    ('meses', 'ms'),
    ('años', 'as')
ON CONFLICT (nombre) DO NOTHING;

-- 2. Agregar campos a la tabla partidas si no existen
ALTER TABLE partidas 
ADD COLUMN IF NOT EXISTS duracion NUMERIC(18,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS id_tipo_tiempo INTEGER REFERENCES tipo_de_tiempo(id_tipo_tiempo),
ADD COLUMN IF NOT EXISTS especialidad JSON;

-- 3. Agregar campos a las tablas de costos si no existen
ALTER TABLE partidas_costos 
ADD COLUMN IF NOT EXISTS porcentaje_de_uso NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tiempo_de_uso NUMERIC(18,4) DEFAULT 0;

ALTER TABLE subpartidas_costos 
ADD COLUMN IF NOT EXISTS porcentaje_de_uso NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tiempo_de_uso NUMERIC(18,4) DEFAULT 0;

-- 4. Crear tabla incrementos si no existe
CREATE TABLE IF NOT EXISTS incrementos (
    id_incremento SERIAL PRIMARY KEY,
    id_partida INTEGER REFERENCES partidas(id_partida),
    id_subpartida INTEGER REFERENCES subpartidas(id_subpartida),
    concepto VARCHAR(250) NOT NULL,
    descripcion TEXT,
    tipo_incremento VARCHAR(50) DEFAULT 'porcentaje',
    valor NUMERIC(18,4) DEFAULT 0,
    porcentaje NUMERIC(9,4) DEFAULT 0,
    monto_calculado NUMERIC(18,4) DEFAULT 0,
    CONSTRAINT check_incremento_target CHECK (
        (id_partida IS NOT NULL AND id_subpartida IS NULL) OR 
        (id_partida IS NULL AND id_subpartida IS NOT NULL)
    )
);

-- 5. Agregar campos de resumen a la tabla obras si no existen
ALTER TABLE obras 
ADD COLUMN IF NOT EXISTS total_partidas INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_subpartidas INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_costo_obra_sin_incremento NUMERIC(18,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_costo_obra_con_incrementos NUMERIC(18,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_duracion_obra NUMERIC(18,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_incrementos NUMERIC(18,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS costos_partidas JSON;

-- 6. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_incrementos_partida ON incrementos(id_partida);
CREATE INDEX IF NOT EXISTS idx_incrementos_subpartida ON incrementos(id_subpartida);
CREATE INDEX IF NOT EXISTS idx_partidas_tipo_tiempo ON partidas(id_tipo_tiempo);

-- 7. Agregar relaciones en las tablas existentes
-- (Esto se maneja automáticamente por SQLAlchemy, pero podemos agregar constraints)

-- Verificar que las relaciones estén correctas
DO $$
BEGIN
    -- Verificar que no haya incrementos huérfanos
    IF EXISTS (
        SELECT 1 FROM incrementos 
        WHERE (id_partida IS NULL AND id_subpartida IS NULL) 
           OR (id_partida IS NOT NULL AND id_subpartida IS NOT NULL)
    ) THEN
        RAISE EXCEPTION 'Existen incrementos con relaciones inválidas';
    END IF;
    
    -- Verificar que las partidas referenciadas existan
    IF EXISTS (
        SELECT 1 FROM incrementos i 
        LEFT JOIN partidas p ON i.id_partida = p.id_partida 
        WHERE i.id_partida IS NOT NULL AND p.id_partida IS NULL
    ) THEN
        RAISE EXCEPTION 'Existen incrementos referenciando partidas inexistentes';
    END IF;
    
    -- Verificar que las subpartidas referenciadas existan
    IF EXISTS (
        SELECT 1 FROM incrementos i 
        LEFT JOIN subpartidas s ON i.id_subpartida = s.id_subpartida 
        WHERE i.id_subpartida IS NOT NULL AND s.id_subpartida IS NULL
    ) THEN
        RAISE EXCEPTION 'Existen incrementos referenciando subpartidas inexistentes';
    END IF;
    
    RAISE NOTICE 'Migración completada exitosamente';
END $$;

