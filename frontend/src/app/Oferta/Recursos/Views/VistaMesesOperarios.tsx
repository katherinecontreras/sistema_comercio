import { Equipo } from "@/store/equipo/equipoStore";
import { Personal } from "@/store/personal/personalStore";
import { EquipoRecurso, PersonalRecurso } from "@/store/recurso/recursoStore";
import React, { useMemo, useRef, useEffect, useCallback } from "react";
import RecursosTable from "@/components/tables/RecursosTable";
import { Button } from "@/components/ui/button";

type TipoMesesOperarios = 'personal' | 'equipos';

interface VistaMesesOperariosProps {
  tipoMesesOperarios: TipoMesesOperarios;
  personalSeleccionado: PersonalRecurso[];
  equiposSeleccionado: EquipoRecurso[];
  personalDisponible: Personal[];
  equiposDisponibles: Equipo[];
  onTipoChange: (tipo: TipoMesesOperarios) => void;
  onPersonalSelect: (personal: Personal) => void;
  onEquipoSelect: (equipo: Equipo) => void;
  onRemovePersonal: (id: number) => void;
  onRemoveEquipo: (id: number) => void;
  onMesesOperarioChange: (id: number, meses: number) => void;
  onSave: () => void;
  canSave: boolean;
}

const VistaMesesOperarios: React.FC<VistaMesesOperariosProps> = ({
  tipoMesesOperarios,
  personalSeleccionado,
  equiposSeleccionado,
  personalDisponible,
  equiposDisponibles,
  onTipoChange,
  onPersonalSelect,
  onEquipoSelect,
  onRemovePersonal,
  onRemoveEquipo,
  onMesesOperarioChange,
  onSave,
  canSave,
}) => {
  // Datos completos disponibles (todos los personal/equipos de BD)
  const allAvailableData = useMemo(() => {
    return tipoMesesOperarios === 'personal' 
      ? personalDisponible 
      : equiposDisponibles;
  }, [tipoMesesOperarios, personalDisponible, equiposDisponibles]);

  // Datos seleccionados actuales
  const selectedData = useMemo(() => {
    return tipoMesesOperarios === 'personal' 
      ? personalSeleccionado 
      : equiposSeleccionado;
  }, [tipoMesesOperarios, personalSeleccionado, equiposSeleccionado]);

  // Set de IDs seleccionados
  const selectedIds = useMemo(() => {
    const ids = new Set<number>();
    selectedData.forEach(item => {
      const id = tipoMesesOperarios === 'personal' 
        ? (item as PersonalRecurso).id_personal 
        : (item as EquipoRecurso).id_equipo;
      ids.add(id);
    });
    return ids;
  }, [selectedData, tipoMesesOperarios]);

  // Handler para seleccionar/deseleccionar una fila
  const handleRowSelect = (id: number, isSelected: boolean) => {
    if (isSelected) {
      // Agregar a seleccionados si no existe
      if (tipoMesesOperarios === 'personal') {
        const personal = personalDisponible.find(p => p.id_personal === id);
        if (personal && !personalSeleccionado.some(p => p.id_personal === id)) {
          onPersonalSelect(personal);
        }
      } else {
        const equipo = equiposDisponibles.find(e => e.id_equipo === id);
        if (equipo && !equiposSeleccionado.some(e => e.id_equipo === id)) {
          onEquipoSelect(equipo);
        }
      }
    } else {
      // Si se deselecciona, eliminar de la lista (equivalente a hacer clic en eliminar)
      handleRemove(id);
    }
  };

  // Handler para eliminar
  // Al eliminar, el item se quita de la lista de seleccionados
  // y automáticamente se deselecciona (no estará en selectedIds)
  const handleRemove = (id: number) => {
    if (tipoMesesOperarios === 'personal') {
      onRemovePersonal(id);
    } else {
      onRemoveEquipo(id);
    }
  };

  // Ref para la tabla completa (incluye input de búsqueda y tabla)
  const tableRef = useRef<HTMLDivElement>(null);

  // Handler para deseleccionar usando useCallback para estabilizar la referencia
  // Solo deselecciona si el valor de meses_operario es 0
  const handleDeselectAll = useCallback(() => {
    if (selectedIds.size === 0) return;
    
    const idsToRemove: number[] = [];
    
    // Verificar cada item seleccionado
    selectedIds.forEach(id => {
      const item = selectedData.find(item => {
        const itemId = tipoMesesOperarios === 'personal' 
          ? (item as PersonalRecurso).id_personal 
          : (item as EquipoRecurso).id_equipo;
        return itemId === id;
      });
      
      // Solo agregar a la lista de eliminación si meses_operario es 0
      if (item && item.meses_operario === 0) {
        idsToRemove.push(id);
      }
      // Si meses_operario > 0, mantener seleccionado (no agregar a idsToRemove)
    });
    
    // Remover solo los que tienen meses_operario = 0
    idsToRemove.forEach(id => {
      if (tipoMesesOperarios === 'personal') {
        onRemovePersonal(id);
      } else {
        onRemoveEquipo(id);
      }
    });
  }, [selectedIds, selectedData, tipoMesesOperarios, onRemovePersonal, onRemoveEquipo]);

  // Effect para detectar clicks fuera de la tabla y deseleccionar
  useEffect(() => {
    if (selectedIds.size === 0) return; // No hacer nada si no hay selecciones
    if (!tableRef.current) return; // No hacer nada si el ref no está disponible

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Verificar que el ref sigue disponible y que el click es fuera de la tabla
      if (tableRef.current && !tableRef.current.contains(target)) {
        // Deseleccionar todas las filas
        handleDeselectAll();
      }
    };

    // Usar un pequeño delay para asegurar que el DOM está listo
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedIds.size, handleDeselectAll]);

  return (
    <div className="px-6 py-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-600 mb-4">
        <button
          onClick={() => onTipoChange('personal')}
          className={`px-4 py-2 font-medium ${
            tipoMesesOperarios === 'personal'
              ? 'text-sky-400 border-b-2 border-sky-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Mano de Obra
        </button>
        <button
          onClick={() => onTipoChange('equipos')}
          className={`px-4 py-2 font-medium ${
            tipoMesesOperarios === 'equipos'
              ? 'text-sky-400 border-b-2 border-sky-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Equipos
        </button>
      </div>
      {/* Botón Guardar */}
      <div className="flex justify-start">
        <Button
          onClick={onSave}
          disabled={!canSave}
          className="bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 mb-2 disabled:cursor-not-allowed"
        >
          Guardar Meses Operarios
        </Button>
      </div>

      {/* Tabla con todos los datos disponibles - ref envuelve todo el componente */}
      <div ref={tableRef}>
        <RecursosTable
          view="meses_operarios"
          data={selectedData}
          loading={false}
          searchable={true}
          searchPlaceholder={`Buscar ${tipoMesesOperarios === 'personal' ? 'personal' : 'equipo'}...`}
          rowKey={tipoMesesOperarios === 'personal' ? 'id_personal' : 'id_equipo'}
          tipoMesesOperarios={tipoMesesOperarios}
          onRemovePersonal={handleRemove}
          onRemoveEquipo={handleRemove}
          onMesesOperarioChange={onMesesOperarioChange}
          selectedIds={selectedIds}
          onRowSelect={handleRowSelect}
          allAvailableData={allAvailableData}
          selectedData={selectedData}
        />
      </div>
    </div>
  );
};

export default VistaMesesOperarios;
