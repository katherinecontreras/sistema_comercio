import pandas as pd
import os

# Crear directorio si no existe
os.makedirs('excel_files', exist_ok=True)

# Datos para Válvulas
valvulas_data = {
    'descripcion': [
        'Válvula Esférica 2"', 'Válvula Esférica 3"', 'Válvula Esférica 4"', 'Válvula Mariposa 6"', 'Válvula Mariposa 8"',
        'Válvula Check 2"', 'Válvula Check 3"', 'Válvula Check 4"', 'Válvula Globo 1/2"', 'Válvula Globo 3/4"',
        'Válvula Globo 1"', 'Válvula Compuerta 2"', 'Válvula Compuerta 3"', 'Válvula Compuerta 4"', 'Válvula Reguladora 2"',
        'Válvula Reguladora 3"', 'Válvula Seguridad 1"', 'Válvula Seguridad 2"', 'Válvula Solenoide 1/2"', 'Válvula Solenoide 3/4"'
    ],
    'tipo': ['VALVULAS'] * 20,
    'unidad': ['un'] * 20,
    'costo': [150.50, 220.75, 350.00, 450.25, 680.50, 95.30, 145.80, 220.40, 85.60, 125.90,
              185.40, 320.75, 485.20, 720.80, 450.00, 680.50, 280.30, 420.60, 185.40, 250.80],
    'marca': ['Spirax Sarco', 'Spirax Sarco', 'Spirax Sarco', 'Keystone', 'Keystone',
              'Apollo', 'Apollo', 'Apollo', 'Swagelok', 'Swagelok',
              'Swagelok', 'Flowserve', 'Flowserve', 'Flowserve', 'Fisher',
              'Fisher', 'Leser', 'Leser', 'ASCO', 'ASCO'],
    'modelo': ['VG-2', 'VG-3', 'VG-4', 'BF-6', 'BF-8', 'CV-2', 'CV-3', 'CV-4', 'GV-05', 'GV-075',
               'GV-1', 'GV-2', 'GV-3', 'GV-4', 'PRV-2', 'PRV-3', 'SV-1', 'SV-2', 'EV-05', 'EV-075'],
    'diametro': ['2"', '3"', '4"', '6"', '8"', '2"', '3"', '4"', '1/2"', '3/4"',
                 '1"', '2"', '3"', '4"', '2"', '3"', '1"', '2"', '1/2"', '3/4"'],
    'presion': ['150 PSI'] * 20,
    'serie': [300, 300, 300, 150, 150, 125, 125, 125, 600, 600,
              600, 150, 150, 150, 600, 600, 600, 600, 150, 150],
    'material': ['SS316', 'SS316', 'SS316', 'CS', 'CS', 'SS304', 'SS304', 'SS304', 'SS316', 'SS316',
                 'SS316', 'CS', 'CS', 'CS', 'SS316', 'SS316', 'SS316', 'SS316', 'SS316', 'SS316']
}

# Datos para Instrumentos
instrumentos_data = {
    'descripcion': [
        'Transmisor Presión 0-10 bar', 'Transmisor Presión 0-25 bar', 'Transmisor Presión 0-100 bar',
        'Transmisor Temperatura RTD', 'Transmisor Temperatura TC', 'Transmisor Flujo Electromagnético 2"',
        'Transmisor Flujo Electromagnético 3"', 'Transmisor Flujo Electromagnético 4"', 'Transmisor Nivel Radar',
        'Transmisor Nivel Ultrasonido', 'Transmisor Nivel Capacitivo', 'Analizador pH',
        'Analizador Conductividad', 'Analizador Oxígeno Disuelto', 'Analizador Turbidez',
        'Switch Presión Alta', 'Switch Presión Baja', 'Switch Nivel Alto', 'Switch Nivel Bajo', 'Switch Temperatura Alta'
    ],
    'tipo': ['INSTRUMENTOS'] * 20,
    'unidad': ['un'] * 20,
    'costo': [450.50, 520.75, 680.00, 320.25, 285.60, 1250.80, 1580.40, 1950.60, 850.30, 420.75,
              380.50, 1250.00, 980.40, 1450.80, 1850.60, 85.30, 75.60, 95.40, 88.20, 125.80],
    'marca': ['Rosemount', 'Rosemount', 'Rosemount', 'Rosemount', 'Rosemount', 'Endress+Hauser', 'Endress+Hauser',
              'Endress+Hauser', 'Endress+Hauser', 'Endress+Hauser', 'Endress+Hauser', 'Endress+Hauser',
              'Endress+Hauser', 'Endress+Hauser', 'Endress+Hauser', 'Rosemount', 'Rosemount', 'Endress+Hauser',
              'Endress+Hauser', 'Rosemount'],
    'modelo': ['3051S', '3051S', '3051S', '3144P', '3144P', 'Promag 50', 'Promag 50', 'Promag 50', 'FMR240',
               'Prosonic S', 'Capacitrol', 'Liquisys M', 'Liquisys M', 'Liquisys M', 'Liquisys M',
               '2051', '2051', 'Levelflex', 'Levelflex', '3144P'],
    'rango': ['0-10 bar', '0-25 bar', '0-100 bar', '-200°C a 850°C', '-200°C a 1200°C', '0-10 m/s', '0-10 m/s',
              '0-10 m/s', '0-20 m', '0-15 m', '0-10 m', '0-14 pH', '0-2000 μS/cm', '0-20 mg/L', '0-4000 NTU',
              '0-100 bar', '0-100 bar', '0-20 m', '0-20 m', '-50°C a 400°C'],
    'precision': ['0.1%', '0.1%', '0.1%', '0.1°C', '0.1°C', '0.2%', '0.2%', '0.2%', '±3mm', '±5mm',
                  '±2mm', '±0.1 pH', '±1%', '±2%', '±2%', '±1%', '±1%', '±5mm', '±5mm', '±2°C'],
    'señal': ['4-20mA', '4-20mA', '4-20mA', '4-20mA', '4-20mA', '4-20mA', '4-20mA', '4-20mA', '4-20mA',
              '4-20mA', '4-20mA', '4-20mA', '4-20mA', '4-20mA', '4-20mA', 'SPDT', 'SPDT', 'SPDT', 'SPDT', 'SPDT'],
    'protocolo': ['HART', 'HART', 'HART', 'HART', 'HART', 'Profibus', 'Profibus', 'Profibus', 'Profibus',
                  'Profibus', 'Profibus', 'Profibus', 'Profibus', 'Profibus', 'Profibus', 'Contacto', 'Contacto',
                  'Contacto', 'Contacto', 'Contacto']
}

