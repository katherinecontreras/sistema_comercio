import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, FileSpreadsheet, Loader2 } from 'lucide-react';
import { getTiposRecursos } from '@/actions/catalogos';
import PartidaForm from './PartidaForm';
import CostoForm from './CostoForm';

interface ObraContentProps {
  selectedPartida: number | null;
  selectedSubPartida: number | null;
  selectedPlanilla: number | null;
  onSelectPlanilla: (id: number | null) => void;
}

const ObraContent: React.FC<ObraContentProps> = ({
  selectedPartida,
  selectedSubPartida,
  selectedPlanilla,
  onSelectPlanilla
}) => {
  const [tiposRecursos, setTiposRecursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPartidaForm, setShowPartidaForm] = useState(false);
  const [showCostoForm, setShowCostoForm] = useState(false);
  const [editingPartida, setEditingPartida] = useState<any>(null);
  const [editingCosto, setEditingCosto] = useState<any>(null);

  useEffect(() => {
    cargarTiposRecursos();
  }, []);

  const cargarTiposRecursos = async () => {
    setLoading(true);
    try {
      const tipos = await getTiposRecursos();
      setTiposRecursos(tipos);
    } catch (error) {
      console.error('Error cargando tipos de recursos:', error);
    } finally {
      setLoading(false);
    }
  };
  if (!selectedPartida && !selectedSubPartida) {
    return (
      <div className="p-6">
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-6 text-center">
            <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Selecciona una Partida o SubPartida
            </h3>
            <p className="text-slate-400">
              Elige una partida del sidebar para comenzar a gestionar sus recursos
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (selectedPartida || selectedSubPartida) {
    return (
      <div className="p-6">
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {selectedSubPartida ? 'SubPartida Seleccionada' : 'Partida Seleccionada'}
                </h2>
                <p className="text-slate-400">
                  {selectedSubPartida ? 'Gestiona los recursos de esta subpartida' : 'Gestiona los recursos de esta partida'}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setEditingPartida(null);
                    setShowPartidaForm(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Partida
                </Button>
                
                <Button
                  onClick={() => {
                    setEditingCosto(null);
                    setShowCostoForm(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Costo
                </Button>
                
                <Button
                  onClick={() => onSelectPlanilla(null)}
                  className="bg-sky-600 hover:bg-sky-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Planilla
                </Button>
              </div>
            </div>

            {/* Lista de Planillas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-sky-500 mr-2" />
                  <span className="text-white">Cargando planillas...</span>
                </div>
              ) : tiposRecursos.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No hay planillas disponibles</p>
                  <Button
                    onClick={() => {/* TODO: Abrir modal para crear planilla */}}
                    className="mt-2 bg-sky-600 hover:bg-sky-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Planilla
                  </Button>
                </div>
              ) : (
                tiposRecursos.map((planilla) => (
                  <Card
                    key={planilla.id_tipo_recurso}
                    className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                      selectedPlanilla === planilla.id_tipo_recurso 
                        ? 'bg-sky-600 border-sky-500' 
                        : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                    }`}
                    onClick={() => onSelectPlanilla(planilla.id_tipo_recurso)}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">📋</div>
                      <h3 className="text-white font-medium">{planilla.nombre}</h3>
                      <p className="text-slate-400 text-sm">Seleccionar planilla</p>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Si hay una planilla seleccionada, mostrar gestión de recursos */}
            {selectedPlanilla && (
              <div className="mt-6">
                <Card className="bg-slate-700 border-slate-600">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Gestión de Recursos - Planilla {selectedPlanilla}
                    </h3>
                    
                    <div className="flex gap-3 mb-4">
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Cargar Manual
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Generar Excel
                      </Button>
                      <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Cargar Excel
                      </Button>
                    </div>

                    <div className="text-slate-400 text-sm">
                      Aquí se mostrarán los recursos de la planilla seleccionada
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Modales */}
      {showPartidaForm && (
        <PartidaForm
          onClose={() => {
            setShowPartidaForm(false);
            setEditingPartida(null);
          }}
          partida={editingPartida}
        />
      )}
      
      {showCostoForm && (
        <CostoForm
          onClose={() => {
            setShowCostoForm(false);
            setEditingCosto(null);
          }}
          costo={editingCosto}
          idPartida={selectedPartida}
          idSubPartida={selectedSubPartida}
        />
      )}
    </>
  );
};

export default ObraContent;
