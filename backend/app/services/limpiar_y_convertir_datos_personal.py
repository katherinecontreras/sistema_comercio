import pandas as pd
import io

# --- Configuración ---
# Nombres de las columnas que queremos en el archivo final, en el orden exacto.
# Estas coinciden con el encabezado que funcionó en la base de datos.
COLUMNAS_FINALES = [
    'funcion',
    'sueldo_bruto',
    'descuentos',
    'porc_descuento',
    'sueldo_no_remunerado',
    'neto_bolsillo_mensual',
    'cargas_sociales',
    'porc_cargas_sociales_sobre_sueldo_bruto',
    'costo_total_mensual',
    'costo_mensual_sin_seguros',
    'seguros_art_mas_vo',
    'examen_medico',
    'indumentaria_y_epp',
    'pernoctes_y_viajes',
    'costo_total_mensual_apertura'
]

def limpiar_y_convertir_datos_personal(archivo_entrada, formato_salida='csv'):
    """
    Procesa un archivo de Excel o CSV (con formato de Excel original)
    para limpiarlo y generar un CSV listo para importar a PostgreSQL.

    Pasos de limpieza aplicados:
    1. Omitir las primeras filas de encabezado basura.
    2. Establecer los nombres de las columnas que nos interesan.
    3. Eliminar columnas innecesarias (incluyendo el ID de personal si existiera).
    4. Limpiar datos numéricos (eliminar símbolos de porcentaje y forzar formato de punto decimal).
    5. Aplicar el formato de LATIN1 con comillas para manejar comas internas.

    Args:
        archivo_entrada (str o io.BytesIO): Ruta o stream del archivo de entrada (.xlsx o .csv).
        formato_salida (str): 'csv' (predeterminado) o 'xlsx' para depuración.

    Returns:
        io.StringIO o io.BytesIO: Un stream del archivo CSV limpio listo para guardar o subir.
    """
    
    print(f"Iniciando limpieza de archivo: {archivo_entrada}")
    
    # --- PASO 1 y 2: Carga y selección de filas/columnas ---
    
    # El archivo original tiene 3 filas de encabezado que debemos ignorar.
    # El encabezado real está en la fila 3 (índice 2).
    
    # 1. Leer el archivo (asumiendo que puede ser Excel o el CSV resultante del Excel)
    if isinstance(archivo_entrada, str) and archivo_entrada.lower().endswith(('.xlsx', '.xlsm', '.xls')):
        # Si es un Excel, pandas lo lee directamente.
        df = pd.read_excel(archivo_entrada, header=2) 
    elif isinstance(archivo_entrada, io.BytesIO):
        # Si es un BytesIO, intentar primero como Excel
        try:
            archivo_entrada.seek(0)  # Asegurar que esté al inicio
            df = pd.read_excel(archivo_entrada, header=2, engine='openpyxl')
        except Exception:
            # Si no es Excel, intentar como CSV
            archivo_entrada.seek(0)
            df = pd.read_csv(archivo_entrada, header=2, encoding='latin1', 
                           sep=',', decimal='.', thousands=None, skipinitialspace=True)
    else:
        # Si es un CSV (o un stream), lo leemos. Usamos 'latin1' como encoding de lectura
        # por si el archivo CSV generado desde Excel tiene caracteres especiales.
        # Desactivamos el parser interno de comas/miles con thousands y decimal.
        try:
             df = pd.read_csv(archivo_entrada, header=2, encoding='latin1', 
                              sep=',', decimal='.', thousands=None, skipinitialspace=True)
        except Exception:
             # Fallback si el header no es 2 (e.g., si ya es el CSV limpio)
             df = pd.read_csv(archivo_entrada, encoding='latin1')
             
    # Verificamos si las columnas coinciden con el encabezado de 3 filas del Excel original
    # Las columnas del archivo Excel original son ambiguas y están divididas en 3 filas.
    # Necesitamos renombrar las columnas relevantes.

    # 2. Definir los nombres originales de las columnas que queremos mantener
    # Basado en la estructura del Excel original:
    # Fila 3 (header=2): Columna 0 (vacía), Columna 1 (Función), Columna 2 (Sueldo Bruto), ...
    # Los datos empiezan en la columna índice 1 (Función)
    
    # Convertir nombres de columnas a string para evitar problemas
    df.columns = [str(col).strip() for col in df.columns]
    
    # Renombrar usando los índices de columna (0-basado) del archivo después de saltar 2 filas
    # IMPORTANTE: La primera columna (índice 0) está vacía, los datos empiezan en índice 1
    
    if len(df.columns) < 16:
        raise ValueError(f"El archivo tiene menos columnas de las esperadas ({len(df.columns)}). Verifique el índice del encabezado.")
    
    column_mapping = {
        # Columna del Excel original -> Nombre de columna final deseado
        # La columna 0 está vacía, empezamos desde la columna 1 (Función)
        df.columns[1]: 'funcion',      # Columna B (índice 1)
        df.columns[2]: 'sueldo_bruto',  # Columna C (índice 2)
        df.columns[3]: 'descuentos',    # Columna D (índice 3)
        df.columns[4]: 'porc_descuento', # Columna E (índice 4)
        df.columns[5]: 'sueldo_no_remunerado', # Columna F (índice 5)
        df.columns[6]: 'neto_bolsillo_mensual', # Columna G (índice 6)
        df.columns[7]: 'cargas_sociales', # Columna H (índice 7)
        df.columns[8]: 'porc_cargas_sociales_sobre_sueldo_bruto', # Columna I (índice 8)
        df.columns[9]: 'costo_total_mensual', # Columna J (índice 9)
        df.columns[10]: 'costo_mensual_sin_seguros', # Columna K (índice 10)
        df.columns[11]: 'seguros_art_mas_vo',      # Columna L (índice 11)
        df.columns[12]: 'examen_medico', # Columna M (índice 12)
        df.columns[13]: 'indumentaria_y_epp',    # Columna N (índice 13)
        df.columns[14]: 'pernoctes_y_viajes',    # Columna O (índice 14)
        df.columns[15]: 'costo_total_mensual_apertura' # Columna P (índice 15)
    }
    
    # 3. Renombrar las columnas para estandarizar
    df.rename(columns=column_mapping, inplace=True)
    
    # --- PASO 3: Selección final de columnas ---
    # Seleccionamos SOLAMENTE las columnas que necesitamos, ignorando las otras.
    df_clean = df[COLUMNAS_FINALES].copy()
    
    # --- PASO 4: Limpieza de datos (Quitar '%' y convertir a float) ---
    
    # Las columnas porcentuales tienen el símbolo '%' en el CSV original que me enviaste.
    # 1. porc_descuento
    # 2. porc_cargas_sociales_sobre_sueldo_bruto

    for col_porc in ['porc_descuento', 'porc_cargas_sociales_sobre_sueldo_bruto']:
        if col_porc in df_clean.columns:
            # Convertir a string para poder aplicar str.replace
            df_clean[col_porc] = df_clean[col_porc].astype(str).str.replace('%', '', regex=False)
            
            # Reemplazar comas por puntos (si la configuración regional usa coma como decimal)
            df_clean[col_porc] = df_clean[col_porc].str.replace(',', '.', regex=False)
            
            # Convertir a float y dividir por 100 solo si el valor es > 1 (i.e., está en formato 17.00%)
            # Si el valor ya es 0.17, lo dejamos como está.
            try:
                # Intenta convertir a numérico. Los errores de coerción (como NaN o errores) se ignorarán con errors='coerce'
                df_clean[col_porc] = pd.to_numeric(df_clean[col_porc], errors='coerce')
                
                # Aplica la división por 100 solo a valores mayores que 1.
                df_clean[col_porc] = df_clean[col_porc].apply(lambda x: x / 100 if pd.notna(x) and x > 1 else x)
            except:
                print(f"Advertencia: No se pudo limpiar la columna {col_porc} completamente. Revisar datos.")
                
    # También nos aseguramos de que TODAS las columnas numéricas sean float
    cols_numericas = [c for c in COLUMNAS_FINALES if c != 'funcion']
    for col in cols_numericas:
        if col in df_clean.columns:
            # Convertir a string para procesar
            df_clean[col] = df_clean[col].astype(str)
            
            # Procesar cada valor: buscar coma y reemplazarla por punto
            # Si tiene coma, es un decimal con formato latino (ej: "123,45" o "1.234,56")
            # Si no tiene coma, puede ser entero o ya tiene punto decimal
            def convertir_decimal(valor):
                if pd.isna(valor) or valor == 'nan' or valor == '':
                    return None
                valor_str = str(valor).strip()
                # Si tiene coma, es un decimal con formato latino
                if ',' in valor_str:
                    # Si también tiene puntos, son separadores de miles (ej: "1.234,56")
                    if '.' in valor_str:
                        # Quitar puntos de miles, luego convertir coma a punto
                        valor_str = valor_str.replace('.', '').replace(',', '.')
                    else:
                        # Solo tiene coma, convertir a punto
                        valor_str = valor_str.replace(',', '.')
                # Si no tiene coma pero tiene punto, puede ser formato inglés (ej: "123.45")
                # o puede ser un entero sin decimales - en este caso, dejamos el valor como está
                # Convertir a numérico
                try:
                    return pd.to_numeric(valor_str, errors='coerce')
                except:
                    return None
            
            df_clean[col] = df_clean[col].apply(convertir_decimal)

    # Rellenar valores nulos (si los hay) con 0 para evitar errores de tipo en PostgreSQL
    df_clean[cols_numericas] = df_clean[cols_numericas].fillna(0)
    
    # Forzar la columna 'funcion' a ser string y limpiar espacios en blanco alrededor
    df_clean['funcion'] = df_clean['funcion'].astype(str).str.strip()

    # Eliminamos filas donde 'funcion' es vacío o NaN, ya que son filas resumen o vacías
    df_clean = df_clean[df_clean['funcion'].str.len() > 0].reset_index(drop=True)
    df_clean = df_clean[df_clean['funcion'].str.lower() != 'nan'].reset_index(drop=True)

    # --- PASO 5: Conversión a CSV limpio (para manejar LATIN1 y comillas) ---
    
    if formato_salida == 'csv':
        # Formatear valores numéricos para evitar .00 innecesarios
        # Si un valor es entero (sin decimales), escribirlo sin .0
        # Si tiene decimales, mantenerlos
        def formatear_valor(valor):
            if pd.isna(valor):
                return ''
            # Si es un número entero (sin parte decimal), devolver como entero
            if isinstance(valor, (int, float)):
                if valor == int(valor):
                    return str(int(valor))
                else:
                    # Si tiene decimales, mantenerlos pero sin ceros innecesarios
                    return str(valor).rstrip('0').rstrip('.')
            return str(valor)
        
        # Aplicar formato a columnas numéricas antes de escribir
        df_formateado = df_clean.copy()
        for col in cols_numericas:
            if col in df_formateado.columns:
                df_formateado[col] = df_formateado[col].apply(formatear_valor)
        
        # Usamos StringIO para manejar el archivo en memoria
        output_buffer = io.StringIO()
        
        # Escribir el CSV final con las opciones que funcionan en PostgreSQL
        df_formateado.to_csv(
            output_buffer, 
            sep=',',              # Delimitador: Coma (necesario para el COPY)
            index=False,          # No incluir el índice de pandas
            header=True,          # Incluir el encabezado (necesario para el COPY HEADER)
            encoding='latin1',    # Encoding: LATIN1 (para caracteres especiales y compatibilidad)
            quotechar='"',        # Usar comillas dobles para citar
            quoting=1             # QUOTING_MINIMAL: Cita campos con caracteres especiales (como comas o saltos de línea)
        )
        
        # Resetear el buffer a la posición inicial antes de devolverlo
        output_buffer.seek(0)
        return output_buffer
    
    else: # Si se pide Excel (solo para depuración o si el usuario quiere guardarlo como Excel)
        output_buffer = io.BytesIO()
        df_clean.to_excel(output_buffer, index=False)
        output_buffer.seek(0)
        return output_buffer

