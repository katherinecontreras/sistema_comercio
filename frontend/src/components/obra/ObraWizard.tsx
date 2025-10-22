import React, { useEffect } from 'react';
import { useObraStore } from '@/store/obra';
import ObraForm from './ObraForm';
import ObraSidebar from './ObraSidebar';
import ObraContent from './ObraContent';
import ResumenView from './ResumenView';
import ActionButtons from './ActionButtons';

const ObraWizard: React.FC = () => {
  const { 
    obra, 
    selectedPartida, 
    selectedSubPartida, 
    selectedPlanilla, 
    showResumen,
    setSelectedPartida,
    setSelectedSubPartida,
    setSelectedPlanilla,
    setShowResumen,
    loadFromLocalStorage,
    saveToLocalStorage
  } = useObraStore();

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Guardar automáticamente en localStorage cuando cambien los datos
  useEffect(() => {
    if (obra) {
      saveToLocalStorage();
    }
  }, [obra, selectedPartida, selectedSubPartida, saveToLocalStorage]);

  // Si no hay obra creada, mostrar formulario
  if (!obra) {
    return <ObraForm />;
  }

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800 border-r border-slate-700">
        <ObraSidebar
          obra={obra}
          selectedPartida={selectedPartida}
          selectedSubPartida={selectedSubPartida}
          onSelectPartida={setSelectedPartida}
          onSelectSubPartida={setSelectedSubPartida}
          onShowResumen={() => setShowResumen(true)}
        />
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-auto">
        {showResumen ? (
          <div>
            <ResumenView
              obra={obra}
              onBack={() => setShowResumen(false)}
            />
            <div className="p-6">
              <ActionButtons
                obra={obra}
                onFinalizar={() => {
                  // Redirigir a dashboard o mostrar mensaje de éxito
                  alert('Oferta finalizada exitosamente');
                  window.location.href = '/dashboard';
                }}
              />
            </div>
          </div>
        ) : (
          <ObraContent
            selectedPartida={selectedPartida}
            selectedSubPartida={selectedSubPartida}
            selectedPlanilla={selectedPlanilla}
            onSelectPlanilla={setSelectedPlanilla}
          />
        )}
      </div>
    </div>
  );
};

export default ObraWizard;
