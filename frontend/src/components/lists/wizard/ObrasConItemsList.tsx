import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

interface Item {
  id: string;
  codigo?: string;
  descripcion_tarea: string;
  [key: string]: any;
}

interface ObraWithItems {
  obra: {
    id: string;
    nombre: string;
    [key: string]: any;
  };
  items: Item[];
  totalRecursos: number;
  totalCosto: number;
}

interface ObrasConItemsListProps {
  obrasWithItems: ObraWithItems[];
  selectedItem: string;
  collapsedObras: Set<string>;
  isObraComplete: (obraId: string) => boolean;
  itemHasResources: (itemId: string) => boolean;
  getItemRecursoCount: (itemId: string) => number;
  getItemTotalCosto: (itemId: string) => number;
  onSelectItem: (itemId: string) => void;
  onToggleObraCollapse: (obraId: string) => void;
}

export const ObrasConItemsList: React.FC<ObrasConItemsListProps> = ({
  obrasWithItems,
  selectedItem,
  collapsedObras,
  isObraComplete,
  itemHasResources,
  getItemRecursoCount,
  getItemTotalCosto,
  onSelectItem,
  onToggleObraCollapse
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {obrasWithItems
        .sort((a, b) => {
          const aComplete = isObraComplete(a.obra.id);
          const bComplete = isObraComplete(b.obra.id);
          if (aComplete && !bComplete) return 1;
          if (!aComplete && bComplete) return -1;
          return 0;
        })
        .map(({ obra, items, totalRecursos, totalCosto }) => {
          const isComplete = isObraComplete(obra.id);
          const isCollapsed = collapsedObras.has(obra.id);

          return (
            <Card 
              key={obra.id}
              className={`transition-all ${
                isComplete 
                  ? 'bg-green-900/30 border-green-500/50' 
                  : 'bg-slate-800 border-slate-600'
              }`}
            >
              <CardHeader 
                className="cursor-pointer"
                onClick={() => isComplete && onToggleObraCollapse(obra.id)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {isComplete && <Check className="h-5 w-5 text-green-500" />}
                    {obra.nombre}
                  </CardTitle>
                  {isComplete && (
                    isCollapsed ? 
                      <ChevronDown className="h-5 w-5 text-slate-400" /> : 
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                {isComplete && isCollapsed && (
                  <div className="text-sm text-slate-400 mt-2">
                    <div>{items.length} item{items.length !== 1 ? 's' : ''}</div>
                    <div>{totalRecursos} recurso{totalRecursos !== 1 ? 's' : ''}</div>
                    <div className="font-semibold text-green-400">
                      ${totalCosto.toFixed(2)}
                    </div>
                  </div>
                )}
              </CardHeader>
              
              {(!isComplete || !isCollapsed) && (
                <CardContent className="space-y-2">
                  {items.map(item => {
                    const hasResources = itemHasResources(item.id);
                    const isSelected = selectedItem === item.id;
                    const recursoCount = getItemRecursoCount(item.id);
                    const totalCostoItem = getItemTotalCosto(item.id);

                    return (
                      <Button
                        key={item.id}
                        variant="outline"
                        className={`w-full justify-between ${
                          isSelected 
                            ? 'bg-sky-500 border-sky-400 text-white' 
                            : hasResources
                            ? 'bg-green-600/20 border-green-500/50 text-green-100'
                            : 'bg-slate-700 border-slate-600 text-white'
                        } hover:opacity-80`}
                        onClick={() => onSelectItem(item.id)}
                      >
                        <span className="truncate">{item.descripcion_tarea}</span>
                        {hasResources && (
                          <div className="flex items-center gap-2 text-xs">
                            <span>{recursoCount} rec.</span>
                            <span className="font-semibold">${totalCostoItem.toFixed(2)}</span>
                          </div>
                        )}
                      </Button>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          );
        })}
    </div>
  );
};


export default ObrasConItemsList;