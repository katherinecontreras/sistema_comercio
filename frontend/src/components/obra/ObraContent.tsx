import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Package, FileSpreadsheet } from 'lucide-react';
import { useObraStore } from '@/store/obra';
import { getTiposRecursos } from '@/actions/catalogos';
import PartidaForm from './PartidaForm';
import CostoForm from './CostoForm';
import SubPartidaForm from './SubPartidaForm';
import { PlanillaSelection } from './PlanillaSelection';
import ResourceManagement from './ResourceManagement';

interface ObraContentProps {
  selectedPartida: number | null;
  selectedSubPartida: number | null;
  selectedPlanilla: number | null;
  onSelectPlanilla: (id: number | null) => void;
  showPartidaForm?: boolean;
  showSubPartidaForm?: boolean;
  editingPartida?: any;
  onClosePartidaForm?: () => void;
  onCloseSubPartidaForm?: () => void;
}

const ObraContent: React.FC<ObraContentProps> = ({
  selectedPartida,
  selectedSubPartida,
  selectedPlanilla,
  onSelectPlanilla,
  showPartidaForm = false,
  showSubPartidaForm = false,
  onClosePartidaForm,
  onCloseSubPartidaForm
}) => {
  const { partidas, addPlanillasToPartida, addPlanillasToSubPartida } = useObraStore();
  const [showCostoForm, setShowCostoForm] = useState(false);
  const [editingCosto, setEditingCosto] = useState<any>(null);
  const [selectedPlanillas, setSelectedPlanillas] = useState<number[]>([]);
  const [tiposRecursos, setTiposRecursos] = useState<any[]>([]);

  useEffect(() => {
    cargarTiposRecursos();
  }, []);

  const cargarTiposRecursos = async () => {
    try {
      const tipos = await getTiposRecursos();
      setTiposRecursos(tipos);
    } catch (error) {
      console.error('Error cargando tipos de recursos:', error);
    }
  };

  // Obtener información de la partida/subpartida seleccionada
  const selectedItemInfo = useMemo(() => {
    if (selectedSubPartida) {
      // Buscar la subpartida en todas las partidas
      for (const partida of partidas) {
        if (partida.subpartidas) {
          const subpartida = partida.subpartidas.find((sp: any) => sp.id_subpartida === selectedSubPartida);
          if (subpartida) {
            return {
              type: 'subpartida' as const,
              item: subpartida,
              parent: partida
            };
          }
        }
      }
    } else if (selectedPartida) {
      // Buscar la partida
      const partida = partidas.find((p: any) => p.id_partida === selectedPartida);
      if (partida) {
        return {
          type: 'partida' as const,
          item: partida,
          parent: null
        };
      }
    }
    return null;
  }, [selectedPartida, selectedSubPartida, partidas]);

  // Debug logging
  // console.log('ObraContent - selectedPartida:', selectedPartida);
  // console.log('ObraContent - selectedSubPartida:', selectedSubPartida);
  // console.log('ObraContent - selectedItemInfo:', selectedItemInfo);

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
            // Verificar si el item tiene planillas
            const hasPlanillas = selectedItemInfo?.type === 'subpartida' 
              ? selectedItemInfo.item.planillas && selectedItemInfo.item.planillas.length > 0
              : selectedItemInfo?.item.planillas && selectedItemInfo.item.planillas.length > 0;

            return (
              <div className="p-6">
                {selectedPlanilla ? (
                  // Mostrar gestión de recursos si hay planilla seleccionada
                  <ResourceManagement
                    planillaId={selectedPlanilla}
                    planillaNombre={`Planilla ${selectedPlanilla}`} // TODO: Obtener nombre real de la planilla
                    partidaId={selectedItemInfo?.type === 'partida' ? selectedItemInfo.item.id_partida : undefined}
                    subpartidaId={selectedItemInfo?.type === 'subpartida' ? selectedItemInfo.item.id_subpartida : undefined}
                    onClose={() => onSelectPlanilla(null)}
                    onSave={(recursos: any[]) => {
                      console.log('Guardando recursos:', recursos);
                      // TODO: Implementar guardado de recursos
                    }}
                  />
                ) : hasPlanillas ? (
                  // Si ya tiene planillas, mostrar mensaje
                  <div className="text-center py-8">
                    <FileSpreadsheet className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Planillas Asignadas</h3>
                    <p className="text-slate-400 mb-4">
                      Este item ya tiene {selectedItemInfo?.item.planillas?.length || 0} planilla(s) asignada(s).
                    </p>
                    <p className="text-slate-500 text-sm">
                      Selecciona una planilla del sidebar para gestionar sus recursos.
                    </p>
                  </div>
                ) : (
                  // Mostrar selección de planillas si no tiene planillas
                  <PlanillaSelection
                    selectedItem={selectedItemInfo!}
                    selectedPlanillas={selectedPlanillas}
                    onPlanillasChange={setSelectedPlanillas}
                    onContinue={(planillas) => {
                      // Obtener nombres de las planillas
                      const planillasConNombres = planillas.map(id => {
                        const planilla = tiposRecursos.find(t => t.id_tipo_recurso === id);
                        return {
                          id: id,
                          nombre: planilla?.nombre || `Planilla ${id}`
                        };
                      });
                      
                      // Guardar planillas en el item correspondiente
                      if (selectedItemInfo?.type === 'subpartida') {
                        addPlanillasToSubPartida(selectedPartida!, selectedSubPartida!, planillasConNombres);
                      } else {
                        addPlanillasToPartida(selectedPartida!, planillasConNombres);
                      }
                      // Limpiar selección y volver al resumen
                      setSelectedPlanillas([]);
                      // No llamar a onSelectPlanilla, solo limpiar la selección
                    }}
                  />
                )}
              </div>
            );
          }

  // Si se debe mostrar el formulario de partida
  if (showPartidaForm) {
    return (
      <div className="p-6">
        <PartidaForm
          onClose={onClosePartidaForm || (() => {})}
          partida={null}
        />
      </div>
    );
  }

  // Si se debe mostrar el formulario de subpartida
  if (showSubPartidaForm) {
    return (
      <div className="p-6">
        <SubPartidaForm
          partidaId={selectedPartida || 0}
          onSave={(data: any) => {
            console.log('Guardando subpartida:', data);
            onCloseSubPartidaForm?.();
          }}
          onCancel={onCloseSubPartidaForm || (() => {})}
        />
      </div>
    );
  }

  return (
    <>
      {/* Modales */}
      {showCostoForm && (
        <>
          {console.log('Renderizando CostoForm...')}
          <CostoForm
            onClose={() => {
              console.log('Cerrando modal de costo...');
              setShowCostoForm(false);
              setEditingCosto(null);
            }}
            costo={editingCosto}
            idPartida={selectedPartida}
            idSubPartida={selectedSubPartida}
          />
        </>
      )}
    </>
  );
};

export default ObraContent;
