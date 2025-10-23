import React, { useEffect, useState } from 'react';
import { useObraStore } from '@/store/obra';
import ObraForm from './ObraForm';
import ObraSidebar from './ObraSidebar';
import ObraContent from './ObraContent';
import ResumenView from './ResumenView';
import ActionButtons from './ActionButtons';
import PartidaForm from './PartidaForm';
import SubPartidaForm from './SubPartidaForm';
import { AddPlanillaModal } from './AddPlanillaModal';
import { PlanillaSelection } from './PlanillaSelection';

const ObraWizard: React.FC = () => {
  const {
    obra,
    partidas,
    selectedPartida,
    selectedSubPartida,
    selectedPlanilla,
    showResumen,
    setSelectedPartida,
    setSelectedSubPartida,
    setSelectedPlanilla,
    setShowResumen,
    addSubPartida,
    addPlanillasToPartida,
    addPlanillasToSubPartida
  } = useObraStore();

  // Estados para formularios
  const [showPartidaForm, setShowPartidaForm] = useState(false);
  const [showSubPartidaForm, setShowSubPartidaForm] = useState(false);
  const [editingPartida, setEditingPartida] = useState<any>(null);
  const [showPlanillaSelection, setShowPlanillaSelection] = useState(false);
  const [planillaSelectionTarget, setPlanillaSelectionTarget] = useState<{id: number, type: 'partida' | 'subpartida'} | null>(null);
  const [showAddPlanillaModal, setShowAddPlanillaModal] = useState(false);
  const [selectedPlanillas, setSelectedPlanillas] = useState<number[]>([]);
  const [triggerAutoExpand, setTriggerAutoExpand] = useState<((partidaId: number, subpartidaId: number) => void) | null>(null);

  // Función para manejar selección de partidas
  const handleSelectPartida = (idPartida: number | null) => {
    setSelectedPartida(idPartida);
    setShowResumen(false);
    setShowPartidaForm(false);
    setShowSubPartidaForm(false);
    setSelectedSubPartida(null);
    setSelectedPlanilla(null);
    // Limpiar selección de planillas cuando se cambia de item
    setShowPlanillaSelection(false);
    setPlanillaSelectionTarget(null);
    setSelectedPlanillas([]);
  };

  // Función para manejar selección de planillas
  const handleShowPlanillaSelection = (id: number, type: 'partida' | 'subpartida') => {
    setPlanillaSelectionTarget({id, type});
    setShowPlanillaSelection(true);
    setShowResumen(false);
    
    // Cargar planillas existentes para este item
    if (type === 'subpartida') {
      const partida = partidas.find(p => p.subpartidas?.some(sp => sp.id_subpartida === id));
      const subpartida = partida?.subpartidas?.find(sp => sp.id_subpartida === id);
      if (subpartida?.planillas) {
        setSelectedPlanillas(subpartida.planillas.map(p => p.id));
      } else {
        setSelectedPlanillas([]);
      }
    } else {
      const partida = partidas.find(p => p.id_partida === id);
      if (partida?.planillas) {
        setSelectedPlanillas(partida.planillas.map(p => p.id));
      } else {
        setSelectedPlanillas([]);
      }
    }
  };

  // Función para manejar agregar nueva planilla
  const handleAddPlanilla = (planilla: { id: number, nombre: string }) => {
    if (planillaSelectionTarget) {
      // Agregar la nueva planilla a la selección
      setSelectedPlanillas(prev => {
        const newSelection = [...prev, planilla.id];
        return newSelection;
      });
    }
    setShowAddPlanillaModal(false);
  };

  // Función para manejar continuar con planillas seleccionadas
  const handleContinueWithPlanillas = async (planillas: number[]) => {
    if (planillaSelectionTarget) {
      // Obtener nombres reales de las planillas desde la API
      try {
        const response = await fetch('/api/v1/catalogos/tipos_recurso');
        const tiposRecursos = await response.json();
        
        const planillasConNombres = planillas.map(id => {
          const tipoRecurso = tiposRecursos.find((t: any) => t.id_tipo_recurso === id);
          return {
            id: id,
            nombre: tipoRecurso?.nombre || `Planilla ${id}`
          };
        });
        
        // Guardar planillas en el item correspondiente
        if (planillaSelectionTarget.type === 'subpartida') {
          // Buscar la partida padre de la subpartida
          const partidaPadre = partidas.find(p => p.subpartidas?.some(sp => sp.id_subpartida === planillaSelectionTarget.id));
          if (partidaPadre) {
            addPlanillasToSubPartida(partidaPadre.id_partida!, planillaSelectionTarget.id, planillasConNombres);
            
            // Expandir automáticamente la partida padre y la subpartida para mostrar las planillas
            // Activar expansión automática
            if (triggerAutoExpand) {
              triggerAutoExpand(partidaPadre.id_partida!, planillaSelectionTarget.id);
            }
          }
        } else {
          addPlanillasToPartida(planillaSelectionTarget.id, planillasConNombres);
        }
      } catch (error) {
        console.error('Error obteniendo nombres de planillas:', error);
        // Usar nombres genéricos como fallback
        const planillasConNombres = planillas.map(id => ({
          id: id,
          nombre: `Planilla ${id}`
        }));
        
        // Guardar con nombres genéricos
        if (planillaSelectionTarget.type === 'subpartida') {
          const partidaPadre = partidas.find(p => p.subpartidas?.some(sp => sp.id_subpartida === planillaSelectionTarget.id));
          if (partidaPadre) {
            addPlanillasToSubPartida(partidaPadre.id_partida!, planillaSelectionTarget.id, planillasConNombres);
            if (triggerAutoExpand) {
              triggerAutoExpand(partidaPadre.id_partida!, planillaSelectionTarget.id);
            }
          }
        } else {
          addPlanillasToPartida(planillaSelectionTarget.id, planillasConNombres);
        }
      }
    }
    setShowPlanillaSelection(false);
    setPlanillaSelectionTarget(null);
    setSelectedPlanillas([]);
  };

  // Función para editar partida (solo cuando se presiona el botón de lápiz)
  const handleEditPartida = (idPartida: number) => {
    const partida = partidas.find(p => p.id_partida === idPartida);
    if (partida) {
      setEditingPartida(partida);
      setShowPartidaForm(true);
      setShowResumen(false);
    }
  };

  // Cargar datos del localStorage al iniciar
  // useEffect(() => {
  //   loadFromLocalStorage();
  // }, [loadFromLocalStorage]);

  // Mostrar resumen por defecto cuando se crea una obra (solo una vez)
  useEffect(() => {
    if (obra && !showResumen && !selectedPartida && !selectedSubPartida && !showPartidaForm && !showSubPartidaForm) {
      setShowResumen(true);
    }
  }, [obra, showResumen, selectedPartida, selectedSubPartida, showPartidaForm, showSubPartidaForm, setShowResumen]);

  // Mostrar resumen por defecto cuando se crea una obra (solo una vez)
  // useEffect(() => {
  //   console.log('useEffect resumen - obra:', !!obra, 'showPartidaForm:', showPartidaForm, 'showSubPartidaForm:', showSubPartidaForm, 'showResumen:', showResumen, 'selectedPartida:', selectedPartida, 'selectedSubPartida:', selectedSubPartida);
  //   // Solo activar resumen si no hay selección activa Y no hay formularios abiertos
  //   if (obra && !showPartidaForm && !showSubPartidaForm && !showResumen && !selectedPartida && !selectedSubPartida) {
  //     console.log('Activando resumen por defecto');
  //     setShowResumen(true);
  //   }
  // }, [obra, showPartidaForm, showSubPartidaForm, showResumen, selectedPartida, selectedSubPartida, setShowResumen]);

  // Resetear resumen cuando se abren formularios
  useEffect(() => {
    if (showPartidaForm || showSubPartidaForm) {
      setShowResumen(false);
    }
  }, [showPartidaForm, showSubPartidaForm]);

  // Guardar automáticamente en localStorage cuando cambien los datos
  // useEffect(() => {
  //   if (obra && !showPartidaForm && !showSubPartidaForm) {
  //     saveToLocalStorage();
  //   }
  // }, [obra, selectedPartida, selectedSubPartida, showPartidaForm, showSubPartidaForm, saveToLocalStorage]);

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
                      selectedPlanilla={selectedPlanilla}
                      onSelectPartida={handleSelectPartida}
                      onSelectSubPartida={(id) => {
                        setSelectedSubPartida(id);
                        // Limpiar selección de planillas cuando se cambia de item
                        setShowPlanillaSelection(false);
                        setPlanillaSelectionTarget(null);
                        setSelectedPlanillas([]);
                      }}
                      onSelectPlanilla={setSelectedPlanilla}
                      onEditPartida={handleEditPartida}
                      onShowResumen={() => {
                        setShowResumen(true);
                        setShowPartidaForm(false);
                        setEditingPartida(null);
                      }}
                      onShowPartidaForm={() => {
                        setShowPartidaForm(true);
                        setEditingPartida(null);
                        setShowResumen(false);
                      }}
                      onShowSubPartidaForm={(idPartida: number) => {
                        setShowSubPartidaForm(true);
                        setSelectedPartida(idPartida);
                        setShowResumen(false);
                      }}
                      onShowPlanillaSelection={handleShowPlanillaSelection}
            onTriggerAutoExpand={(fn) => setTriggerAutoExpand(() => fn)}
                    />
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-auto">
        {showResumen ? (
          <div>
            <ResumenView
              obra={obra}
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
        ) : showPartidaForm ? (
          <div className="p-6">
            <PartidaForm
              onClose={() => {
                setShowPartidaForm(false);
                setEditingPartida(null);
                setShowResumen(true);
              }}
              partida={editingPartida}
            />
          </div>
        ) : showSubPartidaForm ? (
          <div className="p-6">
            <SubPartidaForm
              partidaId={selectedPartida || 0}
              onSave={(data: any) => {
                // Agregar subpartida al store
                const subpartidaConId = {
                  ...data,
                  id_subpartida: Date.now(), // ID temporal único
                };
                addSubPartida(selectedPartida || 0, subpartidaConId);
                setShowSubPartidaForm(false);
                // No resetear a resumen, mantener la selección de la partida
              }}
              onCancel={() => {
                setShowSubPartidaForm(false);
                // No resetear a resumen, mantener la selección de la partida
              }}
            />
          </div>
        ) : showPlanillaSelection && planillaSelectionTarget ? (
          <div className="p-6">
            <PlanillaSelection
              selectedItem={{
                type: planillaSelectionTarget.type,
                item: planillaSelectionTarget.type === 'subpartida' 
                  ? partidas.find(p => p.subpartidas?.some(sp => sp.id_subpartida === planillaSelectionTarget.id))?.subpartidas?.find(sp => sp.id_subpartida === planillaSelectionTarget.id)
                  : partidas.find(p => p.id_partida === planillaSelectionTarget.id),
                parent: planillaSelectionTarget.type === 'subpartida' 
                  ? partidas.find(p => p.subpartidas?.some(sp => sp.id_subpartida === planillaSelectionTarget.id))
                  : null
              }}
              selectedPlanillas={selectedPlanillas}
              onPlanillasChange={setSelectedPlanillas}
              onContinue={handleContinueWithPlanillas}
              onAddNewPlanilla={() => {
                setShowAddPlanillaModal(true);
              }}
            />
          </div>
        ) : (
          <>
            <ObraContent
              selectedPartida={selectedPartida}
              selectedSubPartida={selectedSubPartida}
              selectedPlanilla={selectedPlanilla}
              onSelectPlanilla={setSelectedPlanilla}
            />
          </>
        )}
      </div>

      {/* Modales */}
      <AddPlanillaModal
        open={showAddPlanillaModal}
        onClose={() => setShowAddPlanillaModal(false)}
        onAdd={handleAddPlanilla}
      />
    </div>
  );
};

export default ObraWizard;
