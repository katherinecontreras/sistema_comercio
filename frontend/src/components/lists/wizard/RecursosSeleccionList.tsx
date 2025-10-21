import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Edit } from 'lucide-react';

interface Recurso {
  id_recurso: number;
  descripcion: string;
  unidad: string;
  costo_unitario_predeterminado: number;
  [key: string]: any;
}

interface RecursosSeleccionListProps {
  recursos: Recurso[];
  planillaNombre: string;
  searchTerm: string;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onSelectRecurso: (recurso: Recurso) => void;
  onAddManually: () => void;
  onClosePlanilla: () => void;
}

export const RecursosSeleccionList: React.FC<RecursosSeleccionListProps> = ({
  recursos,
  planillaNombre,
  searchTerm,
  loading,
  onSearchChange,
  onSelectRecurso,
  onAddManually,
  onClosePlanilla
}) => {
  const recursosFiltrados = recursos.filter(recurso =>
    recurso.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="bg-slate-800 border-slate-600">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span>Recursos: {planillaNombre}</span>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={onAddManually}
              className="bg-sky-600 hover:bg-sky-700 border-sky-500 text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Agregar Manualmente
            </Button>
            <Button 
              variant="outline" 
              onClick={onClosePlanilla}
              className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
            >
              Cerrar Planilla
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar recursos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white"
          />
        </div>

        {/* Lista de recursos */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-4 text-slate-400">Cargando recursos...</div>
          ) : recursosFiltrados.length === 0 ? (
            <div className="text-center py-4 text-slate-400">No hay recursos en esta planilla</div>
          ) : (
            recursosFiltrados.map((recurso) => (
              <div 
                key={recurso.id_recurso}
                onClick={() => onSelectRecurso(recurso)}
                className="flex items-center justify-between p-3 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer transition-colors border border-slate-600"
              >
                <div className="flex-1">
                  <div className="font-medium text-white">{recurso.descripcion}</div>
                  <div className="text-sm text-slate-400">
                    {recurso.unidad} - ${recurso.costo_unitario_predeterminado.toFixed(2)}
                  </div>
                </div>
                <Plus className="h-4 w-4 text-sky-400" />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};


export default RecursosSeleccionList;