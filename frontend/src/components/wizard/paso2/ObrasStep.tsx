import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit2 } from 'lucide-react';
import { useAppStore } from '@/store/app';
import { generateTempId } from '@/utils/idGenerator';
import { Obra } from '@/store/obra';
import ObraForm from '@/components/forms/wizard/ObraForm';


const ObrasStep: React.FC = () => {
  const { wizard, setObras } = useAppStore();
  const [obras, setObrasLocal] = useState<Obra[]>(wizard.obras);
  const [editingObra, setEditingObra] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
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
      setShowForm(false); // Ocultar formulario después de agregar
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
      setShowForm(true); // Mostrar formulario al editar
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
      setShowForm(false); // Ocultar formulario después de actualizar
    }
  };

  const handleDeleteObra = (id: string) => {
    const updatedObras = obras.filter(obra => obra.id !== id);
    setObrasLocal(updatedObras);
    setObras(updatedObras);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Definir Obras</h3>
          <p className="text-muted-foreground">Agrega las obras que componen esta cotización</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {obras.length} obra{obras.length !== 1 ? 's' : ''} agregada{obras.length !== 1 ? 's' : ''}
          </div>
          <Button 
            onClick={() => {
              setShowForm(!showForm);
              setEditingObra(null);
              setFormData({ nombre: '', descripcion: '', ubicacion: '' });
            }}
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            {showForm ? 'Cancelar' : 'Agregar Obra'}
          </Button>
        </div>
      </div>

      {/* Formulario para agregar/editar obra - Solo visible cuando showForm es true */}
      {showForm && (
        <ObraForm
          formData={formData}
          setFormData={setFormData}
          editingObra={editingObra}
          setEditingObra={setEditingObra}
          handleAddObra={handleAddObra}
          handleUpdateObra={handleUpdateObra}
        />
      )}


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