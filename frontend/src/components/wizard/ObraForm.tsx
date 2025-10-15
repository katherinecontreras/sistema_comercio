import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createObra } from '@/api/obras';

interface Props {
  id_cotizacion: number;
  onCreated: () => void;
}

const ObraForm: React.FC<Props> = ({ id_cotizacion, onCreated }) => {
  const [nombre_obra, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createObra({
        id_cotizacion,
        nombre_obra,
        descripcion,
      });
      
      setNombre('');
      setDescripcion('');
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al crear obra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
      <h4 className="font-semibold">Agregar Nueva Obra</h4>
      
      <div>
        <Label htmlFor="nombre_obra">Nombre de la Obra</Label>
        <Input
          id="nombre_obra"
          value={nombre_obra}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Satélite 3"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="descripcion">Descripción</Label>
        <Input
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción opcional"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Agregando...' : 'Agregar Obra'}
        </Button>
      </div>
    </form>
  );
};

export default ObraForm;
