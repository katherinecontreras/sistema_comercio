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
}

const ObrasStep: React.FC = () => {
  const { wizard, setStep, setObras } = useAppStore();
  const [obras, setObrasLocal] = useState<Obra[]>(wizard.obras);
  const [editingObra, setEditingObra] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  const handleAddObra = () => {
    if (formData.nombre.trim()) {
      const newObra: Obra = {
        id: generateTempId(),
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim()
      };
      const updatedObras = [...obras, newObra];
      setObrasLocal(updatedObras);
      setObras(updatedObras);
      setFormData({ nombre: '', descripcion: '' });
    }
  };

  const handleEditObra = (id: string) => {
    const obra = obras.find(o => o.id === id);
    if (obra) {
      setFormData({ nombre: obra.nombre, descripcion: obra.descripcion });
      setEditingObra(id);
    }
  };

  const handleUpdateObra = () => {
    if (editingObra && formData.nombre.trim()) {
      const updatedObras = obras.map(obra => 
        obra.id === editingObra 
          ? { ...obra, nombre: formData.nombre.trim(), descripcion: formData.descripcion.trim() }
          : obra
      );
      setObrasLocal(updatedObras);
      setObras(updatedObras);
      setFormData({ nombre: '', descripcion: '' });
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
              <Label htmlFor="nombre">Nombre de la Obra *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Satélite 3, Torre Principal, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción opcional de la obra"
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
                  setFormData({ nombre: '', descripcion: '' });
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
                <div key={obra.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{obra.nombre}</h4>
                    {obra.descripcion && (
                      <p className="text-sm text-muted-foreground">{obra.descripcion}</p>
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