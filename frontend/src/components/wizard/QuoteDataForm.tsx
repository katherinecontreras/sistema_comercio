import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/app';
import { createCotizacion } from '@/api/quotes';

const QuoteDataForm: React.FC = () => {
  const [nombre_proyecto, setNombre] = useState('');
  const [fecha_creacion, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { client, setStep, setActiveQuote } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client.selectedClientId) {
      setError('Debe seleccionar un cliente primero');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cotizacion = await createCotizacion({
        id_cliente: client.selectedClientId,
        nombre_proyecto,
        fecha_creacion,
      });
      
      setActiveQuote(cotizacion.id_cotizacion);
      setStep('obras');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al crear cotización');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div>
        <Label htmlFor="nombre">Nombre del Proyecto</Label>
        <Input
          id="nombre"
          value={nombre_proyecto}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Proyecto Satélite 3"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="fecha">Fecha de Creación</Label>
        <Input
          id="fecha"
          type="date"
          value={fecha_creacion}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Continuar'}
        </Button>
      </div>
    </form>
  );
};

export default QuoteDataForm;
