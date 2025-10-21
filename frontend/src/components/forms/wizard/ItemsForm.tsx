import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Check, X } from 'lucide-react';
import { Especialidad } from '@/store/especialidad';
import { Unidad } from '@/store/unidad';
import { FormDataItem } from '@/store/item';

interface Props {
  selectedObra: any;
  editingItem: any;
  formData: FormDataItem;
  setFormData: (data: FormDataItem) => void;
  handleAddItem: () => void;
  handleUpdateItem: () => void;
  setEditingItem: (item: any) => void;

  // Especialidades
  especialidadInput: string;
  handleEspecialidadChange: (val: string) => void;
  handleEspecialidadKeyDown: (e: React.KeyboardEvent, items: Especialidad[]) => void;
  handleSelectEspecialidad: (nombre: string) => void;
  filteredEspecialidades: Especialidad[];
  showEspecialidadesSuggestions: boolean;
  setShowEspecialidadesSuggestions: (show: boolean) => void;
  selectedEspecialidadIndex: number;
  especialidadExists: boolean;
  setNewEspecialidad: (data: { nombre: string; descripcion: string }) => void;
  setShowAddEspecialidadModal: (v: boolean) => void;

  // Unidades
  unidadInput: string;
  handleUnidadChange: (val: string) => void;
  handleUnidadKeyDown: (e: React.KeyboardEvent, items: Unidad[]) => void;
  handleSelectUnidad: (nombre: string) => void;
  filteredUnidades: Unidad[];
  showUnidadesSuggestions: boolean;
  setShowUnidadesSuggestions: (show: boolean) => void;
  selectedUnidadIndex: number;
  unidadExists: boolean;
  setNewUnidad: (data: { nombre: string; simbolo: string; descripcion: string }) => void;
  setShowAddUnidadModal: (v: boolean) => void;
}

const ItemForm: React.FC<Props> = ({
  selectedObra,
  editingItem,
  formData,
  setFormData,
  handleAddItem,
  handleUpdateItem,
  setEditingItem,
  especialidadInput,
  handleEspecialidadChange,
  handleEspecialidadKeyDown,
  handleSelectEspecialidad,
  filteredEspecialidades,
  showEspecialidadesSuggestions,
  setShowEspecialidadesSuggestions,
  selectedEspecialidadIndex,
  especialidadExists,
  setNewEspecialidad,
  setShowAddEspecialidadModal,
  unidadInput,
  handleUnidadChange,
  handleUnidadKeyDown,
  handleSelectUnidad,
  filteredUnidades,
  showUnidadesSuggestions,
  setShowUnidadesSuggestions,
  selectedUnidadIndex,
  unidadExists,
  setNewUnidad,
  setShowAddUnidadModal,
}) => {
  if (!selectedObra) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {editingItem ? 'Editar Item' : 'Agregar Nuevo Item'}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Código */}
          <div className="space-y-2">
            <Label htmlFor="codigo">Código</Label>
            <Input
              id="codigo"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              placeholder="Ej: 1.1, 1.2.1, etc."
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion_tarea">Descripción de la Tarea *</Label>
            <Input
              id="descripcion_tarea"
              value={formData.descripcion_tarea}
              onChange={(e) => setFormData({ ...formData, descripcion_tarea: e.target.value })}
              placeholder="Descripción de la tarea"
            />
          </div>

          {/* Especialidad */}
          <div className="space-y-2 relative">
            <Label htmlFor="especialidad">Especialidad</Label>
            <Input
              id="especialidad"
              value={especialidadInput}
              onChange={(e) => handleEspecialidadChange(e.target.value)}
              onKeyDown={(e) => handleEspecialidadKeyDown(e, filteredEspecialidades)}
              onFocus={() => setShowEspecialidadesSuggestions(especialidadInput.length > 0)}
              onBlur={() => setTimeout(() => setShowEspecialidadesSuggestions(false), 200)}
              placeholder="Buscar o escribir especialidad..."
              autoComplete="off"
            />
            {showEspecialidadesSuggestions && (
              <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredEspecialidades.length > 0 ? (
                  <div className="py-1">
                    {filteredEspecialidades.map((esp, index) => (
                      <button
                        key={esp.id_especialidad}
                        onClick={() => handleSelectEspecialidad(esp.nombre)}
                        className={`w-full text-left px-4 py-2 text-white transition-colors ${
                          index === selectedEspecialidadIndex
                            ? 'bg-sky-600'
                            : 'hover:bg-slate-700'
                        }`}
                      >
                        {esp.nombre}
                        {esp.descripcion && (
                          <span className="text-xs text-slate-400 block">{esp.descripcion}</span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : especialidadInput.trim() && !especialidadExists ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-slate-400 mb-2">No se encontró la especialidad</p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setNewEspecialidad({ nombre: especialidadInput, descripcion: '' });
                        setShowAddEspecialidadModal(true);
                        setShowEspecialidadesSuggestions(false);
                      }}
                      className="bg-sky-600 hover:bg-sky-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar "{especialidadInput}"
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Unidad */}
          <div className="space-y-2 relative">
            <Label htmlFor="unidad">Unidad</Label>
            <Input
              id="unidad"
              value={unidadInput}
              onChange={(e) => handleUnidadChange(e.target.value)}
              onKeyDown={(e) => handleUnidadKeyDown(e, filteredUnidades)}
              onFocus={() => setShowUnidadesSuggestions(unidadInput.length > 0)}
              onBlur={() => setTimeout(() => setShowUnidadesSuggestions(false), 200)}
              placeholder="Buscar o escribir unidad..."
              autoComplete="off"
            />
            {showUnidadesSuggestions && (
              <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredUnidades.length > 0 ? (
                  <div className="py-1">
                    {filteredUnidades.map((uni, index) => (
                      <button
                        key={uni.id_unidad}
                        onClick={() => handleSelectUnidad(uni.nombre)}
                        className={`w-full text-left px-4 py-2 text-white transition-colors ${
                          index === selectedUnidadIndex
                            ? 'bg-sky-600'
                            : 'hover:bg-slate-700'
                        }`}
                      >
                        {uni.nombre} {uni.simbolo && <span className="text-slate-400">({uni.simbolo})</span>}
                        {uni.descripcion && (
                          <span className="text-xs text-slate-400 block">{uni.descripcion}</span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : unidadInput.trim() && !unidadExists ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-slate-400 mb-2">No se encontró la unidad</p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setNewUnidad({ nombre: unidadInput, simbolo: '', descripcion: '' });
                        setShowAddUnidadModal(true);
                        setShowUnidadesSuggestions(false);
                      }}
                      className="bg-sky-600 hover:bg-sky-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar "{unidadInput}"
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad</Label>
            <Input
              id="cantidad"
              type="number"
              value={formData.cantidad}
              onChange={(e) =>
                setFormData({ ...formData, cantidad: parseFloat(e.target.value) || 1 })
              }
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-2">
          {editingItem ? (
            <>
              <Button onClick={handleUpdateItem} disabled={!formData.descripcion_tarea.trim()}>
                <Check className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingItem(null);
                  setFormData({
                    codigo: '',
                    descripcion_tarea: '',
                    especialidad: '',
                    unidad: '',
                    cantidad: 1,
                  });
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </>
          ) : (
            <Button onClick={() => handleAddItem()} disabled={!formData.descripcion_tarea.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Item
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemForm;
