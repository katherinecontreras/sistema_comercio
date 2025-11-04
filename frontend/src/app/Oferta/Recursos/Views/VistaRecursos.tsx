import { Recurso } from "@/store/recurso/recursoStore";
import React, { useRef, useEffect } from "react";
import RecursosTable from "@/components/tables/RecursosTable";

interface RecursoFromDB {
  id_recurso: number;
  id_tipo_recurso: number;
  descripcion: string;
  unidad: string;
  cantidad: number;
  meses_operario: number;
}

interface VistaRecursosProps {
  recursosDB: RecursoFromDB[];
  recursosStore: Recurso[];
  recursoSelected: RecursoFromDB | null;
  loading: boolean;
  onRecursoSelect: (recurso: RecursoFromDB) => void;
  onCantidadChange: (idRecurso: number, cantidad: number) => void;
  onAddMesesOperarios: (recurso: RecursoFromDB) => void;
  onDeselect: () => void;
}

const VistaRecursos: React.FC<VistaRecursosProps> = ({
  recursosDB,
  recursosStore,
  recursoSelected,
  loading,
  onRecursoSelect,
  onCantidadChange,
  onAddMesesOperarios,
  onDeselect,
}) => {
  // Ref para la tabla completa
  const tableRef = useRef<HTMLDivElement>(null);

  // Effect para detectar clicks fuera de la tabla y deseleccionar
  useEffect(() => {
    if (!recursoSelected) return; // No hacer nada si no hay selección

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Verificar que el ref sigue disponible y que el click es fuera de la tabla
      if (tableRef.current && !tableRef.current.contains(target)) {
        // Deseleccionar
        onDeselect();
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
  }, [recursoSelected, onDeselect]);

  return (
    <div className="px-6 py-4">
      <div ref={tableRef}>
        <RecursosTable
          view="recursos"
          data={recursosDB}
          loading={loading}
          searchable={true}
          searchPlaceholder="Buscar recurso..."
          onRowClick={onRecursoSelect}
          selectedRow={recursoSelected}
          rowKey="id_recurso"
          onCantidadChange={onCantidadChange}
          onAddMesesOperarios={onAddMesesOperarios}
          recursosStore={recursosStore}
        />
      </div>
    </div>
  );
};

export default VistaRecursos;
