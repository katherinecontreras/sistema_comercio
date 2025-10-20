import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Trash2, Package } from 'lucide-react';

interface Atributo {
  id: string;
  nombre: string;
  tipo: 'texto' | 'numerico' | 'entero';
  requerido: boolean;
}

interface RecursoLocal {
  id: string;
  datos: Record<string, any>;
}

interface RecursosAgregadosTableProps {
  recursos: RecursoLocal[];
  atributos: Atributo[];
  atributosSeleccionados: Set<string>;
  editingRecursoId: string | null;
  onEdit: (recurso: RecursoLocal) => void;
  onDelete: (id: string) => void;
}

export const RecursosAgregadosTable: React.FC<RecursosAgregadosTableProps> = ({
  recursos,
  atributos,
  atributosSeleccionados,
  editingRecursoId,
  onEdit,
  onDelete
}) => {
  const totales = {
    cantidadRecursos: recursos.length,
    sumaCantidades: recursos.reduce((sum, r) => sum + (parseFloat(r.datos.cantidad) || 0), 0),
    totalCosto: recursos.reduce((sum, r) => sum + (parseFloat(r.datos.costo_total) || 0), 0)
  };

  if (recursos.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white">Recursos Agregados (0)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-400">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay recursos agregados aún</p>
            <p className="text-sm">Completa el formulario y agrega recursos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-600">
      <CardHeader>
        <CardTitle className="text-white">Recursos Agregados ({recursos.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tabla de recursos */}
          <div className="border border-slate-600 rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-700 sticky top-0">
                  <tr>
                    <th className="text-center p-2 text-white font-medium">Acciones</th>
                    {atributos
                      .filter(attr => atributosSeleccionados.has(attr.id))
                      .map(attr => (
                        <th key={attr.id} className="text-left p-2 text-white font-medium">
                          {attr.nombre}
                        </th>
                      ))}
                    <th className="text-right p-2 text-white font-medium">Costo Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recursos.map((recurso) => (
                    <tr 
                      key={recurso.id}
                      className={`border-t border-slate-600 transition-colors ${
                        editingRecursoId === recurso.id
                          ? 'bg-sky-900/30'
                          : 'hover:bg-slate-700/50'
                      }`}
                    >
                      <td className="p-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(recurso)}
                            className="h-8 w-8 p-0"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4 text-sky-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(recurso.id)}
                            className="h-8 w-8 p-0"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </td>
                      {atributos
                        .filter(attr => atributosSeleccionados.has(attr.id))
                        .map(attr => (
                          <td key={attr.id} className="p-2 text-white">
                            {recurso.datos[attr.id] || '-'}
                          </td>
                        ))}
                      <td className="p-2 text-right">
                        <span className="font-semibold text-green-400">
                          ${(parseFloat(recurso.datos.costo_total) || 0).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card de Resumen */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-base text-white">Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-sky-400">{totales.cantidadRecursos}</div>
                  <div className="text-xs text-slate-400">Recursos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">{Math.round(totales.sumaCantidades)}</div>
                  <div className="text-xs text-slate-400">Cantidad Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">${totales.totalCosto.toFixed(2)}</div>
                  <div className="text-xs text-slate-400">Costo Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

