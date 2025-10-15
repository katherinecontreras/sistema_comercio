import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileSpreadsheet } from 'lucide-react';

const ExcelDownloader: React.FC = () => {
  const handleDownload = (filename: string) => {
    // Crear datos de ejemplo para cada tipo de recurso
    let csvData = '';
    
    if (filename === 'valvulas') {
      csvData = `descripcion,tipo,unidad,costo,marca,modelo,diametro,presion,serie,material
Válvula Esférica 2",VALVULAS,un,150.50,Spirax Sarco,VG-2,2",150 PSI,300,SS316
Válvula Esférica 3",VALVULAS,un,220.75,Spirax Sarco,VG-3,3",150 PSI,300,SS316
Válvula Esférica 4",VALVULAS,un,350.00,Spirax Sarco,VG-4,4",150 PSI,300,SS316
Válvula Mariposa 6",VALVULAS,un,450.25,Keystone,BF-6,6",150 PSI,150,CS
Válvula Mariposa 8",VALVULAS,un,680.50,Keystone,BF-8,8",150 PSI,150,CS
Válvula Check 2",VALVULAS,un,95.30,Apollo,CV-2,2",150 PSI,125,SS304
Válvula Check 3",VALVULAS,un,145.80,Apollo,CV-3,3",150 PSI,125,SS304
Válvula Check 4",VALVULAS,un,220.40,Apollo,CV-4,4",150 PSI,125,SS304
Válvula Globo 1/2",VALVULAS,un,85.60,Swagelok,GV-05,1/2",300 PSI,600,SS316
Válvula Globo 3/4",VALVULAS,un,125.90,Swagelok,GV-075,3/4",300 PSI,600,SS316
Válvula Globo 1",VALVULAS,un,185.40,Swagelok,GV-1,1",300 PSI,600,SS316
Válvula Compuerta 2",VALVULAS,un,320.75,Flowserve,GV-2,2",150 PSI,150,CS
Válvula Compuerta 3",VALVULAS,un,485.20,Flowserve,GV-3,3",150 PSI,150,CS
Válvula Compuerta 4",VALVULAS,un,720.80,Flowserve,GV-4,4",150 PSI,150,CS
Válvula Reguladora 2",VALVULAS,un,450.00,Fisher,PRV-2,2",300 PSI,600,SS316
Válvula Reguladora 3",VALVULAS,un,680.50,Fisher,PRV-3,3",300 PSI,600,SS316
Válvula Seguridad 1",VALVULAS,un,280.30,Leser,SV-1,1",300 PSI,600,SS316
Válvula Seguridad 2",VALVULAS,un,420.60,Leser,SV-2,2",300 PSI,600,SS316
Válvula Solenoide 1/2",VALVULAS,un,185.40,ASCO,EV-05,1/2",150 PSI,150,SS316
Válvula Solenoide 3/4",VALVULAS,un,250.80,ASCO,EV-075,3/4",150 PSI,150,SS316`;
    } else if (filename === 'instrumentos') {
      csvData = `descripcion,tipo,unidad,costo,marca,modelo,rango,precision,señal,protocolo
Transmisor Presión 0-10 bar,INSTRUMENTOS,un,450.50,Rosemount,3051S,0-10 bar,0.1%,4-20mA,HART
Transmisor Presión 0-25 bar,INSTRUMENTOS,un,520.75,Rosemount,3051S,0-25 bar,0.1%,4-20mA,HART
Transmisor Presión 0-100 bar,INSTRUMENTOS,un,680.00,Rosemount,3051S,0-100 bar,0.1%,4-20mA,HART
Transmisor Temperatura RTD,INSTRUMENTOS,un,320.25,Rosemount,3144P,-200°C a 850°C,0.1°C,4-20mA,HART
Transmisor Temperatura TC,INSTRUMENTOS,un,285.60,Rosemount,3144P,-200°C a 1200°C,0.1°C,4-20mA,HART
Transmisor Flujo Electromagnético 2",INSTRUMENTOS,un,1250.80,Endress+Hauser,Promag 50,0-10 m/s,0.2%,4-20mA,Profibus
Transmisor Flujo Electromagnético 3",INSTRUMENTOS,un,1580.40,Endress+Hauser,Promag 50,0-10 m/s,0.2%,4-20mA,Profibus
Transmisor Flujo Electromagnético 4",INSTRUMENTOS,un,1950.60,Endress+Hauser,Promag 50,0-10 m/s,0.2%,4-20mA,Profibus
Transmisor Nivel Radar,INSTRUMENTOS,un,850.30,Endress+Hauser,FMR240,0-20 m,±3mm,4-20mA,Profibus
Transmisor Nivel Ultrasonido,INSTRUMENTOS,un,420.75,Endress+Hauser,Prosonic S,0-15 m,±5mm,4-20mA,Profibus
Transmisor Nivel Capacitivo,INSTRUMENTOS,un,380.50,Endress+Hauser,Capacitrol,0-10 m,±2mm,4-20mA,Profibus
Analizador pH,INSTRUMENTOS,un,1250.00,Endress+Hauser,Liquisys M,0-14 pH,±0.1 pH,4-20mA,Profibus
Analizador Conductividad,INSTRUMENTOS,un,980.40,Endress+Hauser,Liquisys M,0-2000 μS/cm,±1%,4-20mA,Profibus
Analizador Oxígeno Disuelto,INSTRUMENTOS,un,1450.80,Endress+Hauser,Liquisys M,0-20 mg/L,±2%,4-20mA,Profibus
Analizador Turbidez,INSTRUMENTOS,un,1850.60,Endress+Hauser,Liquisys M,0-4000 NTU,±2%,4-20mA,Profibus
Switch Presión Alta,INSTRUMENTOS,un,85.30,Rosemount,2051,0-100 bar,±1%,SPDT,Contacto
Switch Presión Baja,INSTRUMENTOS,un,75.60,Rosemount,2051,0-100 bar,±1%,SPDT,Contacto
Switch Nivel Alto,INSTRUMENTOS,un,95.40,Endress+Hauser,Levelflex,0-20 m,±5mm,SPDT,Contacto
Switch Nivel Bajo,INSTRUMENTOS,un,88.20,Endress+Hauser,Levelflex,0-20 m,±5mm,SPDT,Contacto
Switch Temperatura Alta,INSTRUMENTOS,un,125.80,Rosemount,3144P,-50°C a 400°C,±2°C,SPDT,Contacto`;
    } else if (filename === 'ingenieria') {
      csvData = `descripcion,tipo,unidad,costo,disciplina,complejidad,horas_estimadas,software,version,estandar
Diseño P&ID,INGENIERIA,planos,2500.00,Piping,Alta,40,AutoCAD,2024,ASME B31.3
Diseño Isométricos,INGENIERIA,planos,1800.50,Piping,Media,25,AutoCAD,2024,ASME B31.3
Diseño Layout Planta,INGENIERIA,planos,3200.75,Piping,Alta,50,AutoCAD,2024,API 650
Cálculo Estructural,INGENIERIA,calculo,1500.00,Estructural,Alta,30,STAAD Pro,2024,AISC 360
Diseño Cimentaciones,INGENIERIA,planos,2200.40,Estructural,Media,35,STAAD Pro,2024,ACI 318
Análisis de Esfuerzos,INGENIERIA,analisis,2800.60,Mecánica,Alta,45,ANSYS,2024,ASME VIII
Diseño Eléctrico,INGENIERIA,planos,1950.30,Eléctrica,Media,30,ETAP,2024,NEC 2023
Cálculo de Cables,INGENIERIA,calculo,850.75,Eléctrica,Baja,15,ETAP,2024,NEC 2023
Diseño Instrumentación,INGENIERIA,planos,1650.40,Instrumentación,Media,25,INtools,2024,ISA 5.1
Especificaciones Técnicas,INGENIERIA,doc,1200.00,General,Media,20,Word,2024,ISO 9001
Procedimientos de Construcción,INGENIERIA,doc,950.50,General,Baja,15,Word,2024,ISO 9001
Manual de Operación,INGENIERIA,doc,1800.25,General,Media,30,Word,2024,ISO 9001
Manual de Mantenimiento,INGENIERIA,doc,1450.80,General,Media,25,Word,2024,ISO 9001
Estudio de Factibilidad,INGENIERIA,estudio,3500.00,General,Alta,60,Excel,2024,ISO 9001
Análisis de Riesgos,INGENIERIA,analisis,2200.40,Seguridad,Alta,35,Hazop,2024,ISO 31000
Diseño HVAC,INGENIERIA,planos,1850.60,Clima,Media,25,Carrier HAP,2024,ASHRAE 90.1
Cálculo de Cargas Térmicas,INGENIERIA,calculo,1200.30,Clima,Baja,20,Carrier HAP,2024,ASHRAE 90.1
Diseño de Drenajes,INGENIERIA,planos,1650.75,Civil,Media,30,AutoCAD,2024,ASCE 7
Estudio de Suelos,INGENIERIA,estudio,2800.50,Geotecnia,Alta,40,Plaxis,2024,ASCE 7
Inspección de Calidad,INGENIERIA,inspeccion,850.25,Calidad,Media,15,Checklist,2024,ISO 9001`;
    }

    // Crear y descargar archivo
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `recursos_${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Archivos de Ejemplo para Carga Masiva
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Válvulas</h4>
            <p className="text-sm text-gray-600">20 recursos de válvulas con atributos técnicos</p>
            <Button 
              onClick={() => handleDownload('valvulas')}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar CSV
            </Button>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Instrumentos</h4>
            <p className="text-sm text-gray-600">20 recursos de instrumentación con especificaciones</p>
            <Button 
              onClick={() => handleDownload('instrumentos')}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar CSV
            </Button>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Ingeniería</h4>
            <p className="text-sm text-gray-600">20 servicios de ingeniería con disciplinas</p>
            <Button 
              onClick={() => handleDownload('ingenieria')}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar CSV
            </Button>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Instrucciones:</strong> Descarga los archivos CSV, ábrelos en Excel, 
            guárdalos como .xlsx y luego úsalos para probar la carga masiva de recursos.
            Las columnas adicionales se guardarán automáticamente en el campo "atributos".
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExcelDownloader;
