import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Check, FileSpreadsheet, Loader2 } from 'lucide-react';
import { getTiposRecursos } from '@/actions/catalogos';

interface PlanillaSelectionProps {
  selectedItem: {
    type: 'partida' | 'subpartida';
    item: any;
    parent?: any;
  };
  selectedPlanillas: number[];
  onPlanillasChange: (planillas: number[]) => void;
  onContinue: (planillas: number[]) => void;
  onAddNewPlanilla?: () => void;
}

export const PlanillaSelection: React.FC<PlanillaSelectionProps> = ({
  selectedItem,
  selectedPlanillas,
  onPlanillasChange,
  onContinue,
  onAddNewPlanilla
}) => {
  const [tiposRecursos, setTiposRecursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handlePlanillaToggle = (planillaId: number) => {
    const newSelection = selectedPlanillas.includes(planillaId)
      ? selectedPlanillas.filter(id => id !== planillaId)
      : [...selectedPlanillas, planillaId];
    onPlanillasChange(newSelection);
  };

  const getItemDisplayName = () => {
    if (selectedItem.type === 'subpartida') {
      return selectedItem.item.descripcion_tarea;
    } else {
      return selectedItem.item.nombre_partida;
    }
  };

  const getItemCode = () => {
    if (selectedItem.type === 'subpartida') {
      return selectedItem.item.codigo;
    } else {
      return selectedItem.item.codigo;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Seleccionar Planillas</h3>
          <p className="text-slate-400">
            Elige las planillas de recursos para: <strong>{getItemDisplayName()}</strong>
          </p>
        </div>
      </div>

      {/* Información del Item */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Item Seleccionado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">
              {getItemCode() && `${getItemCode()} - `}{getItemDisplayName()}
            </h4>
            <div className="text-sm text-slate-400">
              {selectedItem.type === 'subpartida' && selectedItem.parent && (
                <span>Partida padre: {selectedItem.parent.nombre_partida} • </span>
              )}
              {selectedItem.item.especialidad && `Especialidad: ${selectedItem.item.especialidad} • `}
              {selectedItem.item.duracion > 0 && `Duración: ${selectedItem.item.duracion} • `}
              {selectedItem.type === 'partida' && selectedItem.item.tiene_subpartidas && (
                <span>Con subpartidas • </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Planillas en Grid */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            <div className="flex items-center justify-between">
              <h2>Planillas Disponibles</h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-400">
                  {selectedPlanillas.length} planilla{selectedPlanillas.length !== 1 ? 's' : ''} seleccionada{selectedPlanillas.length !== 1 ? 's' : ''}
                </div>
                <Button 
                  onClick={() => onAddNewPlanilla?.()}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Planilla
                </Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-sky-500 mr-2" />
              <span className="text-white">Cargando planillas...</span>
            </div>
          ) : tiposRecursos.length === 0 ? (
            <div className="text-center py-8">
              <FileSpreadsheet className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No hay planillas disponibles</p>
              <Button
                onClick={() => {/* TODO: Abrir modal para crear planilla */}}
                className="mt-2 bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Planilla
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {tiposRecursos.map((planilla) => {
                const isSelected = selectedPlanillas.includes(planilla.id_tipo_recurso);
                return (
                  <Button
                    key={planilla.id_tipo_recurso}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handlePlanillaToggle(planilla.id_tipo_recurso)}
                    className={`h-24 flex flex-col items-center justify-center relative ${
                      isSelected
                        ? 'bg-sky-500 border-sky-400 text-white'
                        : 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <FileSpreadsheet className="h-8 w-8 mb-2" />
                    <span className="text-sm text-center">{planilla.nombre}</span>
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      {selectedPlanillas.length > 0 && (
        <div className="flex justify-center">
          <Button 
            onClick={() => onContinue(selectedPlanillas)}
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            Continuar con {selectedPlanillas.length} Planilla{selectedPlanillas.length !== 1 ? 's' : ''}
            <Check className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};
