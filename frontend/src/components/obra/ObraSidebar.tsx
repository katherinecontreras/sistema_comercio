import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Folder, 
  FolderOpen, 
  CheckCircle, 
  Circle,
  BarChart3,
  ChevronRight,
  ChevronDown,
  Edit,
  FileSpreadsheet
} from 'lucide-react';
import { useObraStore } from '@/store/obra';

interface ObraSidebarProps {
  obra: any;
  selectedPartida: number | null;
  selectedSubPartida: number | null;
  selectedPlanilla: number | null;
  onSelectPartida: (id: number | null) => void;
  onSelectSubPartida: (id: number | null) => void;
  onSelectPlanilla: (id: number | null) => void;
  onEditPartida: (id: number) => void;
  onShowResumen: () => void;
  onShowPartidaForm: () => void;
  onShowSubPartidaForm: (idPartida: number) => void;
  onShowPlanillaSelection: (id: number, type: 'partida' | 'subpartida') => void;
  onTriggerAutoExpand?: (fn: (partidaId: number, subpartidaId: number) => void) => void;
}

const ObraSidebar: React.FC<ObraSidebarProps> = ({
  obra,
  selectedPartida,
  selectedSubPartida,
  selectedPlanilla,
  onSelectPartida,
  onSelectSubPartida,
  onSelectPlanilla,
  onEditPartida,
  onShowResumen,
  onShowPartidaForm,
  onShowSubPartidaForm,
  onShowPlanillaSelection,
  onTriggerAutoExpand
}) => {
  const { partidas, getRecursosFromPlanilla } = useObraStore();
  const [expandedPartidas, setExpandedPartidas] = useState<Set<number>>(new Set());

  // Función para determinar si una planilla tiene recursos (sin memoizar para evitar bucles)
  const planillaTieneRecursos = (idPartida: number, idSubPartida: number | null, idPlanilla: number): boolean => {
    const recursos = getRecursosFromPlanilla(idPartida, idSubPartida, idPlanilla);
    return recursos && recursos.length > 0;
  };

  // Función para determinar si una partida está completa (sin memoizar para evitar bucles)
  const partidaEstaCompleta = (partida: any): boolean => {
    if (!partida.planillas || partida.planillas.length === 0) return false;
    
    // Si tiene subpartidas, verificar que todas las subpartidas estén completas
    if (partida.tiene_subpartidas && partida.subpartidas) {
      return partida.subpartidas.every((subpartida: any) => {
        if (!subpartida.planillas || subpartida.planillas.length === 0) return false;
        return subpartida.planillas.every((planilla: any) => 
          planillaTieneRecursos(partida.id_partida, subpartida.id_subpartida, planilla.id)
        );
      });
    }
    
    // Si no tiene subpartidas, verificar que todas las planillas de la partida tengan recursos
    return partida.planillas.every((planilla: any) => 
      planillaTieneRecursos(partida.id_partida, null, planilla.id)
    );
  };

  // Función para determinar si una subpartida está completa (sin memoizar para evitar bucles)
  const subpartidaEstaCompleta = (partida: any, subpartida: any): boolean => {
    if (!subpartida.planillas || subpartida.planillas.length === 0) return false;
    return subpartida.planillas.every((planilla: any) => 
      planillaTieneRecursos(partida.id_partida, subpartida.id_subpartida, planilla.id)
    );
  };
  const [autoExpand, setAutoExpand] = useState<{partidaId: number, subpartidaId: number} | null>(null);



  // useEffect(() => {
  //   console.log('ObraSidebar: Partidas recibidas:', partidas);
  //   console.log('ObraSidebar: Cantidad de partidas:', partidas.length);
  //   partidas.forEach((partida, index) => {
  //     console.log(`Partida ${index}:`, {
  //       id: partida.id_partida,
  //       nombre: partida.nombre_partida,
  //       tiene_subpartidas: partida.tiene_subpartidas,
  //       planillas: partida.planillas,
  //       subpartidas: partida.subpartidas?.map(sp => ({
  //         id: sp.id_subpartida,
  //         descripcion: sp.descripcion_tarea,
  //         planillas: sp.planillas
  //       }))
  //     });
  //   });
  // }, [partidas]);

  // Efecto para expansión automática cuando se agregan planillas
  useEffect(() => {
    if (autoExpand) {
      // console.log('Expandiendo automáticamente:', autoExpand);
      setExpandedPartidas(prev => {
        const newExpanded = new Set(prev);
        newExpanded.add(autoExpand.partidaId);
        newExpanded.add(autoExpand.subpartidaId);
        return newExpanded;
      });
      setAutoExpand(null);
    }
  }, [autoExpand]);

  // Función para activar expansión automática
  const triggerAutoExpand = useCallback((partidaId: number, subpartidaId: number) => {
    setAutoExpand({ partidaId, subpartidaId });
  }, []);

  // Usar useRef para evitar bucles infinitos
  const onTriggerAutoExpandRef = useRef(onTriggerAutoExpand);
  onTriggerAutoExpandRef.current = onTriggerAutoExpand;

  // Exponer la función triggerAutoExpand al componente padre
  useEffect(() => {
    if (onTriggerAutoExpandRef.current) {
      onTriggerAutoExpandRef.current(triggerAutoExpand);
    }
  }, [triggerAutoExpand]);

  const togglePartida = (idPartida: number) => {
    const newExpanded = new Set(expandedPartidas);
    if (newExpanded.has(idPartida)) {
      newExpanded.delete(idPartida);
    } else {
      newExpanded.add(idPartida);
    }
    setExpandedPartidas(newExpanded);
  };

  const getPartidaStatus = (partida: any) => {
    if (partida.tiene_subpartidas) {
      const subpartidasCompletas = partida.subpartidas?.filter((s: any) => s.completa).length || 0;
      const totalSubpartidas = partida.subpartidas?.length || 0;
      return totalSubpartidas > 0 && subpartidasCompletas === totalSubpartidas ? 'complete' : 'partial';
    } else {
      return partida.completa ? 'complete' : 'incomplete';
    }
  };

  const getSubPartidaStatus = (subpartida: any) => {
    return subpartida.completa ? 'complete' : 'incomplete';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header de la Obra */}
      <div className="p-4 border-b border-slate-700">
        <div className="text-sm text-slate-400">Código: {obra.codigo_proyecto || 'N/A'}</div>
        <div className="text-lg font-semibold text-white truncate">{obra.nombre_proyecto}</div>
      </div>

      {/* Botón Resumen */}
      <div className="p-4 border-b border-slate-700">
        <Button
          onClick={onShowResumen}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Resumen
        </Button>
      </div>

      {/* Botón Agregar Partida */}
      <div className="p-4 border-b border-slate-700">
        <Button
          onClick={onShowPartidaForm}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Partida
        </Button>
      </div>

      {/* Lista de Partidas */}
      <div className="flex-1 overflow-auto">
        {partidas.map((partida) => (
          <div key={partida.id_partida} className="border-b border-slate-700">
            {/* Partida */}
            <div
              className={`p-3 cursor-pointer hover:bg-slate-700 ${
                selectedPartida === partida.id_partida ? 'bg-slate-600' : ''
              } ${
                partidaEstaCompleta(partida) ? 'bg-green-900/20 border-l-4 border-green-500' : ''
              }`}
              onClick={() => {
                if (partida.tiene_subpartidas || (partida.planillas && partida.planillas.length > 0)) {
                  togglePartida(partida.id_partida!);
                } else {
                  onSelectPartida(partida.id_partida!);
                  onSelectSubPartida(null);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {(partida.tiene_subpartidas || (partida.planillas && partida.planillas.length > 0)) ? (
                    expandedPartidas.has(partida.id_partida!) ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )
                  ) : (
                    <Circle className="h-4 w-4 text-slate-400" />
                  )}
                  
                  {(partida.tiene_subpartidas || (partida.planillas && partida.planillas.length > 0)) && (
                    expandedPartidas.has(partida.id_partida!) ? (
                      <FolderOpen className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Folder className="h-4 w-4 text-slate-400" />
                    )
                  )}
                  
                  <span className="text-white text-sm truncate">{partida.nombre_partida}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  {getPartidaStatus(partida) === 'complete' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  
                  {/* Botón de editar */}
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPartida(partida.id_partida!);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white h-6 px-2"
                    title="Editar partida"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  {/* Botón de agregar subpartida */}
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowSubPartidaForm(partida.id_partida!);
                    }}
                    className="bg-slate-600 hover:bg-slate-500 text-white h-6 px-2"
                    title="Agregar subpartida"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* SubPartidas */}
            {partida.tiene_subpartidas && expandedPartidas.has(partida.id_partida!) && (
              <div className="bg-slate-750 border-l-2 border-slate-600">
                {partida.subpartidas?.map((subpartida: any) => (
                  <div key={subpartida.id_subpartida}>
                    <div
                      className={`p-3 pl-6 cursor-pointer hover:bg-slate-700 ${
                        selectedSubPartida === subpartida.id_subpartida ? 'bg-slate-600' : ''
                      } ${
                        subpartidaEstaCompleta(partida, subpartida) ? 'bg-green-900/20 border-l-4 border-green-500' : ''
                      }`}
                      onClick={() => {
                        // Siempre seleccionar la subpartida primero
                        onSelectSubPartida(subpartida.id_subpartida!);
                        
                        // Si la subpartida tiene planillas, también expandir/colapsar
                        if (subpartida.planillas && subpartida.planillas.length > 0) {
                          togglePartida(subpartida.id_subpartida!);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {/* Icono de expansión/colapso para subpartidas con planillas */}
                          {(subpartida.planillas && subpartida.planillas.length > 0) ? (
                            expandedPartidas.has(subpartida.id_subpartida!) ? (
                              <ChevronDown className="h-3 w-3 text-slate-400" />
                            ) : (
                              <ChevronRight className="h-3 w-3 text-slate-400" />
                            )
                          ) : (
                            <Circle className="h-3 w-3 text-slate-400" />
                          )}
                          
                          {/* Icono de carpeta para subpartidas con planillas */}
                          {(subpartida.planillas && subpartida.planillas.length > 0) && (
                            expandedPartidas.has(subpartida.id_subpartida!) ? (
                              <FolderOpen className="h-3 w-3 text-slate-400" />
                            ) : (
                              <Folder className="h-3 w-3 text-slate-400" />
                            )
                          )}
                          
                          <span className="text-white text-sm truncate">{subpartida.descripcion_tarea}</span>
                        </div>
                        
                        {getSubPartidaStatus(subpartida) === 'complete' && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </div>
                    
                    {/* Planillas de la SubPartida */}
                    {subpartida.planillas && subpartida.planillas.length > 0 && expandedPartidas.has(subpartida.id_subpartida!) && (
                      <div className="bg-slate-800 border-l-2 border-slate-500">
                        {subpartida.planillas.map((planillaId: {id: number, nombre: string, recursos?: any[]}) => (
                          <div
                            key={`subpartida-${subpartida.id_subpartida}-planilla-${planillaId.id}`}
                            className={`p-2 pl-8 cursor-pointer hover:bg-slate-700 ${
                              selectedPlanilla === planillaId.id && selectedSubPartida === subpartida.id_subpartida ? 'bg-slate-500' : ''
                            } ${
                              partida.id_partida && subpartida.id_subpartida && planillaTieneRecursos(partida.id_partida, subpartida.id_subpartida, planillaId.id) ? 'bg-green-900/20 border-l-4 border-green-500' : ''
                            }`}
                            onClick={() => {
                              onSelectPlanilla(planillaId.id);
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <FileSpreadsheet className="h-3 w-3 text-slate-400" />
                              <span className="text-slate-300 text-xs truncate">
                                {typeof planillaId === 'object' ? planillaId.nombre : `Planilla ${planillaId}`}
                              </span>
                              {planillaId.recursos && planillaId.recursos.length > 0 && (
                                <CheckCircle className="h-3 w-3 text-green-400" />
                              )}
                            </div>
                          </div>
                        ))}
                        {/* Botón Agregar Planilla */}
                        <div
                          className="p-2 pl-8 cursor-pointer hover:bg-slate-700 text-slate-400 hover:text-white"
                          onClick={() => {
                            onShowPlanillaSelection(subpartida.id_subpartida!, 'subpartida');
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <Plus className="h-3 w-3" />
                            <span className="text-xs">Agregar Planilla</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Planillas de la Partida (solo si está expandida) */}
            {partida.planillas && partida.planillas.length > 0 && expandedPartidas.has(partida.id_partida!) && (
              <div className="bg-slate-800 border-l-2 border-slate-500">
                        {partida.planillas.map((planillaId: {id: number, nombre: string, recursos?: any[]}) => (
                          <div
                            key={`partida-${partida.id_partida}-planilla-${planillaId.id}`}
                    className={`p-2 pl-6 cursor-pointer hover:bg-slate-700 ${
                      selectedPlanilla === planillaId.id && selectedPartida === partida.id_partida ? 'bg-slate-500' : ''
                    } ${
                      partida.id_partida && planillaTieneRecursos(partida.id_partida, null, planillaId.id) ? 'bg-green-900/20 border-l-4 border-green-500' : ''
                    }`}
                    onClick={() => {
                      onSelectPlanilla(planillaId.id);
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <FileSpreadsheet className="h-3 w-3 text-slate-400" />
                      <span className="text-slate-300 text-xs truncate">
                        {typeof planillaId === 'object' ? planillaId.nombre : `Planilla ${planillaId}`}
                      </span>
                      {planillaId.recursos && planillaId.recursos.length > 0 && (
                        <CheckCircle className="h-3 w-3 text-green-400" />
                      )}
                    </div>
                  </div>
                ))}
                {/* Botón Agregar Planilla */}
                <div
                  className="p-2 pl-6 cursor-pointer hover:bg-slate-700 text-slate-400 hover:text-white"
                  onClick={() => {
                    onShowPlanillaSelection(partida.id_partida!, 'partida');
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Plus className="h-3 w-3" />
                    <span className="text-xs">Agregar Planilla</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default ObraSidebar;
