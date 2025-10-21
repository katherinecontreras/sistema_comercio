import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileSpreadsheet } from 'lucide-react';

interface TipoRecurso {
  id_tipo_recurso: number;
  nombre: string;
  icono?: string;
}

interface PlanillasListProps {
  tiposRecurso: TipoRecurso[];
  selectedPlanilla: number | null;
  onSelectPlanilla: (id: number) => void;
  onAddPlanilla: () => void;
}

export const PlanillasList: React.FC<PlanillasListProps> = ({
  tiposRecurso,
  selectedPlanilla,
  onSelectPlanilla,
  onAddPlanilla
}) => {
  return (
    <Card className="bg-slate-800 border-slate-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Seleccionar Planilla de Recursos</CardTitle>
          <Button
            size="sm"
            onClick={onAddPlanilla}
            className="bg-sky-600 hover:bg-sky-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Nueva Planilla
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {tiposRecurso.map((tipo) => {
            const IconComponent = FileSpreadsheet;
            return (
              <Button
                key={tipo.id_tipo_recurso}
                variant={selectedPlanilla === tipo.id_tipo_recurso ? "default" : "outline"}
                onClick={() => onSelectPlanilla(tipo.id_tipo_recurso)}
                className={`h-20 flex flex-col items-center justify-center ${
                  selectedPlanilla === tipo.id_tipo_recurso
                    ? 'bg-sky-500 border-sky-400'
                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                }`}
              >
                <IconComponent className="h-6 w-6 mb-2" />
                <span className="text-sm">{tipo.nombre}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};


export default PlanillasList;