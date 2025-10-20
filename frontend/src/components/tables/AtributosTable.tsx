import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface Atributo {
  id: string;
  nombre: string;
  tipo: 'texto' | 'numerico' | 'entero';
  requerido: boolean;
}

interface AtributosTableProps {
  atributos: Atributo[];
  atributosSeleccionados: Set<string>;
  onToggleAtributo: (id: string) => void;
  onDeleteAtributo: (id: string) => void;
}

export const AtributosTable: React.FC<AtributosTableProps> = ({
  atributos,
  atributosSeleccionados,
  onToggleAtributo,
  onDeleteAtributo
}) => {
  return (
    <div className="border border-slate-600 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-700">
          <tr>
            <th className="text-left p-3 text-white font-medium">Seleccionar</th>
            <th className="text-left p-3 text-white font-medium">Atributo</th>
            <th className="text-left p-3 text-white font-medium">Tipo</th>
            <th className="text-center p-3 text-white font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {atributos.map((attr) => {
            const isSelected = atributosSeleccionados.has(attr.id);
            const isRequired = attr.requerido || attr.id === 'costo_unitario';

            return (
              <tr 
                key={attr.id} 
                className={`border-t border-slate-600 transition-colors ${
                  isSelected ? 'bg-green-900/20' : 'bg-slate-800'
                }`}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => !isRequired && onToggleAtributo(attr.id)}
                    disabled={isRequired}
                    className="w-4 h-4 rounded cursor-pointer disabled:cursor-not-allowed"
                  />
                </td>
                <td className="p-3 text-white">
                  {attr.nombre}
                  {isRequired && <span className="text-red-400 ml-1">*</span>}
                </td>
                <td className="p-3 text-slate-300 capitalize">{attr.tipo}</td>
                <td className="p-3 text-center">
                  {!isRequired && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteAtributo(attr.id)}
                      className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

