import { TipoRecurso } from "@/store/recurso/recursoStore";
import { ChevronRight } from "lucide-react";
import React from "react";

type ViewType = 'tipos' | 'recursos' | 'meses_operarios';

interface BreadcrumbsProps {
  view: ViewType;
  tipoRecursoSelected: TipoRecurso | null;
  onNavigate: (index: number) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ view, tipoRecursoSelected, onNavigate }) => {
  const getBreadcrumbs = () => {
    const breadcrumbs = ['seleccion'];
    if (tipoRecursoSelected) {
      breadcrumbs.push(tipoRecursoSelected.descripcion.replace(/\s+/g, '_'));
    }
    if (view === 'recursos' || view === 'meses_operarios') {
      breadcrumbs.push('recursos');
    }
    if (view === 'meses_operarios') {
      breadcrumbs.push('meses_operarios');
    }
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="px-6 mb-4">
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="h-4 w-4 text-slate-400" />}
            <button
              onClick={() => onNavigate(index)}
              className={`${
                index === breadcrumbs.length - 1
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-white cursor-pointer'
              }`}
            >
              {crumb}
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Breadcrumbs