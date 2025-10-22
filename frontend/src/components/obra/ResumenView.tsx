import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, DollarSign, CheckCircle, Circle, Loader2 } from 'lucide-react';
import { useObraStore } from '@/store/obra';
import { 
  getPartidas, 
  getSubPartidas, 
  getCostosPartida, 
  getCostosSubPartida,
  getIncrementos 
} from '@/actions/obras';

interface ResumenViewProps {
  obra: any;
  onBack: () => void;
}

const ResumenView: React.FC<ResumenViewProps> = ({ obra, onBack }) => {
  const { setPartidas } = useObraStore();
  const [loading, setLoading] = useState(true);
  const [partidasConCostos, setPartidasConCostos] = useState<any[]>([]);
  const [incrementos, setIncrementos] = useState<any[]>([]);

  useEffect(() => {
    cargarDatos();
  }, [obra]);

  const cargarDatos = async () => {
    if (!obra) return;
    
    setLoading(true);
    try {
      // Cargar partidas
      const partidasData = await getPartidas(obra.id_obra);
      setPartidas(partidasData);

      // Cargar costos para cada partida
      const partidasConDatos = await Promise.all(
        partidasData.map(async (partida: any) => {
          let costo_total = 0;
          let subpartidasConCostos = [];

          if (partida.tiene_subpartidas) {
            // Cargar subpartidas y sus costos
            const subpartidas = await getSubPartidas(partida.id_partida);
            subpartidasConCostos = await Promise.all(
              subpartidas.map(async (subpartida: any) => {
                const costos = await getCostosSubPartida(subpartida.id_subpartida);
                const costoSubpartida = costos.reduce((sum: number, c: any) => sum + c.total_linea, 0);
                costo_total += costoSubpartida;
                
                return {
                  ...subpartida,
                  costos,
                  costo: costoSubpartida,
                  completa: costos.length > 0
                };
              })
            );
          } else {
            // Cargar costos directos de la partida
            const costos = await getCostosPartida(partida.id_partida);
            costo_total = costos.reduce((sum: number, c: any) => sum + c.total_linea, 0);
          }

          return {
            ...partida,
            subpartidas: subpartidasConCostos,
            costo_total,
            completa: costo_total > 0
          };
        })
      );

      setPartidasConCostos(partidasConDatos);

      // Cargar incrementos
      const incrementosData = await getIncrementos(obra.id_obra);
      setIncrementos(incrementosData);

    } catch (error) {
      console.error('Error cargando datos del resumen:', error);
    } finally {
      setLoading(false);
    }
  };

  const costo_total_obra = partidasConCostos.reduce((sum, p) => sum + p.costo_total, 0);
  const total_incrementos = incrementos.reduce((sum, i) => sum + i.monto_calculado, 0);
  const costo_total_con_incrementos = costo_total_obra + total_incrementos;
  const total_duracion_obra = partidasConCostos.reduce((sum, p) => sum + (p.duracion || 0), 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
            <span className="text-white">Cargando resumen...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Resumen de Costos</h1>
            <p className="text-slate-400">{obra.nombre_proyecto}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-green-500">
            ${costo_total_con_incrementos.toLocaleString()}
          </div>
          <div className="text-slate-400">Costo Total con Incrementos</div>
          <div className="text-sm text-slate-500 mt-1">
            Base: ${costo_total_obra.toLocaleString()} | Incrementos: ${total_incrementos.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{partidasConCostos.length}</div>
            <div className="text-slate-400 text-sm">Total Partidas</div>
          </div>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {partidasConCostos.reduce((sum, p) => sum + (p.subpartidas?.length || 0), 0)}
            </div>
            <div className="text-slate-400 text-sm">Total Subpartidas</div>
          </div>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{total_duracion_obra}</div>
            <div className="text-slate-400 text-sm">Duración Total</div>
          </div>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{incrementos.length}</div>
            <div className="text-slate-400 text-sm">Incrementos</div>
          </div>
        </Card>
      </div>

      {/* Resumen por Partidas */}
      <div className="space-y-4">
        {partidasConCostos.map((partida) => (
          <Card key={partida.id} className="bg-slate-800 border-slate-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {partida.completa ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-400" />
                  )}
                  <h3 className="text-lg font-semibold text-white">{partida.nombre}</h3>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-xl font-semibold text-white">
                      ${partida.costo_total.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400">Costo Total</div>
                  </div>
                  
                  <Button
                    size="sm"
                    className="bg-sky-600 hover:bg-sky-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Incremento
                  </Button>
                </div>
              </div>

              {/* SubPartidas */}
              {partida.subpartidas && partida.subpartidas.length > 0 && (
                <div className="ml-6 space-y-2">
                  {partida.subpartidas.map((subpartida: any) => (
                    <div
                      key={subpartida.id}
                      className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {subpartida.completa ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-400" />
                        )}
                        <span className="text-white">{subpartida.nombre}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-white font-medium">
                          ${subpartida.costo.toLocaleString()}
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-slate-600 hover:bg-slate-500 text-white border-slate-500"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Incremento
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Resumen Final */}
      <Card className="mt-6 bg-slate-800 border-slate-700">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-semibold text-white">Resumen Final</h2>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-green-500">
                ${costo_total_obra.toLocaleString()}
              </div>
              <div className="text-slate-400">Total de la Obra</div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <div className="text-2xl font-bold text-white">{partidasConCostos.length}</div>
              <div className="text-slate-400">Partidas</div>
            </div>
            
            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {partidasConCostos.reduce((sum, p) => sum + (p.subpartidas?.length || 0), 0)}
              </div>
              <div className="text-slate-400">SubPartidas</div>
            </div>
            
            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <div className="text-2xl font-bold text-green-500">
                {partidasConCostos.filter(p => p.completa).length}/{partidasConCostos.length}
              </div>
              <div className="text-slate-400">Completadas</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResumenView;
