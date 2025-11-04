import { TipoRecurso } from "@/store/recurso/recursoStore";
import React, { useRef, useEffect } from "react";
import RecursosTable from "@/components/tables/RecursosTable";

interface VistaTiposProps {
  tiposRecursoDB: TipoRecurso[];
  tiposCompletos: Set<number>;
  tipoRecursoSelected: TipoRecurso | null;
  loading: boolean;
  onTipoSelect: (tipo: TipoRecurso) => void;
  onDeselect: () => void;
}

const VistaTipos: React.FC<VistaTiposProps> = ({
  tiposRecursoDB,
  tiposCompletos,
  tipoRecursoSelected,
  loading,
  onTipoSelect,
  onDeselect,
}) => {
  // Ref para la tabla completa
  const tableRef = useRef<HTMLDivElement>(null);

  // Effect para detectar clicks fuera de la tabla y deseleccionar
  useEffect(() => {
    if (!tipoRecursoSelected) return; // No hacer nada si no hay selección

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
  }, [tipoRecursoSelected, onDeselect]);

  return (
    <div className="px-6 py-4">
      <div ref={tableRef}>
        <RecursosTable
          view="tipos"
          data={tiposRecursoDB}
          loading={loading}
          searchable={true}
          searchPlaceholder="Buscar tipo de recurso..."
          onRowClick={onTipoSelect}
          selectedRow={tipoRecursoSelected}
          rowKey="id_tipo_recurso"
          tiposCompletos={tiposCompletos}
        />
      </div>
    </div>
  );
};

export default VistaTipos;
