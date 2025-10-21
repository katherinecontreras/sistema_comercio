import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Check, X, FileSpreadsheet } from 'lucide-react';
import { useCatalogos } from '@/hooks';
import { AddPlanillaModal } from '@/components/modals';
import { ItemObra } from '@/store/obra';

interface PlanillaSelectionStepProps {
  selectedItem: ItemObra;
  selectedPlanillas: number[];
  onPlanillasChange: (planillas: number[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PlanillaSelectionStep: React.FC<PlanillaSelectionStepProps> = ({
  selectedItem,
  selectedPlanillas,
  onPlanillasChange,
  onNext,
  onBack
}) => {
  const { loadTypesOfRecursos } = useCatalogos();
  const [tiposRecursos, setTiposRecursos] = useState<Array<{id_tipo_recurso: number, nombre: string}>>([]);
  const [showAddPlanillaModal, setShowAddPlanillaModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadTypesOfRecursos();
        setTiposRecursos(data);
      } catch (error) {
        console.error('Error cargando tipos de recursos:', error);
      }
    };
    loadData();
  }, [loadTypesOfRecursos]);

  const handlePlanillaToggle = (planillaId: number) => {
    const newSelection = selectedPlanillas.includes(planillaId)
      ? selectedPlanillas.filter(id => id !== planillaId)
      : [...selectedPlanillas, planillaId];
    onPlanillasChange(newSelection);
  };

  const handleAddPlanilla = async (data: { nombre: string; icono: string }) => {
    // Esta función se manejará en el modal
    console.log('Nueva planilla:', data);
    setShowAddPlanillaModal(false);
  };

  const handleContinue = () => {
    if (selectedPlanillas.length > 0) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Seleccionar Planillas</h3>
          <p className="text-muted-foreground">
            Elige las planillas de recursos para el item: <strong>{selectedItem.codigo || selectedItem.descripcion_tarea}</strong>
          </p>
        </div>

      </div>

      {/* Información del Item */}
      <Card>
        <CardHeader>
          <CardTitle>Item Seleccionado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">
              {selectedItem.codigo && `${selectedItem.codigo} - `}{selectedItem.descripcion_tarea}
            </h4>
            <div className="text-sm text-slate-400">
              {selectedItem.especialidad && `Especialidad: ${selectedItem.especialidad} • `}
              {selectedItem.unidad && `Unidad: ${selectedItem.unidad} • `}
              {selectedItem.cantidad > 0 && `Cantidad: ${selectedItem.cantidad} • `}
              {selectedItem.precio_unitario > 0 && `Precio: $${selectedItem.precio_unitario}`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Planillas en Grid */}
      <Card>
        <CardHeader>
          <CardTitle>        
            <h2>Planillas Disponibles</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {selectedPlanillas.length} planilla{selectedPlanillas.length !== 1 ? 's' : ''} seleccionada{selectedPlanillas.length !== 1 ? 's' : ''}
              </div>
              <Button 
                onClick={() => setShowAddPlanillaModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Planilla
              </Button>
            </div>
        </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between">
        <Button 
          onClick={onBack}
          variant="outline"
          className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
        >
          <X className="h-4 w-4 mr-2" />
          Volver
        </Button>
        
        <Button 
          onClick={handleContinue}
          disabled={selectedPlanillas.length === 0}
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          Continuar con {selectedPlanillas.length} planilla{selectedPlanillas.length !== 1 ? 's' : ''}
          <Check className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Modal para agregar planilla */}
      <AddPlanillaModal
        open={showAddPlanillaModal}
        onClose={() => setShowAddPlanillaModal(false)}
        onAdd={handleAddPlanilla}
      />
    </div>
  );
};
