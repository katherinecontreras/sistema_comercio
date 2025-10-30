# **Documentación del Algoritmo de Limpieza de Datos de Personal**

Este documento describe la funcionalidad del script excel\_to\_clean\_csv\_converter.py y los pasos necesarios para integrarlo en un flujo de trabajo web (Frontend/Backend) para subir el archivo de Excel o CSV original y generar un archivo compatible con la importación a PostgreSQL.

## **1\. Función del Algoritmo (excel\_to\_clean\_csv\_converter.py)**

El script tiene como objetivo transformar el archivo de costos de personal original (que contiene encabezados múltiples, datos sucios y problemas de formato) en un archivo CSV limpio, plano y estandarizado, que se puede importar directamente a la tabla public.personal de PostgreSQL.

### **Pasos Clave del Procesamiento:**

1. **Carga Inteligente:** Lee el archivo de entrada (sea Excel o CSV) saltándose las primeras dos filas irrelevantes de encabezado (header=2).  
2. **Mapeo y Renombrado:** Renombra las columnas con los nombres exactos esperados por la base de datos (funcion, sueldo\_bruto, descuentos, etc.).  
3. **Selección de Columnas:** Descarta todas las columnas extras o no necesarias (incluyendo cualquier posible columna de ID si existiera) y mantiene solo las 15 columnas relevantes.  
4. **Limpieza de Porcentajes:**  
   * Convierte las columnas de porcentaje (porc\_descuento, porc\_cargas\_sociales\_sobre\_sueldo\_bruto) a formato decimal (0.17 en lugar de 17% o 17).  
5. **Limpieza Numérica General:**  
   * Convierte todos los campos numéricos a formato float.  
   * Reemplaza comas por puntos en los números (para asegurar el formato decimal de EE. UU. que espera PostgreSQL en el modo COPY estándar).  
   * Rellena valores faltantes (NaN) con 0\.  
6. **Generación del CSV de Salida:**  
   * Genera un archivo CSV con delimitador **,** (coma).  
   * Utiliza el encoding **LATIN1**.  
   * Cita automáticamente los campos de texto que contienen comas internas (como "Supervisor area , Resp. Q ,Resp.MASS") usando comillas dobles (") para evitar el error de "datos extra después de la última columna".

## **2\. Integración en el Flujo Web (Frontend y Backend)**

### **A. Frontend (Interfaz de Usuario)**

El Frontend es responsable de permitir al usuario seleccionar el archivo y enviarlo al Backend.

1. **Elemento de Entrada:** Usar un input de tipo file en HTML.  
   \<input type="file" id="archivoPersonal" accept=".xlsx, .csv"\>  
   \<button onclick="subirArchivo()"\>Subir y Procesar\</button\>  
   \<div id="mensaje"\>\</div\>

2. **Envío (JavaScript):** Usar la API fetch para enviar el archivo como FormData al endpoint del Backend.  
   function subirArchivo() {  
       const input \= document.getElementById('archivoPersonal');  
       const file \= input.files\[0\];

       if (\!file) {  
           document.getElementById('mensaje').textContent \= "Por favor, selecciona un archivo.";  
           return;  
       }

       const formData \= new FormData();  
       formData.append('file', file);

       document.getElementById('mensaje').textContent \= "Subiendo y procesando...";

       fetch('/api/procesar-personal', { // El endpoint de tu Backend  
           method: 'POST',  
           body: formData,  
       })  
       .then(response \=\> {  
           if (response.ok) {  
               // Opción 1: Descargar el archivo procesado si el backend lo devuelve.  
               // Opción 2: Mostrar un mensaje de éxito si el backend lo insertó directamente en DB.  
               document.getElementById('mensaje').textContent \= "¡Procesamiento exitoso\! Datos listos para importar/ya insertados.";  
           } else {  
               return response.json().then(error \=\> { throw new Error(error.message || 'Error desconocido al procesar.'); });  
           }  
       })  
       .catch(error \=\> {  
           document.getElementById('mensaje').textContent \= \`Error: ${error.message}\`;  
           console.error(error);  
       });  
   }  
