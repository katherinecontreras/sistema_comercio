import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AtributosTable from '@/components/tables/AtributosTable';
import { AgregarAtributoForm } from '@/components/forms/wizard/AgregarAtributoForm';
import { AtributoBase } from '@/store/atributo';

interface ExcelAttributeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (atributos: AtributoBase[]) => void;
}

const STORAGE_KEY = 'excel_atributos_personalizados_v1';

// atributos base con id explícito
const atributosBase: AtributoBase[] = [
  { id: 'descripcion', nombre: 'Descripción', tipo: 'texto', base: true, requerido: true },
  { id: 'unidad', nombre: 'Unidad', tipo: 'texto', base: true, requerido: true },
  { id: 'cantidad', nombre: 'Cantidad', tipo: 'entero', base: true, requerido: true },
  { id: 'costo_unitario', nombre: 'Costo Unitario', tipo: 'numerico', base: true, requerido: true },
  { id: 'costo_total', nombre: 'Costo Total', tipo: 'numerico', base: true, requerido: false },
];

const ExcelAttributeModal: React.FC<ExcelAttributeModalProps> = ({ open, onClose, onConfirm }) => {
  const [atributos, setAtributos] = useState<AtributoBase[]>(atributosBase);
  // set de ids seleccionados (id strings)
  const [atributosSeleccionados, setAtributosSeleccionados] = useState<Set<string>>(
    new Set(atributosBase.filter(a => a.requerido || a.id === 'descripcion' || a.id === 'unidad').map(a => a.id))
  );
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!open) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const personalizados: AtributoBase[] = JSON.parse(stored);
        setAtributos([...atributosBase, ...personalizados]);
        // si querés preservar seleccionados guardados, podrías leer otro key; por ahora mantengo la lógica por defecto
      } catch (err) {
        console.error('error parseando atributos personalizados', err);
        setAtributos(atributosBase);
      }
    } else {
      setAtributos(atributosBase);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleAtributo = (id: string) => {
    // No permitir deseleccionar costo_unitario
    if (id === 'costo_unitario' && atributosSeleccionados.has(id)) return;

    setAtributosSeleccionados(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const agregarAtributo = (nuevo: { nombre: string; tipo: 'texto' | 'numerico' | 'entero' }) => {
    if (!nuevo.nombre.trim()) return;
    const id = nuevo.nombre.trim().toLowerCase().replace(/\s+/g, '_');
    const nuevoA: AtributoBase = {
      id,
      nombre: nuevo.nombre.trim(),
      tipo: nuevo.tipo,
      base: false,
      requerido: false,
    };
    setAtributos(prev => {
      const updated = [...prev, nuevoA];
      // guardar personalizados (solo los que no son base)
      const personalizados = updated.filter(a => !a.base);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(personalizados));
      return updated;
    });

    setAtributosSeleccionados(prev => new Set([...Array.from(prev), id]));
    setShowAddForm(false);
  };

  const eliminarAtributo = (id: string) => {
    const attr = atributos.find(a => a.id === id);
    if (!attr || attr.base) return;
    setAtributos(prev => {
      const updated = prev.filter(a => a.id !== id);
      const personalizados = updated.filter(a => !a.base);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(personalizados));
      return updated;
    });
    setAtributosSeleccionados(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleConfirm = () => {
    const seleccionados = atributos.filter(a => atributosSeleccionados.has(a.id));
    onConfirm(seleccionados);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-600 text-white w-[85vw] max-w-[1100px] h-auto max-h-[80vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-600">
          <DialogTitle className="text-xl">Seleccionar Atributos para Excel</DialogTitle>
          <DialogDescription className="text-slate-300 text-sm">
            Selecciona los atributos que deseas incluir en la plantilla.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <AtributosTable
            atributos={atributos}
            atributosSeleccionados={atributosSeleccionados}
            onToggleAtributo={toggleAtributo}
            eliminarAtributo={eliminarAtributo}
            extraForm={
              showAddForm ? (
                <AgregarAtributoForm
                  onAdd={agregarAtributo}
                  onCancel={() => setShowAddForm(false)}
                />
              ) : (
                <div className="pt-2">
                  <Button onClick={() => setShowAddForm(true)} className="w-full bg-sky-600 hover:bg-sky-700">
                    <Plus className="h-4 w-4 mr-2" /> Agregar Atributo Personalizado
                  </Button>
                </div>
              )
            }
          />

          <div className="mt-4 bg-sky-900/20 border border-sky-700 rounded-lg p-3">
            <p className="text-sm text-sky-300">
              <strong className="text-base">{atributos.filter(a => atributosSeleccionados.has(a.id)).length}</strong> atributos seleccionados
            </p>
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t border-slate-600 bg-slate-750">
          <div className="flex gap-2 w-full justify-end">
            <Button size="sm" variant="outline" onClick={onClose} className="bg-slate-700 hover:bg-slate-600 min-w-[100px]">
              Cancelar
            </Button>
            <Button size="sm" onClick={handleConfirm} disabled={atributos.filter(a => atributosSeleccionados.has(a.id)).length === 0} className="bg-sky-600 hover:bg-sky-700 min-w-[160px]">
              Confirmar y Continuar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelAttributeModal;
