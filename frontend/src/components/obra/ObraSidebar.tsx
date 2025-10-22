import React, { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { useObraStore } from '@/store/obra';
import { createPartida, createSubPartida } from '@/actions/obras';
import PartidaForm from './PartidaForm';
import SubPartidaForm from './SubPartidaForm';

interface ObraSidebarProps {
  obra: any;
  selectedPartida: number | null;
  selectedSubPartida: number | null;
  onSelectPartida: (id: number | null) => void;
  onSelectSubPartida: (id: number | null) => void;
  onShowResumen: () => void;
}

const ObraSidebar: React.FC<ObraSidebarProps> = ({
  obra,
  selectedPartida,
  selectedSubPartida,
  onSelectPartida,
  onSelectSubPartida,
  onShowResumen
}) => {
  const { partidas, setPartidas } = useObraStore();
  const [showAddPartida, setShowAddPartida] = useState(false);
  const [showAddSubPartida, setShowAddSubPartida] = useState<number | null>(null);
  const [expandedPartidas, setExpandedPartidas] = useState<Set<number>>(new Set());

  const handleAddPartida = async (data: any) => {
    try {
      const partida = await createPartida(obra.id_obra, data);
      setPartidas([...partidas, partida]);
      setShowAddPartida(false);
    } catch (error) {
      console.error('Error creando partida:', error);
    }
  };

  const handleAddSubPartida = async (idPartida: number, data: any) => {
    try {
      const subpartida = await createSubPartida(idPartida, data);
      // Actualizar la partida para marcar que tiene subpartidas
      const updatedPartidas = partidas.map(p => 
        p.id_partida === idPartida 
          ? { ...p, tiene_subpartidas: true, subpartidas: [...(p.subpartidas || []), subpartida] }
          : p
      );
      setPartidas(updatedPartidas);
      setShowAddSubPartida(null);
    } catch (error) {
      console.error('Error creando subpartida:', error);
    }
  };

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
          onClick={() => setShowAddPartida(true)}
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
              }`}
              onClick={() => {
                if (partida.tiene_subpartidas) {
                  togglePartida(partida.id_partida);
                } else {
                  onSelectPartida(partida.id_partida);
                  onSelectSubPartida(null);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {partida.tiene_subpartidas ? (
                    expandedPartidas.has(partida.id_partida) ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )
                  ) : (
                    <Circle className="h-4 w-4 text-slate-400" />
                  )}
                  
                  {partida.tiene_subpartidas ? (
                    expandedPartidas.has(partida.id_partida) ? (
                      <FolderOpen className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Folder className="h-4 w-4 text-slate-400" />
                    )
                  ) : (
                    <Circle className="h-4 w-4 text-slate-400" />
                  )}
                  
                  <span className="text-white text-sm truncate">{partida.nombre_partida}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  {getPartidaStatus(partida) === 'complete' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  
                  {!partida.tiene_subpartidas && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddSubPartida(partida.id_partida);
                      }}
                      className="bg-slate-600 hover:bg-slate-500 text-white h-6 px-2"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* SubPartidas */}
            {partida.tiene_subpartidas && expandedPartidas.has(partida.id_partida) && (
              <div className="bg-slate-750 border-l-2 border-slate-600">
                {partida.subpartidas?.map((subpartida: any) => (
                  <div
                    key={subpartida.id_subpartida}
                    className={`p-3 pl-6 cursor-pointer hover:bg-slate-700 ${
                      selectedSubPartida === subpartida.id_subpartida ? 'bg-slate-600' : ''
                    }`}
                    onClick={() => {
                      onSelectSubPartida(subpartida.id_subpartida);
                      onSelectPartida(null);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Circle className="h-3 w-3 text-slate-400" />
                        <span className="text-white text-sm truncate">{subpartida.descripcion_tarea}</span>
                      </div>
                      
                      {getSubPartidaStatus(subpartida) === 'complete' && (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modales */}
      {showAddPartida && (
        <PartidaForm
          onSave={handleAddPartida}
          onCancel={() => setShowAddPartida(false)}
        />
      )}

      {showAddSubPartida && (
        <SubPartidaForm
          partidaId={showAddSubPartida}
          onSave={(data: any) => handleAddSubPartida(showAddSubPartida, data)}
          onCancel={() => setShowAddSubPartida(null)}
        />
      )}
    </div>
  );
};

export default ObraSidebar;
