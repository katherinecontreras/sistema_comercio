import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Plus, Trash2 } from 'lucide-react';

interface Atributo {
  nombre: string;
  tipo: 'texto' | 'numerico' | 'entero';
  base: boolean; // Si es un atributo base (no se puede eliminar)
  selected: boolean;
}

interface ExcelAttributeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (atributos: Atributo[]) => void;
}

const STORAGE_KEY = 'excel_atributos_personalizados';

const ExcelAttributeModal: React.FC<ExcelAttributeModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const atributosBase: Atributo[] = [
    { nombre: 'descripcion', tipo: 'texto', base: true, selected: true },
    { nombre: 'unidad', tipo: 'texto', base: true, selected: true },
    { nombre: 'cantidad', tipo: 'entero', base: true, selected: true },
    { nombre: 'costo_unitario', tipo: 'numerico', base: true, selected: true },
    { nombre: 'costo_total', tipo: 'numerico', base: true, selected: false },
  ];

  const [atributos, setAtributos] = useState<Atributo[]>(atributosBase);
  const [showAddForm, setShowAddForm] = useState(false);
  const [nuevoAtributo, setNuevoAtributo] = useState<{ nombre: string; tipo: 'texto' | 'numerico' | 'entero' }>({ nombre: '', tipo: 'texto' });

  // Cargar atributos personalizados desde localStorage al abrir el modal
  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const personalizados: Atributo[] = JSON.parse(stored);
          setAtributos([...atributosBase, ...personalizados]);
        } catch (error) {
          console.error('Error cargando atributos personalizados:', error);
          setAtributos(atributosBase);
        }
      } else {
        setAtributos(atributosBase);
      }
    }
  }, [open]);

  const toggleAtributo = (index: number) => {
    setAtributos(prev =>
      prev.map((a, i) => (i === index ? { ...a, selected: !a.selected } : a))
    );
  };

  const agregarAtributo = () => {
    if (!nuevoAtributo.nombre.trim()) return;

    const nuevo: Atributo = {
      nombre: nuevoAtributo.nombre.trim().toLowerCase().replace(/\s+/g, '_'),
      tipo: nuevoAtributo.tipo,
      base: false,
      selected: true,
    };

    const nuevosAtributos = [...atributos, nuevo];
    setAtributos(nuevosAtributos);
    
    // Guardar atributos personalizados en localStorage
    const personalizados = nuevosAtributos.filter(a => !a.base);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(personalizados));
    
    setNuevoAtributo({ nombre: '', tipo: 'texto' });
    setShowAddForm(false);
  };

  const eliminarAtributo = (index: number) => {
    const attr = atributos[index];
    if (attr.base) return; // No se pueden eliminar atributos base
    
    const nuevosAtributos = atributos.filter((_, i) => i !== index);
    setAtributos(nuevosAtributos);
    
    // Actualizar localStorage
    const personalizados = nuevosAtributos.filter(a => !a.base);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(personalizados));
  };

  const handleConfirm = () => {
    const seleccionados = atributos.filter(a => a.selected);
    onConfirm(seleccionados);
  };

  const getNombreFormateado = (nombre: string) => {
    return nombre
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
          <div className="space-y-4">
            {/* Tabla visual de atributos */}
            <div className="bg-slate-700 border border-slate-600 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-600 border-b border-slate-500">
                      <th className="text-left py-2.5 px-4 text-slate-200 font-semibold w-[35%]">
                        Atributo
                      </th>
                      <th className="text-left py-2.5 px-4 text-slate-200 font-semibold w-[20%]">
                        Tipo
                      </th>
                      <th className="text-center py-2.5 px-4 text-slate-200 font-semibold w-[20%]">
                        Estado
                      </th>
                      <th className="text-center py-2.5 px-4 text-slate-200 font-semibold w-[25%]">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {atributos.map((attr, index) => (
                      <tr
                        key={index}
                        className={`border-b border-slate-600 transition-all hover:bg-slate-600/30 ${
                          attr.selected ? 'bg-green-900/20' : 'bg-slate-800/30'
                        }`}
                      >
                        <td className="py-2.5 px-4">
                          <span className="font-medium text-white">
                            {getNombreFormateado(attr.nombre)}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="text-slate-300 capitalize">{attr.tipo}</span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {attr.selected ? (
                            <div className="inline-flex items-center gap-1.5 text-green-400">
                              <Check className="h-4 w-4" />
                              <span className="text-xs font-medium">Seleccionado</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">No</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant={attr.selected ? 'outline' : 'default'}
                              onClick={() => toggleAtributo(index)}
                              className={`min-w-[85px] h-8 ${
                                attr.selected
                                  ? 'bg-slate-600 hover:bg-slate-500 border-slate-500'
                                  : 'bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {attr.selected ? (
                                <>
                                  <X className="h-3.5 w-3.5 mr-1" />
                                  Quitar
                                </>
                              ) : (
                                <>
                                  <Check className="h-3.5 w-3.5 mr-1" />
                                  Agregar
                                </>
                              )}
                            </Button>
                            {!attr.base && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => eliminarAtributo(index)}
                                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Formulario para agregar nuevo atributo */}
            {showAddForm ? (
              <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                <h3 className="text-base font-semibold text-white mb-3">Agregar Atributo Personalizado</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Nombre del Atributo</Label>
                    <Input
                      value={nuevoAtributo.nombre}
                      onChange={(e) =>
                        setNuevoAtributo({ ...nuevoAtributo, nombre: e.target.value })
                      }
                      placeholder="Ej: Marca, Modelo..."
                      autoFocus
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Tipo</Label>
                    <select
                      value={nuevoAtributo.tipo}
                      onChange={(e) =>
                        setNuevoAtributo({
                          ...nuevoAtributo,
                          tipo: e.target.value as 'texto' | 'numerico' | 'entero',
                        })
                      }
                      className="flex h-9 w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                    >
                      <option value="texto">Texto</option>
                      <option value="numerico">Numérico</option>
                      <option value="entero">Entero</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={agregarAtributo}
                    disabled={!nuevoAtributo.nombre.trim()}
                    className="bg-sky-600 hover:bg-sky-700"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Agregar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setNuevoAtributo({ nombre: '', tipo: 'texto' });
                    }}
                    className="bg-slate-600 hover:bg-slate-500 border-slate-500"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowAddForm(true)}
                className="w-full h-9 bg-slate-700 hover:bg-slate-600 border-slate-600 text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Atributo Personalizado
              </Button>
            )}

            {/* Resumen */}
            <div className="bg-sky-900/20 border border-sky-700 rounded-lg p-3">
              <p className="text-sm text-sky-300">
                <strong className="text-base">{atributos.filter(a => a.selected).length}</strong> atributos seleccionados
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t border-slate-600 bg-slate-750">
          <div className="flex gap-2 w-full justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 border-slate-600 min-w-[100px]"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={atributos.filter(a => a.selected).length === 0}
              className="bg-sky-600 hover:bg-sky-700 min-w-[160px]"
            >
              Confirmar y Continuar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelAttributeModal;

