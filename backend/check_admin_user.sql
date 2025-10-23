-- Script para verificar el usuario admin
-- Ejecutar para ver si el usuario existe y tiene el hash correcto

SELECT 
    'Usuario admin encontrado:' as info,
    dni,
    nombre,
    apellido,
    email,
    activo,
    password_hash,
    id_rol
FROM usuarios 
WHERE dni = '12345678';

-- Verificar roles
SELECT 
    'Roles disponibles:' as info,
    id_rol,
    nombre,
    descripcion
FROM roles;




