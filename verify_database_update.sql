-- ============================================================================
-- SCRIPT DE VERIFICACIÓN RÁPIDA DE BASE DE DATOS
-- Sistema de Comercio - Verificación Post-Actualización
-- ============================================================================

-- 1. VERIFICAR ESTRUCTURA DE TABLAS PRINCIPALES
-- ============================================================================

-- Verificar campos en obras
SELECT 'OBRAS' as tabla, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'obras' 
AND column_name IN ('total_partidas', 'total_subpartidas', 'total_costo_obra_sin_incremento', 'total_costo_obra_con_incrementos', 'total_duracion_obra', 'total_incrementos', 'costos_partidas')
ORDER BY column_name;

-- Verificar campos en partidas
SELECT 'PARTIDAS' as tabla, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'partidas' 
AND column_name IN ('duracion', 'id_tipo_tiempo', 'especialidad')
ORDER BY column_name;

-- Verificar campos en partidas_costos
SELECT 'PARTIDAS_COSTOS' as tabla, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'partidas_costos' 
AND column_name IN ('precio_unitario', 'porcentaje_de_uso', 'tiempo_de_uso')
ORDER BY column_name;

-- Verificar campos en subpartidas_costos
SELECT 'SUBPARTIDAS_COSTOS' as tabla, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subpartidas_costos' 
AND column_name IN ('precio_unitario', 'porcentaje_de_uso', 'tiempo_de_uso')
ORDER BY column_name;

-- 2. VERIFICAR ÍNDICES CREADOS
-- ============================================================================

SELECT indexname, tablename, indexdef 
FROM pg_indexes 
WHERE indexname LIKE 'idx_%' 
AND tablename IN ('obras', 'partidas', 'partidas_costos', 'subpartidas_costos', 'recursos')
ORDER BY tablename, indexname;

-- 3. VERIFICAR FUNCIONES CREADAS
-- ============================================================================

SELECT routine_name, routine_type, routine_definition 
FROM information_schema.routines 
WHERE routine_name IN ('actualizar_resumen_obra', 'trigger_actualizar_resumen_partida')
ORDER BY routine_name;

-- 4. VERIFICAR TRIGGERS ACTIVOS
-- ============================================================================

SELECT trigger_name, event_object_table, action_timing, event_manipulation 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%resumen%'
ORDER BY event_object_table, trigger_name;

-- 5. PROBAR FUNCIÓN DE ACTUALIZACIÓN
-- ============================================================================

-- Probar con una obra existente (reemplazar 1 con un ID real)
DO $$
DECLARE
    test_id INTEGER;
BEGIN
    -- Obtener el primer ID de obra disponible
    SELECT id_obra INTO test_id FROM obras LIMIT 1;
    
    IF test_id IS NOT NULL THEN
        RAISE NOTICE 'Probando función con obra ID: %', test_id;
        PERFORM actualizar_resumen_obra(test_id);
        RAISE NOTICE 'Función ejecutada correctamente';
    ELSE
        RAISE NOTICE 'No hay obras en la base de datos para probar';
    END IF;
END $$;

-- 6. MOSTRAR RESUMEN DE VERIFICACIÓN
-- ============================================================================

SELECT 
    'VERIFICACIÓN COMPLETADA' as estado,
    COUNT(*) as total_campos_obras,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'partidas' AND column_name IN ('duracion', 'id_tipo_tiempo', 'especialidad')) as total_campos_partidas,
    (SELECT COUNT(*) FROM pg_indexes WHERE indexname LIKE 'idx_%') as total_indices,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name IN ('actualizar_resumen_obra', 'trigger_actualizar_resumen_partida')) as total_funciones
FROM information_schema.columns 
WHERE table_name = 'obras' 
AND column_name IN ('total_partidas', 'total_subpartidas', 'total_costo_obra_sin_incremento', 'total_costo_obra_con_incrementos', 'total_duracion_obra', 'total_incrementos', 'costos_partidas');
