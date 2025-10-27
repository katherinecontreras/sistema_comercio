-- ============================================================================
-- SCRIPT DE ACTUALIZACIÓN DE BASE DE DATOS
-- Sistema de Comercio - Optimización Completa
-- ============================================================================

-- 1. ACTUALIZAR TABLA OBRAS CON CAMPOS DE RESUMEN
-- ============================================================================

-- Agregar campos de resumen si no existen
DO $$ 
BEGIN
    -- Campos de conteo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras' AND column_name = 'total_partidas') THEN
        ALTER TABLE obras ADD COLUMN total_partidas INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras' AND column_name = 'total_subpartidas') THEN
        ALTER TABLE obras ADD COLUMN total_subpartidas INTEGER DEFAULT 0;
    END IF;
    
    -- Campos de costos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras' AND column_name = 'total_costo_obra_sin_incremento') THEN
        ALTER TABLE obras ADD COLUMN total_costo_obra_sin_incremento NUMERIC(18,4) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras' AND column_name = 'total_costo_obra_con_incrementos') THEN
        ALTER TABLE obras ADD COLUMN total_costo_obra_con_incrementos NUMERIC(18,4) DEFAULT 0;
    END IF;
    
    -- Campos de duración e incrementos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras' AND column_name = 'total_duracion_obra') THEN
        ALTER TABLE obras ADD COLUMN total_duracion_obra NUMERIC(18,4) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras' AND column_name = 'total_incrementos') THEN
        ALTER TABLE obras ADD COLUMN total_incrementos NUMERIC(18,4) DEFAULT 0;
    END IF;
    
    -- Campo JSON para costos detallados
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras' AND column_name = 'costos_partidas') THEN
        ALTER TABLE obras ADD COLUMN costos_partidas JSONB;
    END IF;
END $$;

-- 2. ACTUALIZAR TABLA PARTIDAS CON NUEVOS CAMPOS
-- ============================================================================

DO $$ 
BEGIN
    -- Campo duración
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partidas' AND column_name = 'duracion') THEN
        ALTER TABLE partidas ADD COLUMN duracion NUMERIC(18,4) DEFAULT 0;
    END IF;
    
    -- Campo tipo de tiempo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partidas' AND column_name = 'id_tipo_tiempo') THEN
        ALTER TABLE partidas ADD COLUMN id_tipo_tiempo INTEGER REFERENCES tipo_de_tiempo(id_tipo_tiempo);
    END IF;
    
    -- Campo especialidad (JSON)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partidas' AND column_name = 'especialidad') THEN
        ALTER TABLE partidas ADD COLUMN especialidad JSONB;
    END IF;
END $$;

-- 3. ACTUALIZAR TABLA SUBPARTIDAS (REMOVER CAMPOS OBSOLETOS)
-- ============================================================================

DO $$ 
BEGIN
    -- Remover campos obsoletos si existen
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subpartidas' AND column_name = 'unidad') THEN
        ALTER TABLE subpartidas DROP COLUMN unidad;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subpartidas' AND column_name = 'precio_unitario') THEN
        ALTER TABLE subpartidas DROP COLUMN precio_unitario;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subpartidas' AND column_name = 'cantidad') THEN
        ALTER TABLE subpartidas DROP COLUMN cantidad;
    END IF;
END $$;

-- 4. ACTUALIZAR TABLAS DE COSTOS CON NUEVOS CAMPOS
-- ============================================================================

DO $$ 
BEGIN
    -- Agregar campos a partidas_costos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partidas_costos' AND column_name = 'porcentaje_de_uso') THEN
        ALTER TABLE partidas_costos ADD COLUMN porcentaje_de_uso NUMERIC(5,2) DEFAULT 100.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partidas_costos' AND column_name = 'tiempo_de_uso') THEN
        ALTER TABLE partidas_costos ADD COLUMN tiempo_de_uso NUMERIC(18,4) DEFAULT 0;
    END IF;
    
    -- Agregar campos a subpartidas_costos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subpartidas_costos' AND column_name = 'porcentaje_de_uso') THEN
        ALTER TABLE subpartidas_costos ADD COLUMN porcentaje_de_uso NUMERIC(5,2) DEFAULT 100.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subpartidas_costos' AND column_name = 'tiempo_de_uso') THEN
        ALTER TABLE subpartidas_costos ADD COLUMN tiempo_de_uso NUMERIC(18,4) DEFAULT 0;
    END IF;
