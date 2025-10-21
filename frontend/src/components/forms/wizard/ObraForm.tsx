import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Check, X } from 'lucide-react';
import { ObraFormProps } from '@/store/obra';

const ObraForm: React.FC<ObraFormProps> = ({
  formData,
  setFormData,
  editingObra,
  setEditingObra,
  handleAddObra,
  handleUpdateObra,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {editingObra ? 'Editar Obra' : 'Agregar Nueva Obra'}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-slate-300">
              Nombre de la Obra *
            </Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Satélite 3, Torre Principal, etc."
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          {/* Ubicación */}
          <div className="space-y-2">
            <Label htmlFor="ubicacion" className="text-slate-300">
              Ubicación
            </Label>
            <Input
              id="ubicacion"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              placeholder="Ej: CABA, Buenos Aires, etc."
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="descripcion" className="text-slate-300">
              Descripción
            </Label>
            <textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción opcional de la obra"
              className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-white min-h-[80px] focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-2">
          {editingObra ? (
            <>
              <Button onClick={handleUpdateObra} disabled={!formData.nombre.trim()}>
                <Check className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingObra(null);
                  setFormData({ nombre: '', descripcion: '', ubicacion: '' });
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </>
          ) : (
            <Button onClick={handleAddObra} disabled={!formData.nombre.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Obra
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ObraForm;
