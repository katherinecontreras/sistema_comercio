= 🏗️ Sistema de Comercio - Cotizaciones
:toc: macro
:toc-title: Índice
:sectnums:

Aplicación para generar cotizaciones complejas por obras e ítems, con gestión de catálogos, usuarios, configuración global y exportación a PDF.  
Desarrollada con *FastAPI*, *PostgreSQL*, *Tauri + React* y *Docker*.

toc::[]

== 📘 Descripción

Sistema pensado para empresas constructoras o de servicios que requieren realizar presupuestos y cotizaciones con múltiples ítems, categorías, incrementos automáticos y exportación profesional a PDF.

Incluye backend robusto en *FastAPI* con autenticación JWT, base de datos en *PostgreSQL* y un *frontend Tauri + React* de escritorio, con diseño moderno y responsivo.

---

== ⚙️ Requisitos previos

[cols="1,1,2", options="header"]
|===
| Componente | Versión recomendada | Descripción
| Python | 3.10 o superior | Backend (FastAPI)
| Node.js | LTS (18+) | Frontend (React + Tauri)
| Rust | Última versión estable | Requerido para compilar Tauri
| Docker + Docker Compose | — | Orquestación de servicios (PostgreSQL, etc.)
|===

---

== 🚀 Instalación y ejecución rápida

=== 1️⃣ Clonar el repositorio

[source,bash]
----
git clone https://github.com/katherinecontreras/sistema_comercio.git
cd sistemaComercio
----

---

=== 2️⃣ Backend y Base de Datos

1. Copiar el archivo de entorno:

[source,bash]
----
cp .env.example .env
----

Luego editar las variables necesarias (por ejemplo conexión a PostgreSQL, usuario y contraseña).

2. Levantar la base de datos con Docker:

[source,bash]
----
docker compose up -d --build
----

3. (Opcional) Crear entorno virtual e instalar dependencias de Python:

[source,bash]
----
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
----

4. Ejecutar el backend:

[source,bash]
----
python -m uvicorn app.main:app --reload
----

El backend estará disponible en:
- 🌐 `http://localhost:8000`
- 📄 Documentación interactiva: `http://localhost:8000/docs`

---

=== 3️⃣ Frontend (Tauri + React)

1. Ingresar al directorio del frontend:

[source,bash]
----
cd frontend
----

2. Instalar dependencias:

[source,bash]
----
npm install
----

3. Ejecutar en modo desarrollo (aplicación de escritorio):

[source,bash]
----
npm run tauri:dev
----

---

=== 4️⃣ Credenciales por defecto

[cols="1,1", options="header"]
|===
| Usuario | Contraseña
| DNI: `00000000` | `admin123`
|===

---

== 📁 Estructura del proyecto

[source,plaintext]
----
sistemaComercio/
├── backend/               # Servicio FastAPI con autenticación JWT
│   ├── app/               # Lógica del backend (endpoints, modelos, etc.)
│   ├── requirements.txt   # Dependencias de Python
│   └── Dockerfile
│
├── frontend/              # Aplicación Tauri + React + Tailwind
│   ├── src/               # Código fuente del frontend
│   ├── src-tauri/         # Configuración Tauri (Rust)
│   └── package.json
│
├── database/              # Esquemas y datos iniciales
├── docker-compose.yml     # Orquestación de servicios (PostgreSQL, etc.)
└── README.adoc            # Este archivo
----

---

== ✨ Funcionalidades implementadas

* ✅ Autenticación JWT (DNI / Contraseña)
* ✅ Gestión de usuarios y roles
* ✅ Catálogos de clientes, proveedores y recursos
* ✅ Carga masiva de recursos desde Excel
* ✅ Cotizaciones jerárquicas (obras → ítems)
* ✅ Asignación de costos e incrementos automáticos
* ✅ Cálculo total dinámico
* ✅ Exportación de cotizaciones a PDF
* ✅ Configuración global del sistema
* ✅ Frontend con navegación y login seguro

---

== 🐳 Uso con Docker (opcional todo en contenedor)

Si querés ejecutar todo el sistema en contenedores (sin instalar Python ni PostgreSQL localmente):

[source,bash]
----
docker compose up --build
----

Esto levanta automáticamente la base de datos y el backend.  
El frontend puede seguir ejecutándose con:

[source,bash]
----
cd frontend
npm run tauri:dev
----

---

== 🧹 Notas de mantenimiento

* Los binarios y builds de Tauri (carpeta `target/`) están excluidos del repositorio mediante `.gitignore`.
* Se utilizó `git filter-repo` para limpiar archivos grandes de Rust y mantener el historial limpio.
* Evitar subir archivos generados automáticamente (`node_modules/`, `__pycache__/`, etc.).
* Ante cambios grandes en dependencias, limpiar con:
  [source,bash]
  ----
  npm ci
  docker compose build --no-cache
  ----

---

== 🔒 Licencia

**Privado – Uso interno.**  
No se permite la redistribución sin autorización expresa.