END $$;

-- 5. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================================

-- Índices para obras
CREATE INDEX IF NOT EXISTS idx_obras_cliente ON obras(id_cliente);
CREATE INDEX IF NOT EXISTS idx_obras_estado ON obras(estado);
CREATE INDEX IF NOT EXISTS idx_obras_fecha_creacion ON obras(fecha_creacion);

-- Índices para partidas
CREATE INDEX IF NOT EXISTS idx_partidas_obra ON partidas(id_obra);
CREATE INDEX IF NOT EXISTS idx_partidas_tipo_tiempo ON partidas(id_tipo_tiempo);
CREATE INDEX IF NOT EXISTS idx_partidas_tiene_subpartidas ON partidas(tiene_subpartidas);

-- Índices para costos
CREATE INDEX IF NOT EXISTS idx_partidas_costos_partida ON partidas_costos(id_partida);
CREATE INDEX IF NOT EXISTS idx_subpartidas_costos_subpartida ON subpartidas_costos(id_subpartida);

-- Índices para incrementos (verificar estructura de tabla primero)
-- CREATE INDEX IF NOT EXISTS idx_incrementos_obra ON incrementos(id_obra);
-- CREATE INDEX IF NOT EXISTS idx_incrementos_partida ON incrementos(id_partida);
-- CREATE INDEX IF NOT EXISTS idx_incrementos_subpartida ON incrementos(id_subpartida);

-- Índices para recursos
CREATE INDEX IF NOT EXISTS idx_recursos_tipo ON recursos(id_tipo_recurso);
CREATE INDEX IF NOT EXISTS idx_recursos_unidad ON recursos(id_unidad);

-- 6. CREAR FUNCIONES DE ACTUALIZACIÓN AUTOMÁTICA
-- ============================================================================

-- Función para actualizar resumen de obra
CREATE OR REPLACE FUNCTION actualizar_resumen_obra(p_id_obra INTEGER)
RETURNS VOID AS $$
DECLARE
    v_total_partidas INTEGER;
    v_total_subpartidas INTEGER;
    v_total_costo_sin_incremento NUMERIC(18,4);
    v_total_costo_con_incrementos NUMERIC(18,4);
    v_total_duracion NUMERIC(18,4);
    v_total_incrementos NUMERIC(18,4);
    v_costos_partidas JSONB;
BEGIN
    -- Contar partidas y subpartidas
    SELECT COUNT(*) INTO v_total_partidas FROM partidas WHERE id_obra = p_id_obra;
    SELECT COUNT(*) INTO v_total_subpartidas FROM subpartidas sp 
    JOIN partidas p ON sp.id_partida = p.id_partida WHERE p.id_obra = p_id_obra;
    
    -- Calcular costos totales de partidas (usar campos existentes)
    SELECT COALESCE(SUM(pc.cantidad * pc.costo_unitario_predeterminado), 0) INTO v_total_costo_sin_incremento
    FROM partidas_costos pc
    JOIN partidas p ON pc.id_partida = p.id_partida
    WHERE p.id_obra = p_id_obra;
    
    -- Sumar costos de subpartidas al total
    v_total_costo_sin_incremento := v_total_costo_sin_incremento + COALESCE((
        SELECT SUM(sc.cantidad * sc.costo_unitario_predeterminado)
        FROM subpartidas_costos sc
        JOIN subpartidas sp ON sc.id_subpartida = sp.id_subpartida
        JOIN partidas p ON sp.id_partida = p.id_partida
        WHERE p.id_obra = p_id_obra
    ), 0);
    
    -- Calcular incrementos totales
    SELECT COALESCE(SUM(monto_calculado), 0) INTO v_total_incrementos
    FROM incrementos WHERE id_obra = p_id_obra;
    
    -- Calcular duración total (simplificado)
    SELECT COALESCE(SUM(duracion), 0) INTO v_total_duracion
    FROM partidas WHERE id_obra = p_id_obra;
    
    -- Actualizar obra
    UPDATE obras SET
        total_partidas = v_total_partidas,
        total_subpartidas = v_total_subpartidas,
        total_costo_obra_sin_incremento = v_total_costo_sin_incremento,
        total_costo_obra_con_incrementos = v_total_costo_sin_incremento + v_total_incrementos,
        total_duracion_obra = v_total_duracion,
        total_incrementos = v_total_incrementos
    WHERE id_obra = p_id_obra;
