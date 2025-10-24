-- Script para arreglar el usuario admin
-- Ejecutar si el login no funciona

-- Eliminar usuario admin existente si existe
DELETE FROM usuarios WHERE dni = '12345678';

-- Crear usuario admin con el hash correcto
INSERT INTO usuarios (nombre, apellido, dni, email, password_hash, id_rol, activo) VALUES 
('Admin', 'Sistema', '12345678', 'admin@sistema.com', '$2b$12$cEN8WtEUkIUz.p9jFP4iLu3dJpba55UcjqHaIoa7u0N0nGIkxqCwq', 1, TRUE);

-- Verificar que se creó correctamente
SELECT 'Usuario admin creado:' as info, COUNT(*) as cantidad FROM usuarios WHERE dni = '12345678';