# Ejemplo de uso (solo se ejecuta si el script se corre directamente)
if __name__ == '__main__':
    # Nota: No puedo acceder al archivo real 'personal.xlsx', así que usa el nombre del CSV
    # que subiste, que contiene la estructura del Excel original para la prueba.
    
    # Simulación de carga del archivo original que subiste
    # Reemplaza 'personal.xlsx - Personal  .csv' con el path real de tu archivo de origen si lo ejecutas localmente.
    archivo_original = 'personal.xlsx - Personal  .csv' 
    
    try:
        # Generar el stream del CSV limpio
        csv_stream = limpiar_y_convertir_datos_personal(archivo_original, formato_salida='csv')
        
        # Guardar el resultado en un nuevo archivo (simulando la respuesta del backend)
        with open('personal_limpio_para_db.csv', 'w', encoding='latin1') as f:
            f.write(csv_stream.read())
            
        print("\n--- ÉXITO ---")
        print("El archivo 'personal_limpio_para_db.csv' ha sido creado.")
        print("Ahora puedes importarlo a PostgreSQL usando:")
        print("DELIMITER ',', ENCODING 'LATIN1', HEADER, QUOTE '\"'")

    except FileNotFoundError:
        print(f"ERROR: No se encontró el archivo {archivo_original}. Asegúrate de que la ruta es correcta.")
    except Exception as e:
        print(f"Ocurrió un error durante la limpieza: {e}")