END;
$$ LANGUAGE plpgsql;

-- 7. CREAR TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- ============================================================================

-- Trigger para actualizar resumen cuando se modifica una partida
CREATE OR REPLACE FUNCTION trigger_actualizar_resumen_partida()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM actualizar_resumen_obra(NEW.id_obra);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM actualizar_resumen_obra(OLD.id_obra);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers
DROP TRIGGER IF EXISTS trg_actualizar_resumen_partida ON partidas;
CREATE TRIGGER trg_actualizar_resumen_partida
    AFTER INSERT OR UPDATE OR DELETE ON partidas
    FOR EACH ROW EXECUTE FUNCTION trigger_actualizar_resumen_partida();

DROP TRIGGER IF EXISTS trg_actualizar_resumen_subpartida ON subpartidas;
CREATE TRIGGER trg_actualizar_resumen_subpartida
    AFTER INSERT OR UPDATE OR DELETE ON subpartidas
    FOR EACH ROW EXECUTE FUNCTION trigger_actualizar_resumen_partida();

DROP TRIGGER IF EXISTS trg_actualizar_resumen_incremento ON incrementos;
CREATE TRIGGER trg_actualizar_resumen_incremento
    AFTER INSERT OR UPDATE OR DELETE ON incrementos
    FOR EACH ROW EXECUTE FUNCTION trigger_actualizar_resumen_partida();

-- 8. ACTUALIZAR DATOS EXISTENTES
-- ============================================================================

-- Actualizar resúmenes de obras existentes
DO $$
DECLARE
    obra_record RECORD;
BEGIN
    FOR obra_record IN SELECT id_obra FROM obras LOOP
        PERFORM actualizar_resumen_obra(obra_record.id_obra);
    END LOOP;
END $$;

-- 9. COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

COMMENT ON COLUMN obras.total_partidas IS 'Número total de partidas en la obra';
COMMENT ON COLUMN obras.total_subpartidas IS 'Número total de subpartidas en la obra';
COMMENT ON COLUMN obras.total_costo_obra_sin_incremento IS 'Costo total de la obra sin incrementos';
COMMENT ON COLUMN obras.total_costo_obra_con_incrementos IS 'Costo total de la obra con incrementos';
COMMENT ON COLUMN obras.total_duracion_obra IS 'Duración total de la obra';
COMMENT ON COLUMN obras.total_incrementos IS 'Total de incrementos aplicados';
COMMENT ON COLUMN obras.costos_partidas IS 'JSON con detalles de costos por partida';

COMMENT ON COLUMN partidas.duracion IS 'Duración de la partida';
COMMENT ON COLUMN partidas.id_tipo_tiempo IS 'Tipo de tiempo para la duración';
COMMENT ON COLUMN partidas.especialidad IS 'JSON con especialidades asociadas';

COMMENT ON COLUMN partidas_costos.porcentaje_de_uso IS 'Porcentaje de uso del recurso (0-100)';
COMMENT ON COLUMN partidas_costos.tiempo_de_uso IS 'Tiempo de uso del recurso';
COMMENT ON COLUMN subpartidas_costos.porcentaje_de_uso IS 'Porcentaje de uso del recurso (0-100)';
COMMENT ON COLUMN subpartidas_costos.tiempo_de_uso IS 'Tiempo de uso del recurso';

-- 10. VERIFICACIÓN FINAL
-- ============================================================================

-- Verificar que todos los cambios se aplicaron correctamente
DO $$
BEGIN
    RAISE NOTICE 'Verificando estructura de base de datos...';
    
    -- Verificar campos en obras
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras' AND column_name = 'total_partidas') THEN
        RAISE EXCEPTION 'Campo total_partidas no encontrado en tabla obras';
    END IF;
    
    -- Verificar campos en partidas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partidas' AND column_name = 'duracion') THEN
        RAISE EXCEPTION 'Campo duracion no encontrado en tabla partidas';
    END IF;
    
    -- Verificar índices
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_obras_cliente') THEN
        RAISE EXCEPTION 'Índice idx_obras_cliente no encontrado';
    END IF;
    
    RAISE NOTICE 'Base de datos actualizada correctamente';
END $$;
