Sistema de Comercio - Cotizaciones

Descripción

Aplicación para generar cotizaciones complejas por obras e ítems, con gestión de catálogos, usuarios y exportación a PDF. Stack: Backend en FastAPI (Python), PostgreSQL, Frontend Tauri + React.

Requisitos

- Python 3.10+
- Docker y Docker Compose
- Node.js LTS
- Rust (para Tauri)

Ejecución rápida

Backend y Base de Datos:
1. Copiar .env.example a .env y ajustar variables.
2. docker compose up -d --build
3. Backend en http://localhost:8000, documentación en /docs

Frontend (Tauri + React):
1. cd frontend
2. npm install
3. npm run tauri:dev

Credenciales por defecto:
- DNI: 00000000
- Contraseña: admin123

Estructura

- backend/: servicio FastAPI con autenticación JWT, CRUD completo
- frontend/: aplicación Tauri + React con Tailwind CSS
- database/: esquema SQL inicial
- docker-compose.yml: DB y backend

Funcionalidades implementadas

✅ Autenticación JWT (DNI/contraseña)
✅ Gestión de usuarios y roles
✅ Catálogos (clientes, proveedores, recursos, tipos)
✅ Carga masiva de recursos desde Excel
✅ Cotizaciones con obras e ítems jerárquicos
✅ Asignación de costos e incrementos
✅ Cálculo automático de totales
✅ Exportación a PDF
✅ Configuración global del sistema
✅ Frontend con navegación y login

Licencia

Privado