# Datos para Ingeniería
ingenieria_data = {
    'descripcion': [
        'Diseño P&ID', 'Diseño Isométricos', 'Diseño Layout Planta', 'Cálculo Estructural', 'Diseño Cimentaciones',
        'Análisis de Esfuerzos', 'Diseño Eléctrico', 'Cálculo de Cables', 'Diseño Instrumentación', 'Especificaciones Técnicas',
        'Procedimientos de Construcción', 'Manual de Operación', 'Manual de Mantenimiento', 'Estudio de Factibilidad',
        'Análisis de Riesgos', 'Diseño HVAC', 'Cálculo de Cargas Térmicas', 'Diseño de Drenajes', 'Estudio de Suelos', 'Inspección de Calidad'
    ],
    'tipo': ['INGENIERIA'] * 20,
    'unidad': ['planos', 'planos', 'planos', 'calculo', 'planos', 'analisis', 'planos', 'calculo', 'planos', 'doc',
               'doc', 'doc', 'doc', 'estudio', 'analisis', 'planos', 'calculo', 'planos', 'estudio', 'inspeccion'],
    'costo': [2500.00, 1800.50, 3200.75, 1500.00, 2200.40, 2800.60, 1950.30, 850.75, 1650.40, 1200.00,
              950.50, 1800.25, 1450.80, 3500.00, 2200.40, 1850.60, 1200.30, 1650.75, 2800.50, 850.25],
    'disciplina': ['Piping', 'Piping', 'Piping', 'Estructural', 'Estructural', 'Mecánica', 'Eléctrica', 'Eléctrica',
                   'Instrumentación', 'General', 'General', 'General', 'General', 'General', 'Seguridad', 'Clima',
                   'Clima', 'Civil', 'Geotecnia', 'Calidad'],
    'complejidad': ['Alta', 'Media', 'Alta', 'Alta', 'Media', 'Alta', 'Media', 'Baja', 'Media', 'Media',
                    'Baja', 'Media', 'Media', 'Alta', 'Alta', 'Media', 'Baja', 'Media', 'Alta', 'Media'],
    'horas_estimadas': [40, 25, 50, 30, 35, 45, 30, 15, 25, 20, 15, 30, 25, 60, 35, 25, 20, 30, 40, 15],
    'software': ['AutoCAD', 'AutoCAD', 'AutoCAD', 'STAAD Pro', 'STAAD Pro', 'ANSYS', 'ETAP', 'ETAP', 'INtools',
                 'Word', 'Word', 'Word', 'Word', 'Excel', 'Hazop', 'Carrier HAP', 'Carrier HAP', 'AutoCAD', 'Plaxis', 'Checklist'],
    'version': ['2024'] * 20,
    'estandar': ['ASME B31.3', 'ASME B31.3', 'API 650', 'AISC 360', 'ACI 318', 'ASME VIII', 'NEC 2023', 'NEC 2023',
                 'ISA 5.1', 'ISO 9001', 'ISO 9001', 'ISO 9001', 'ISO 9001', 'ISO 9001', 'ISO 31000', 'ASHRAE 90.1',
                 'ASHRAE 90.1', 'ASCE 7', 'ASCE 7', 'ISO 9001']
}

# Crear DataFrames
df_valvulas = pd.DataFrame(valvulas_data)
df_instrumentos = pd.DataFrame(instrumentos_data)
df_ingenieria = pd.DataFrame(ingenieria_data)

# Guardar como archivos Excel
df_valvulas.to_excel('excel_files/recursos_valvulas.xlsx', index=False)
df_instrumentos.to_excel('excel_files/recursos_instrumentos.xlsx', index=False)
df_ingenieria.to_excel('excel_files/recursos_ingenieria.xlsx', index=False)

print("Archivos Excel creados exitosamente:")
print("- excel_files/recursos_valvulas.xlsx")
print("- excel_files/recursos_instrumentos.xlsx")
print("- excel_files/recursos_ingenieria.xlsx")
