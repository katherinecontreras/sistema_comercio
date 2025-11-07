-- Script simple para corregir el problema de tiposRecurso
-- Ejecutar este script en PostgreSQL

-- Paso 1: Renombrar la tabla si existe en minúsculas
ALTER TABLE IF EXISTS tiposrecurso RENAME TO "tiposRecurso";

-- Paso 2: Verificar que la tabla existe con el nombre correcto
-- (Este comando solo muestra información, no hace cambios)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name = 'tiposRecurso' OR table_name = 'tiposrecurso');


