import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useAppStore } from '@/store/app';
import { generateTempId } from '@/utils/idGenerator';

interface Obra {
  id: string;
  nombre: string;
  descripcion: string;
  ubicacion?: string;
}

const ObrasStep: React.FC = () => {
  const { wizard, setObras } = useAppStore();
  const [obras, setObrasLocal] = useState<Obra[]>(wizard.obras);
  const [editingObra, setEditingObra] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    ubicacion: ''
  });

  const handleAddObra = () => {
    if (formData.nombre.trim()) {
      const newObra: Obra = {
        id: generateTempId(),
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        ubicacion: formData.ubicacion.trim()
      };
      const updatedObras = [...obras, newObra];
      setObrasLocal(updatedObras);
      setObras(updatedObras);
      setFormData({ nombre: '', descripcion: '', ubicacion: '' });
    }
  };

  const handleEditObra = (id: string) => {
    const obra = obras.find(o => o.id === id);
    if (obra) {
      setFormData({ 
        nombre: obra.nombre, 
        descripcion: obra.descripcion,
        ubicacion: obra.ubicacion || ''
      });
      setEditingObra(id);
    }
  };

  const handleUpdateObra = () => {
    if (editingObra && formData.nombre.trim()) {
      const updatedObras = obras.map(obra => 
        obra.id === editingObra 
          ? { 
              ...obra, 
              nombre: formData.nombre.trim(), 
              descripcion: formData.descripcion.trim(),
              ubicacion: formData.ubicacion.trim()
            }
          : obra
      );
      setObrasLocal(updatedObras);
      setObras(updatedObras);
      setFormData({ nombre: '', descripcion: '', ubicacion: '' });
      setEditingObra(null);
    }
  };

  const handleDeleteObra = (id: string) => {
    const updatedObras = obras.filter(obra => obra.id !== id);
    setObrasLocal(updatedObras);
    setObras(updatedObras);
  };

  const handleContinue = () => {
    if (obras.length > 0) {
      // Guardar obras en el store
      setStep('items');
    }
  };

  const handleBack = () => {
    setStep('datos');
  };

  return (
    <div className="space-y-6">
      {/* Botones de navegación */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          ← Anterior
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={obras.length === 0}
        >
          Continuar →
        </Button>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Definir Obras</h3>
          <p className="text-muted-foreground">Agrega las obras que componen esta cotización</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {obras.length} obra{obras.length !== 1 ? 's' : ''} agregada{obras.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Formulario para agregar/editar obra */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {editingObra ? 'Editar Obra' : 'Agregar Nueva Obra'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-slate-300">Nombre de la Obra *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Satélite 3, Torre Principal, etc."
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ubicacion" className="text-slate-300">Ubicación</Label>
              <Input
                id="ubicacion"
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                placeholder="Ej: CABA, Buenos Aires, etc."
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descripcion" className="text-slate-300">Descripción</Label>
              <textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción opcional de la obra"
                className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-white min-h-[80px] focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {editingObra ? (
              <>
                <Button onClick={handleUpdateObra} disabled={!formData.nombre.trim()}>
                  <Check className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
                <Button variant="outline" onClick={() => {
                  setEditingObra(null);
                  setFormData({ nombre: '', descripcion: '', ubicacion: '' });
                }}>
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

      {/* Lista de obras agregadas */}
      {obras.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Obras Agregadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {obras.map((obra) => (
                <div key={obra.id} className="flex items-center justify-between p-3 border border-slate-600 rounded-lg bg-slate-700/50">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{obra.nombre}</h4>
                    {obra.ubicacion && (
                      <p className="text-sm text-sky-400">📍 {obra.ubicacion}</p>
                    )}
                    {obra.descripcion && (
                      <p className="text-sm text-slate-400">{obra.descripcion}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditObra(obra.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteObra(obra.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ObrasStep;