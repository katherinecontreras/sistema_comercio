import React, { useState, useEffect } from 'react';
import { ItemObra } from '@/store/obra';
import { ItemSelectionStep } from './ItemSelectionStep';
import { PlanillaSelectionStep } from './PlanillaSelectionStep';
import { PlanillaNavigationStep } from './PlanillaNavigationStep';
import { ResumenFinalStep } from './ResumenFinalStep';
import { useCatalogos } from '@/hooks';
import { useAppStore } from '@/store/app';

type CostosSubStep = 'item-selection' | 'planilla-selection' | 'planilla-navigation' | 'resumen';

const CostosStepNew: React.FC = () => {
  const { loadTypesOfRecursos } = useCatalogos();
  const { wizard } = useAppStore();
  const [currentSubStep, setCurrentSubStep] = useState<CostosSubStep>('item-selection');
  const [selectedItem, setSelectedItem] = useState<ItemObra | null>(null);
  const [selectedPlanillas, setSelectedPlanillas] = useState<number[]>([]);
  const [planillaData, setPlanillaData] = useState<Array<{id: number, nombre: string}>>([]);
  const [tiposRecursos, setTiposRecursos] = useState<any[]>([]);

  // Cargar tipos de recursos al inicio
  useEffect(() => {
    const cargarTipos = async () => {
      try {
        const tipos = await loadTypesOfRecursos();
        setTiposRecursos(tipos);
      } catch (error) {
        console.error('Error cargando tipos de recursos:', error);
      }
    };
    cargarTipos();
  }, [loadTypesOfRecursos]);

  const handleItemSelected = (item: ItemObra) => {
    setSelectedItem(item);
    setCurrentSubStep('planilla-selection');
  };

  const handlePlanillasChange = (planillas: number[]) => {
    setSelectedPlanillas(planillas);
    // Cargar los datos de las planillas desde los tipos de recursos
    const planillasData = planillas.map(id => {
      const tipo = tiposRecursos.find(t => t.id_tipo_recurso === id);
      return {
        id,
        nombre: tipo?.nombre || `Planilla ${id}`
      };
    });
    setPlanillaData(planillasData);
  };

  const handlePlanillaSelect = (planillaId: number) => {
    // Aquí se manejaría la selección de una planilla específica
    console.log('Planilla seleccionada:', planillaId);
  };

  const handlePlanillaDelete = (planillaId: number) => {
    const newPlanillas = selectedPlanillas.filter(id => id !== planillaId);
    setSelectedPlanillas(newPlanillas);
    setPlanillaData(planillaData.filter(p => p.id !== planillaId));
  };

  const handleBack = () => {
    switch (currentSubStep) {
      case 'planilla-selection':
        setCurrentSubStep('item-selection');
        setSelectedItem(null);
        break;
      case 'planilla-navigation':
        setCurrentSubStep('planilla-selection');
        break;
    }
  };

  const handleNext = () => {
    switch (currentSubStep) {
      case 'planilla-selection':
        setCurrentSubStep('planilla-navigation');
        break;
      case 'planilla-navigation':
        setCurrentSubStep('resumen');
        break;
      case 'resumen':
        // Aquí se finalizaría el proceso y volvería al paso 1 para otro item
        console.log('Proceso completado');
        setCurrentSubStep('item-selection');
        setSelectedItem(null);
        setSelectedPlanillas([]);
        break;
    }
  };

  const handleResumenBack = () => {
    setCurrentSubStep('planilla-navigation');
  };

  const handleResumenFinish = () => {
    // Verificar si hay items sin completar
    const itemsWithCostos = wizard.items.filter(item => 
      wizard.costos.some(costo => costo.id_item_obra === item.id)
    );
    
    if (itemsWithCostos.length < wizard.items.length) {
      // Hay items sin completar, volver al paso 1
      setCurrentSubStep('item-selection');
      setSelectedItem(null);
      setSelectedPlanillas([]);
    } else {
      // Todos los items están completos, continuar al siguiente paso
      console.log('Todos los items completados, continuando al siguiente paso');
      // Aquí se podría llamar a una función para continuar al siguiente paso del wizard
    }
  };

  return (
    <div className="space-y-6">
      {/* Indicador de sub-pasos - Navegación libre */}
      <div className="flex items-center justify-center space-x-4">
        <div 
          onClick={() => setCurrentSubStep('item-selection')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
            currentSubStep === 'item-selection' 
              ? 'bg-sky-600 text-white' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-white text-sky-600 flex items-center justify-center text-sm font-bold">1</div>
          <span>Seleccionar Item</span>
        </div>
        <div className="w-8 h-0.5 bg-slate-600"></div>
        <div 
          onClick={() => selectedItem && setCurrentSubStep('planilla-selection')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            selectedItem ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
          } ${
            currentSubStep === 'planilla-selection' 
              ? 'bg-sky-600 text-white' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-white text-sky-600 flex items-center justify-center text-sm font-bold">2</div>
          <span>Seleccionar Planillas</span>
        </div>
        <div className="w-8 h-0.5 bg-slate-600"></div>
        <div 
          onClick={() => selectedItem && selectedPlanillas.length > 0 && setCurrentSubStep('planilla-navigation')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            selectedItem && selectedPlanillas.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
          } ${
            currentSubStep === 'planilla-navigation' 
              ? 'bg-sky-600 text-white' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-white text-sky-600 flex items-center justify-center text-sm font-bold">3</div>
          <span>Gestionar Recursos</span>
        </div>
      </div>

      {/* Contenido según el sub-paso actual */}
      {currentSubStep === 'item-selection' && (
        <ItemSelectionStep
          onItemSelected={handleItemSelected}
          onNext={() => {}} // No se usa en este sub-paso
        />
      )}

      {currentSubStep === 'planilla-selection' && selectedItem && (
        <PlanillaSelectionStep
          selectedItem={selectedItem}
          selectedPlanillas={selectedPlanillas}
          onPlanillasChange={handlePlanillasChange}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {currentSubStep === 'planilla-navigation' && selectedItem && (
        <PlanillaNavigationStep
          selectedItem={selectedItem}
          selectedPlanillas={planillaData}
          onPlanillaSelect={handlePlanillaSelect}
          onPlanillaDelete={handlePlanillaDelete}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {currentSubStep === 'resumen' && (
        <ResumenFinalStep
          onBack={handleResumenBack}
          onFinish={handleResumenFinish}
        />
      )}
    </div>
  );
};

export default CostosStepNew;
