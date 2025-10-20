import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

interface ItemCosto {
  id: string;
  id_item_obra: string;
  id_recurso: number;
  cantidad: number;
  precio_unitario_aplicado: number;
  total_linea: number;
  recurso: {
    id_recurso: number;
    descripcion: string;
    unidad: string;
    costo_unitario_predeterminado: number;
  };
}

interface Item {
  id: string;
  codigo?: string;
  descripcion_tarea: string;
  [key: string]: any;
}

interface RecursosAsignadosListProps {
  items: Item[];
  itemCostos: ItemCosto[];
  selectedItem: string;
  onCantidadChange: (costoId: string, cantidad: number) => void;
  onPrecioChange: (costoId: string, precio: number) => void;
  onEliminarCosto: (costoId: string) => void;
}

export const RecursosAsignadosList: React.FC<RecursosAsignadosListProps> = ({
  items,
  itemCostos,
  selectedItem,
  onCantidadChange,
  onPrecioChange,
  onEliminarCosto
}) => {
  if (itemCostos.length === 0) return null;

  return (
    <Card className="bg-slate-800 border-slate-600">
      <CardHeader>
        <CardTitle className="text-white">Recursos Asignados por Item</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items
            .filter(item => itemCostos.some(c => c.id_item_obra === item.id))
            .map((item) => {
              const itemCostosFiltered = itemCostos.filter(c => c.id_item_obra === item.id);
              const totalItem = itemCostosFiltered.reduce((sum, c) => sum + c.total_linea, 0);
              const isSelected = selectedItem === item.id;

              return (
                <div 
                  key={item.id} 
                  className={`border rounded-lg ${
                    isSelected 
                      ? 'border-sky-500 bg-sky-900/10' 
                      : 'border-slate-600'
                  }`}
                >
                  {/* Header del item */}
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 border-b border-slate-600">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {item.codigo && (
                          <span className="text-xs font-mono bg-sky-900/50 text-sky-300 px-2 py-1 rounded">
                            {item.codigo}
                          </span>
                        )}
                        <span className="font-medium text-white">{item.descripcion_tarea}</span>
                      </div>
                      <div className="text-sm text-slate-400">
                        {itemCostosFiltered.length} recurso{itemCostosFiltered.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Total Item</div>
                      <div className="text-lg font-bold text-green-400">${totalItem.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Recursos del item */}
                  <div className="p-3 space-y-2">
                    {itemCostosFiltered.map((costo) => (
                      <div key={costo.id} className="flex items-center gap-4 p-3 bg-slate-700 rounded-lg border border-slate-600">
                        <div className="flex-1">
                          <div className="font-medium text-white">{costo.recurso.descripcion}</div>
                          <div className="text-sm text-slate-400">{costo.recurso.unidad}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20">
                            <Input
                              type="number"
                              value={costo.cantidad}
                              onChange={(e) => onCantidadChange(costo.id, parseFloat(e.target.value) || 1)}
                              min="0"
                              step="0.01"
                              className="h-8 text-xs bg-slate-600 border-slate-500 text-white"
                            />
                          </div>
                          <span className="text-slate-400">×</span>
                          <div className="w-24">
                            <Input
                              type="number"
                              value={costo.precio_unitario_aplicado}
                              onChange={(e) => onPrecioChange(costo.id, parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="h-8 text-xs bg-slate-600 border-slate-500 text-white"
                            />
                          </div>
                          <span className="text-slate-400">=</span>
                          <div className="text-sm font-medium text-green-400 w-24 text-right">
                            ${costo.total_linea.toFixed(2)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEliminarCosto(costo.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
};

