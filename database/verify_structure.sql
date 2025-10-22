-- Script para verificar que la nueva estructura funciona correctamente

-- Verificar tablas creadas
SELECT 'Tablas creadas:' as info, COUNT(*) as cantidad 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('obras', 'partidas', 'subpartidas', 'partidas_costos', 'subpartidas_costos', 'incrementos', 'tipos_recurso', 'recursos');

-- Verificar datos insertados
SELECT 'Obras:' as tabla, COUNT(*) as registros FROM obras
UNION ALL
SELECT 'Partidas:', COUNT(*) FROM partidas
UNION ALL
SELECT 'Subpartidas:', COUNT(*) FROM subpartidas
UNION ALL
SELECT 'Tipos de recursos:', COUNT(*) FROM tipos_recurso
UNION ALL
SELECT 'Recursos:', COUNT(*) FROM recursos
UNION ALL
SELECT 'Costos partidas:', COUNT(*) FROM partidas_costos
UNION ALL
SELECT 'Costos subpartidas:', COUNT(*) FROM subpartidas_costos;

-- Verificar relaciones
SELECT 'Obras con partidas:' as relacion, COUNT(*) as cantidad
FROM obras o
JOIN partidas p ON o.id_obra = p.id_obra;

SELECT 'Partidas con subpartidas:' as relacion, COUNT(*) as cantidad
FROM partidas p
JOIN subpartidas s ON p.id_partida = s.id_partida
WHERE p.tiene_subpartidas = TRUE;

SELECT 'Partidas sin subpartidas:' as relacion, COUNT(*) as cantidad
FROM partidas p
LEFT JOIN subpartidas s ON p.id_partida = s.id_partida
WHERE p.tiene_subpartidas = FALSE;

-- Verificar costos
SELECT 'Costos en partidas:' as tipo, COUNT(*) as cantidad FROM partidas_costos
UNION ALL
SELECT 'Costos en subpartidas:', COUNT(*) FROM subpartidas_costos;

-- Verificar totales
SELECT 
    'Total costos partidas:' as concepto,
    SUM(total_linea) as monto
FROM partidas_costos
UNION ALL
SELECT 
    'Total costos subpartidas:',
    SUM(total_linea)
FROM subpartidas_costos;

-- Verificar estructura de datos
SELECT 
    o.nombre_proyecto,
    p.nombre_partida,
    CASE 
        WHEN p.tiene_subpartidas THEN 'Tiene subpartidas'
        ELSE 'Sin subpartidas'
    END as tipo_partida,
    CASE 
        WHEN p.tiene_subpartidas THEN 
            (SELECT COUNT(*) FROM subpartidas s WHERE s.id_partida = p.id_partida)
        ELSE 
            (SELECT COUNT(*) FROM partidas_costos pc WHERE pc.id_partida = p.id_partida)
    END as elementos
FROM obras o
JOIN partidas p ON o.id_obra = p.id_obra
ORDER BY o.id_obra, p.id_partida;
