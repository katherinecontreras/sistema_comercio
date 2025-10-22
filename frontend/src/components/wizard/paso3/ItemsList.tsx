import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit2, ChevronRight, ChevronDown } from 'lucide-react';
import { ItemObra } from '@/store/obra';

interface ItemsListProps {
  items: ItemObra[];
  obras: Array<{ id: string; nombre: string }>;
  onEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

export const ItemsList: React.FC<ItemsListProps> = ({
  items,
  obras,
  onEditItem,
  onDeleteItem,
  onToggleExpand
}) => {
  const getObraName = (obraId: string) => {
    const obra = obras.find(o => o.id === obraId);
    return obra?.nombre || 'Obra no encontrada';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Items Agregados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="border border-slate-600 rounded-lg bg-slate-700/50">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleExpand(item.id)}
                    className="p-1"
                  >
                    {item.expanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">
                        {item.codigo && `${item.codigo} - `}{item.descripcion_tarea}
                      </h4>
                    </div>
                    <div className="text-sm text-slate-400 mt-1">
                      📍 {getObraName(item.id_obra)}
                      {item.especialidad && ` • ${item.especialidad}`}
                      {item.unidad && ` • ${item.unidad}`}
                      {item.cantidad > 0 && ` • Cantidad: ${item.cantidad}`}
                      {item.precio_unitario > 0 && ` • Precio: $${item.precio_unitario}`}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditItem(item.id)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {item.expanded && (
                <div className="border-t border-slate-600 p-3 bg-slate-800/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Código:</span>
                      <span className="ml-2 text-white">{item.codigo || 'Sin código'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Especialidad:</span>
                      <span className="ml-2 text-white">{item.especialidad || 'Sin especialidad'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Unidad:</span>
                      <span className="ml-2 text-white">{item.unidad || 'Sin unidad'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Cantidad:</span>
                      <span className="ml-2 text-white">{item.cantidad}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Precio Unitario:</span>
                      <span className="ml-2 text-white">${item.precio_unitario}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Nivel:</span>
                      <span className="ml-2 text-white">{item.nivel}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

