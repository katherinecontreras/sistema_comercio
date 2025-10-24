import React, {useState} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, FileText, Clock, Package, Eye, TrendingUp } from 'lucide-react';
import { useObraStore } from '@/store/obra';
import { AddIncrementModal } from '../modals';

interface ResumenViewProps {
  onShowIncrementos?: () => void;
}

const ResumenView: React.FC<ResumenViewProps> = ({ onShowIncrementos }) => {
  const { obra, partidas, incrementos, resumen, addIncremento, updateIncremento, calcularTotalesObra } = useObraStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIncrement, setEditingIncrement] = useState<any>(null);

  const handleAddIncrement = (incrementData: any) => {
    addIncremento(incrementData);
    setShowAddModal(false);
  };

  const handleUpdateIncrement = (incrementData: any) => {
    updateIncremento(editingIncrement.id_incremento, incrementData);
    setEditingIncrement(null);
    setShowAddModal(false);
  };

  // Usar los datos del resumen calculado automáticamente
  const totales = resumen;

  if (!obra) {
    return (
      <div className="p-6">
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-6 text-center">
            <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No hay obra seleccionada
            </h3>
            <p className="text-slate-400">
              Crea una nueva obra para comenzar
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header con botones de incrementos */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{obra.nombre_proyecto}</h1>
          <p className="text-slate-400">Resumen de la obra</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Incremento
          </Button>
          <Button
            onClick={onShowIncrementos}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Incrementos
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-slate-400 text-sm">Partidas</p>
                      <p className="text-white text-xl font-semibold">{totales.cantidad_partidas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-slate-400 text-sm">SubPartidas</p>
                      <p className="text-white text-xl font-semibold">{totales.cantidad_subpartidas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-slate-400 text-sm">Incrementos</p>
                <p className="text-white text-xl font-semibold">{totales.totalIncrementos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-slate-400 text-sm">Planillas</p>
                <p className="text-white text-xl font-semibold">{totales.cantidad_planillas_total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tarjetas de incrementos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-red-400" />
              <div>
                <p className="text-slate-400 text-sm">Total Incrementos</p>
                <p className="text-white text-xl font-semibold">{totales.cantidad_incrementos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-slate-400 text-sm">Incrementos Partidas</p>
                <p className="text-white text-xl font-semibold">{totales.cantidad_incrementos_por_partida}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-slate-400 text-sm">Incrementos SubPartidas</p>
                <p className="text-white text-xl font-semibold">{totales.cantidad_incrementos_por_subpartida}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-slate-400 text-sm">Incrementos Oferta</p>
                <p className="text-white text-xl font-semibold">{totales.cantidad_incrementos_por_oferta}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tarjetas de recursos y planillas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-cyan-400" />
              <div>
                <p className="text-slate-400 text-sm">Recursos por Planilla</p>
                <p className="text-white text-xl font-semibold">{totales.cantidad_recursos_por_planilla}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-indigo-400" />
              <div>
                <p className="text-slate-400 text-sm">Recursos por Partida</p>
                <p className="text-white text-xl font-semibold">{totales.cantidad_recursos_por_partida}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-pink-400" />
              <div>
                <p className="text-slate-400 text-sm">Recursos por SubPartida</p>
                <p className="text-white text-xl font-semibold">{totales.cantidad_recursos_por_subpartida}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-teal-400" />
              <div>
                <p className="text-slate-400 text-sm">Total Recursos</p>
                <p className="text-white text-xl font-semibold">{totales.total_recursos_por_planilla}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tarjetas de costos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-slate-400 text-sm">Costo Base</p>
                <p className="text-white text-xl font-semibold">
                  ${totales.costo_total_oferta_sin_incremento.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-slate-400 text-sm">Total Incrementos</p>
                <p className="text-white text-xl font-semibold">
                  ${totales.costo_total_incrementos.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-slate-400 text-sm">Costo Total</p>
                <p className="text-white text-xl font-semibold">
                  ${totales.costo_total_oferta_con_incremento.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Duración total */}
      <Card className="bg-slate-800 border-slate-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Duración Total de la Obra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {totales.total_duracion_oferta.años > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{totales.total_duracion_oferta.años}</p>
                <p className="text-slate-400 text-sm">Años</p>
              </div>
            )}
            {totales.total_duracion_oferta.meses > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{totales.total_duracion_oferta.meses}</p>
                <p className="text-slate-400 text-sm">Meses</p>
              </div>
            )}
            {totales.total_duracion_oferta.dias > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{totales.total_duracion_oferta.dias}</p>
                <p className="text-slate-400 text-sm">Días</p>
              </div>
            )}
            {totales.total_duracion_oferta.horas > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{totales.total_duracion_oferta.horas}</p>
                <p className="text-slate-400 text-sm">Horas</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de partidas */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Partidas de la Obra</CardTitle>
        </CardHeader>
        <CardContent>
          {partidas.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No hay partidas</h3>
              <p className="text-slate-400">
                Agrega partidas para comenzar a estructurar tu obra
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {partidas.map((partida) => (
                <div key={partida.id_partida} className="border border-slate-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-white">{partida.nombre_partida}</h4>
                    <div className="flex items-center gap-2">
                      {partida.tiene_subpartidas ? (
                        <span className="px-2 py-1 bg-purple-900 text-purple-300 rounded text-xs">
                          {partida.subpartidas?.length || 0} SubPartidas
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs">
                          Partida Directa
                        </span>
                      )}
                      <span className="px-2 py-1 bg-green-900 text-green-300 rounded text-xs">
                        {partida.planillas?.length || 0} Planillas
                      </span>
                    </div>
                  </div>
                  
                  {partida.descripcion && (
                    <p className="text-slate-300 text-sm mb-2">{partida.descripcion}</p>
                  )}
                  
                  {partida.tiene_subpartidas && partida.subpartidas && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-slate-300 mb-2">SubPartidas:</h5>
                      <div className="space-y-2">
                        {partida.subpartidas.map((subpartida: any) => (
                          <div key={subpartida.id_subpartida} className="bg-slate-700 rounded p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-white">{subpartida.descripcion_tarea}</p>
                              <span className="px-2 py-1 bg-green-900 text-green-300 rounded text-xs">
                                {subpartida.planillas?.length || 0} Planillas
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Modal para agregar/editar incremento */}
      <AddIncrementModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingIncrement(null);
        }}
        onSave={editingIncrement ? handleUpdateIncrement : handleAddIncrement}
      />
    </div>
  );
};

export default ResumenView;