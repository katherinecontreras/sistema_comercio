import pandas as pd
import io

# --- Configuración ---
# Nombres de las columnas que queremos en el archivo final, en el orden exacto.
COLUMNAS_FINALES_EQUIPOS = [
    'detalle',
    'Amortizacion',
    'Seguro',
    'Patente',
    'Transporte',
    'Fee_alquiler',
    'Combustible',
    'Lubricantes',
    'Neumaticos',
    'Mantenim',
    'Operador',
    'Total_mes'
]


def limpiar_y_convertir_datos_equipos(archivo_entrada, formato_salida='csv'):
    """
    Procesa un archivo de Excel o CSV (con formato de Excel original)
    para limpiarlo y generar un CSV listo para importar a PostgreSQL.

    Pasos de limpieza aplicados:
    1. Omitir las primeras filas de encabezado basura (ajustado a header=3).
    2. Establecer los nombres de las columnas que nos interesan (ajustando índices).
    3. Limpiar datos numéricos (convertir separadores de miles y decimales).
    4. Generar CSV con delimitador de coma y encoding LATIN1.

    Args:
        archivo_entrada (str o io.BytesIO): Ruta o stream del archivo de entrada (.xlsx o .csv).
        formato_salida (str): 'csv' (predeterminado) o 'xlsx' para depuración.

    Returns:
        io.StringIO o io.BytesIO: Un stream del archivo CSV limpio listo para guardar o subir.
    """
    
    print("Iniciando limpieza de archivo de equipos.")
    
    # --- PASO 1 y 2: Carga y selección de filas/columnas ---
    
    # Se ajusta header=3 para que la fila de encabezado sea 'Detalle de equipo', 'Amortizacion', etc.
    HEADER_ROW_INDEX = 3 # Fila de índice 3 (la cuarta fila) contiene el encabezado
    
    if isinstance(archivo_entrada, str) and archivo_entrada.lower().endswith(('.xlsx', '.xlsm', '.xls')):
        # Leer Excel, saltando las filas iniciales.
        df = pd.read_excel(archivo_entrada, header=HEADER_ROW_INDEX) 
    elif isinstance(archivo_entrada, io.BytesIO):
        # Si es un BytesIO, intentar primero como Excel
        try:
            archivo_entrada.seek(0)  # Asegurar que esté al inicio
            df = pd.read_excel(archivo_entrada, header=HEADER_ROW_INDEX, engine='openpyxl')
        except Exception:
            # Si no es Excel, intentar como CSV
            archivo_entrada.seek(0)
            df = pd.read_csv(archivo_entrada, header=HEADER_ROW_INDEX, encoding='latin1', skipinitialspace=True)
    else:
        # Leer CSV.
        df = pd.read_csv(archivo_entrada, header=HEADER_ROW_INDEX, encoding='latin1', skipinitialspace=True)
            
    
    # El encabezado original en el archivo (después de header=3) tiene esta estructura:
    # Columna Pandas 0: (Columna vacía o con valor '217.5' que debemos ignorar o usar para detalle)
    # Columna Pandas 1: Detalle de equipo
    # Columna Pandas 2: Amortizacion
    # ...
    
    # Aseguramos que tengamos suficientes columnas para el mapeo
    if len(df.columns) < 12:
        # Si el header es 3, Pandas podría haber absorbido una columna de índice
        # Si no funciona, dejamos el código fallar aquí para inspección, o ajustamos el header.
        raise ValueError(f"El archivo tiene menos columnas de las esperadas ({len(df.columns)}). Verifique el índice del encabezado.")

    
    # Convertir nombres de columnas a string y limpiar espacios
    df.columns = [str(col).strip() for col in df.columns]
    
    # *** CORRECCIÓN CRÍTICA: Ajustamos el índice del mapeo. ***
    # Asumimos que la columna 'Detalle de equipo' es la columna de índice 1 de Pandas.
    # Si la primera columna de Pandas (índice 0) es irrelevante, la saltamos.
    
    # Buscamos el índice de la columna que contiene "Detalle de equipo" para empezar el mapeo
    # Esto hace el mapeo más robusto si hay columnas irrelevantes al inicio.
    
    try:
        # En el archivo subido, el 'Detalle de equipo' real es la columna de índice 1 (Columna B)
        # Ajustamos el mapeo para empezar en la posición correcta (posicionamiento relativo)
        
        # En este caso, el encabezado después de header=3 parece ser:
        # df.columns[0] = '' (vacío)
        # df.columns[1] = 'Detalle de equipo'
        
        # Mapeo posicional (asumiendo que hay una columna extra antes de Detalle)
        # Esto asume que la columna 'Detalle' está en el índice 1, no el 0.
        
        # Los nombres originales de las columnas después de la lectura con header=3:
        # Columna [0]: NaN o un número ('217.5')
        # Columna [1]: 'Detalle de equipo'
        # Columna [2]: 'Amortizacion'
        # ...
        
        # Determinamos el índice de inicio
        start_index = 1 # Empezamos en la Columna 'Detalle de equipo' (índice 1 de Pandas)
        
        column_mapping = {
            df.columns[start_index]: 'detalle',
            df.columns[start_index + 1]: 'Amortizacion',
            df.columns[start_index + 2]: 'Seguro',
            df.columns[start_index + 3]: 'Patente',
            df.columns[start_index + 4]: 'Transporte',
            df.columns[start_index + 5]: 'Fee alquiler',
            df.columns[start_index + 6]: 'Combustible',
            df.columns[start_index + 7]: 'Lubricantes',
            df.columns[start_index + 8]: 'Neumaticos',
            df.columns[start_index + 9]: 'Mantenim.', # Atención al punto aquí
            df.columns[start_index + 10]: 'Operador',
            df.columns[start_index + 11]: 'Total /mes' # Atención al espacio y barra aquí
        }

    except IndexError:
        # Si el número de columnas después de 'start_index' no es suficiente, ajustamos el mapeo a 
        # empezar en el índice 0, asumiendo que la columna irrelevante ha desaparecido.
        start_index = 0
        column_mapping = {
            df.columns[start_index]: 'detalle',
            df.columns[start_index + 1]: 'Amortizacion',
            df.columns[start_index + 2]: 'Seguro',
            df.columns[start_index + 3]: 'Patente',
            df.columns[start_index + 4]: 'Transporte',
            df.columns[start_index + 5]: 'Fee alquiler',
            df.columns[start_index + 6]: 'Combustible',
            df.columns[start_index + 7]: 'Lubricantes',
            df.columns[start_index + 8]: 'Neumaticos',
            df.columns[start_index + 9]: 'Mantenim.', 
            df.columns[start_index + 10]: 'Operador',
            df.columns[start_index + 11]: 'Total /mes'
        }
        
        
    # 3. Renombrar las columnas para estandarizar
    df.rename(columns=column_mapping, inplace=True)
    
    # 4. Corregir nombres de columnas para que coincidan con COLUMNAS_FINALES_EQUIPOS
    df.rename(columns={
        'Fee alquiler': 'Fee_alquiler',
        'Mantenim.': 'Mantenim',
        'Total /mes': 'Total_mes',
        'Detalle de equipo': 'detalle' # Por si el mapeo inicial falla y queda el nombre original
    }, inplace=True)
    
    # Desduplicar posibles columnas repetidas después del renombrado
    df = df.loc[:, ~df.columns.duplicated(keep='first')]

    # --- PASO 3: Selección final de columnas ---
    # Usamos reindex para asegurar el orden y llenar con NaN/0 si falta alguna columna
    df_clean = df.reindex(columns=COLUMNAS_FINALES_EQUIPOS)
    
    # --- PASO 4: Limpieza de datos (Convertir a float y manejar separadores) ---
    
    cols_numericas = [c for c in COLUMNAS_FINALES_EQUIPOS if c != 'detalle']
    
    for col in cols_numericas:
        if col in df_clean.columns:
            # Seleccionamos solo la serie (asegurando no tener un DataFrame con una sola columna)
            series = df_clean[col]
            
            # Función para convertir valores con coma decimal a punto decimal
            def convertir_decimal(valor):
                if pd.isna(valor) or valor == 'nan' or valor == '':
                    return 0.0
                valor_str = str(valor).strip()
                
                # Si tiene coma, es un decimal con formato latino (ej: "123,45")
                if ',' in valor_str:
                    # Si también tiene puntos, son separadores de miles (ej: "1.234,56")
                    if '.' in valor_str:
                        # Quitar puntos de miles, luego convertir coma a punto
                        valor_str = valor_str.replace('.', '').replace(',', '.')
                    else:
                        # Solo tiene coma, convertir a punto
                        valor_str = valor_str.replace(',', '.')
                # Si no tiene coma pero tiene punto, puede ser formato inglés (ej: "123.45")
                # o puede ser un entero sin decimales
                # En este caso, dejamos el valor como está
                
                # Convertir a numérico
                try:
                    return pd.to_numeric(valor_str, errors='coerce')
                except:
                    return 0.0
            
            # Aplicar la conversión
            series = series.apply(convertir_decimal)
            # Rellenar NaN con 0
            series = series.fillna(0.0)

            df_clean[col] = series

    # Forzar la columna 'detalle' a ser string y limpiar espacios en blanco alrededor
    df_clean['detalle'] = df_clean['detalle'].astype(str).str.strip()

    # Eliminamos filas donde 'detalle' es vacío o NaN, ya que son filas resumen o vacías
    df_clean = df_clean[df_clean['detalle'].str.len() > 0].reset_index(drop=True)

    # --- PASO 5: Conversión a CSV limpio ---
    
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
        
        output_buffer = io.StringIO()
        
        # Escribir el CSV final con las opciones que funcionan en PostgreSQL
        df_formateado.to_csv(
            output_buffer, 
            sep=',',              # Delimitador: Coma
            index=False,          # No incluir el índice de pandas
            header=True,          # Incluir el encabezado 
            encoding='latin1',    # Encoding: LATIN1
            quotechar='"',        # Usar comillas dobles para citar
            quoting=1             # QUOTING_MINIMAL: Cita campos con comas internas
        )
        
        output_buffer.seek(0)
        return output_buffer
    
    else: # Salida Excel
        output_buffer = io.BytesIO()
        df_clean.to_excel(output_buffer, index=False)
        output_buffer.seek(0)
        return output_buffer

# Ejemplo de uso (solo se ejecuta si el script se corre directamente)
if __name__ == '__main__':
    # Usar el nombre del CSV subido para la prueba.
    archivo_original = 'equipos.xlsx - Movil y Equipos .csv' 
    
    try:
        csv_stream = limpiar_y_convertir_datos_equipos(archivo_original, formato_salida='csv')
        
        with open('equipos_limpio_para_db.csv', 'w', encoding='latin1') as f:
            f.write(csv_stream.read())
            
        print("\n--- ÉXITO ---")
        print("El archivo 'equipos_limpio_para_db.csv' ha sido creado y debería tener la estructura correcta.")

    except FileNotFoundError:
        print(f"ERROR: No se encontró el archivo {archivo_original}. Asegúrate de que la ruta es correcta.")
    except Exception as e:
        print(f"Ocurrió un error durante la limpieza: {e}")
