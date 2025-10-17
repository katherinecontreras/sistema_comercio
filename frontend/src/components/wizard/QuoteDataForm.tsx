import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/app';
import { createCotizacion } from '@/api/quotes';

interface QuoteData {
  nombre_proyecto: string;
  fecha_creacion: string;
}

const QuoteDataForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<QuoteData>({
    nombre_proyecto: '',
    fecha_creacion: new Date().toISOString().split('T')[0]
  });
  
  const { client, setStep, setActiveQuote, wizard, setQuoteFormData } = useAppStore();

  // Cargar datos existentes del estado global al montar
  useEffect(() => {
    if (wizard.quoteFormData.nombre_proyecto || wizard.quoteFormData.fecha_creacion) {
      setFormData(wizard.quoteFormData);
    }
  }, []);

  // Persistir datos cuando cambien (con debounce para evitar loops)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.nombre_proyecto || formData.fecha_creacion) {
        setQuoteFormData(formData);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [formData, setQuoteFormData]);

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
        nombre_proyecto: formData.nombre_proyecto,
        fecha_creacion: formData.fecha_creacion,
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
          value={formData.nombre_proyecto}
          onChange={(e) => setFormData({ ...formData, nombre_proyecto: e.target.value })}
          placeholder="Ej: Proyecto Satélite 3"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="fecha">Fecha de Creación</Label>
        <Input
          id="fecha"
          type="date"
          value={formData.fecha_creacion}
          onChange={(e) => setFormData({ ...formData, fecha_creacion: e.target.value })}
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
