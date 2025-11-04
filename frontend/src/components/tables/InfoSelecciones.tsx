import { TipoRecurso } from "@/store/recurso/recursoStore";
import React from "react";

interface InfoSeleccionesProps {
  itemSelected: any;
  tipoRecursoSelected: TipoRecurso | null;
  recursoSelected: { descripcion: string } | null;
}

const InfoSelecciones: React.FC<InfoSeleccionesProps> = ({
  itemSelected,
  tipoRecursoSelected,
  recursoSelected,
}) => {
  if (!itemSelected) return null;

  return (
    <div className="px-6 mb-4">
      <div className="text-sm text-slate-300">
        <span className="font-semibold">Item seleccionado:</span> {itemSelected.descripcion}
      </div>
      {tipoRecursoSelected && (
        <div className="text-sm text-slate-300">
          <span className="font-semibold">Tipo de recurso:</span> {tipoRecursoSelected.descripcion}
        </div>
      )}
      {recursoSelected && (
        <div className="text-sm text-slate-300">
          <span className="font-semibold">Recurso:</span> {recursoSelected.descripcion}
        </div>
      )}
    </div>
  );
};

export default InfoSelecciones;