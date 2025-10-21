// AtributosTable.tsx
import React from 'react';
import { Check, X } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AtributoSeleccionable } from '@/store/atributo';

interface AtributoTableProps {
  atributos: AtributoSeleccionable[]; // lista completa (id, nombre, tipo, base, requerido)
  atributosSeleccionados: Set<string>; // set de ids
  onToggleAtributo: (id: string) => void; // ahora recibe id
  eliminarAtributo?: (id: string) => void;
  extraForm?: React.ReactNode;
}

const AtributosTable: React.FC<AtributoTableProps> = ({
  atributos,
  atributosSeleccionados,
  onToggleAtributo,
  eliminarAtributo,
  extraForm,
}) => {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%]">Atributo</TableHead>
            <TableHead className="w-[20%]">Tipo</TableHead>
            <TableHead className="text-center w-[20%]">Estado</TableHead>
            <TableHead className="text-center w-[25%]">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {atributos.map((attr) => {
            const isSelected = atributosSeleccionados.has(attr.id);
            return (
              <TableRow
                key={attr.id}
                className={cn({
                  'bg-green-900/20 hover:bg-green-900/30': isSelected,
                })}
              >
                <TableCell className="font-medium">{attr.nombre}</TableCell>
                <TableCell className="capitalize">{attr.tipo}</TableCell>
                <TableCell className="text-center">
                  {isSelected ? (
                    <div className="inline-flex items-center gap-1.5 text-green-400">
                      <Check className="h-4 w-4" />
                      <span className="text-xs font-medium">Seleccionado</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">No</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant={isSelected ? 'outline' : 'default'}
                      onClick={() => onToggleAtributo(attr.id)}
                      className={isSelected ? 'bg-slate-600 hover:bg-slate-500' : 'bg-green-600 hover:bg-green-700'}
                    >
                      {isSelected ? (
                        <>
                          <X className="h-3.5 w-3.5 mr-1" /> Quitar
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1" /> Agregar
                        </>
                      )}
                    </Button>

                    {!attr.base && eliminarAtributo && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => eliminarAtributo(attr.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        title="Eliminar"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" />
                        {/* puedes seguir usando Trash2 si querés */}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {extraForm && <div>{extraForm}</div>}
    </div>
  );
};

export default AtributosTable;
