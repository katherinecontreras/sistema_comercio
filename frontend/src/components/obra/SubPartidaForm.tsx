import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface SubPartidaFormProps {
  partidaId: number;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const SubPartidaForm: React.FC<SubPartidaFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion_tarea: '',
    cantidad: 1,
    precio_unitario: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Agregar SubPartida</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="codigo" className="text-white">Código</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="descripcion_tarea" className="text-white">Descripción de la Tarea *</Label>
              <textarea
                id="descripcion_tarea"
                value={formData.descripcion_tarea}
                onChange={(e) => setFormData({...formData, descripcion_tarea: e.target.value})}
                className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-white min-h-[80px] focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Describe la tarea..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cantidad" className="text-white">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  step="0.01"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({...formData, cantidad: parseFloat(e.target.value) || 0})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="precio_unitario" className="text-white">Precio Unitario</Label>
                <Input
                  id="precio_unitario"
                  type="number"
                  step="0.01"
                  value={formData.precio_unitario}
                  onChange={(e) => setFormData({...formData, precio_unitario: parseFloat(e.target.value) || 0})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white"
              >
                Guardar
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default SubPartidaForm;
