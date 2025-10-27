-- ============================================================================
-- SCRIPT DE VERIFICACIÓN DE ESTRUCTURA DE BASE DE DATOS
-- Sistema de Comercio - Verificación de Campos
-- ============================================================================

-- Verificar estructura de tabla partidas_costos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'partidas_costos' 
ORDER BY ordinal_position;

-- Verificar estructura de tabla subpartidas_costos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'subpartidas_costos' 
ORDER BY ordinal_position;

-- Verificar estructura de tabla incrementos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'incrementos' 
ORDER BY ordinal_position;

-- Verificar estructura de tabla obras
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'obras' 
ORDER BY ordinal_position;
