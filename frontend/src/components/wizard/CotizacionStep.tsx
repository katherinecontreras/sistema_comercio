import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/app';
import { createCotizacion } from '@/api/quotes';

interface CotizacionData {
  nombre_proyecto: string;
  descripcion_proyecto: string;
  fecha_creacion: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  moneda: string;
}

const CotizacionStep: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CotizacionData>({
    nombre_proyecto: '',
    descripcion_proyecto: '',
    fecha_creacion: new Date().toISOString().split('T')[0],
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
    moneda: 'USD'
  });
  
  const { client, setStep, setActiveQuote, wizard, setQuoteFormData } = useAppStore();

  // Cargar datos existentes del estado global al montar
  useEffect(() => {
    if (wizard.quoteFormData.nombre_proyecto || wizard.quoteFormData.fecha_creacion) {
      setFormData({
        nombre_proyecto: wizard.quoteFormData.nombre_proyecto || '',
        descripcion_proyecto: wizard.quoteFormData.descripcion_proyecto || '',
        fecha_creacion: wizard.quoteFormData.fecha_creacion || new Date().toISOString().split('T')[0],
        fecha_inicio: wizard.quoteFormData.fecha_inicio || '',
        fecha_vencimiento: wizard.quoteFormData.fecha_vencimiento || '',
        moneda: wizard.quoteFormData.moneda || 'USD'
      });
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre del Proyecto */}
        <div className="md:col-span-2">
          <Label htmlFor="nombre" className="text-slate-300">Nombre del Proyecto *</Label>
          <Input
            id="nombre"
            value={formData.nombre_proyecto}
            onChange={(e) => setFormData({ ...formData, nombre_proyecto: e.target.value })}
            placeholder="Ej: Proyecto Satélite 3"
            className="bg-slate-700 border-slate-600 text-white"
            required
          />
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <Label htmlFor="descripcion" className="text-slate-300">Descripción del Proyecto</Label>
          <textarea
            id="descripcion"
            value={formData.descripcion_proyecto}
            onChange={(e) => setFormData({ ...formData, descripcion_proyecto: e.target.value })}
            placeholder="Descripción breve del alcance del proyecto..."
            className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Fecha Creación */}
        <div>
          <Label htmlFor="fecha_creacion" className="text-slate-300">Fecha de Creación *</Label>
          <Input
            id="fecha_creacion"
            type="date"
            value={formData.fecha_creacion}
            onChange={(e) => setFormData({ ...formData, fecha_creacion: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white"
            required
          />
        </div>

        {/* Fecha Inicio */}
        <div>
          <Label htmlFor="fecha_inicio" className="text-slate-300">Fecha de Inicio</Label>
          <Input
            id="fecha_inicio"
            type="date"
            value={formData.fecha_inicio}
            onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        {/* Fecha Vencimiento */}
        <div>
          <Label htmlFor="fecha_vencimiento" className="text-slate-300">Fecha de Vencimiento</Label>
          <Input
            id="fecha_vencimiento"
            type="date"
            value={formData.fecha_vencimiento}
            onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        {/* Moneda */}
        <div>
          <Label htmlFor="moneda" className="text-slate-300">Moneda *</Label>
          <select
            id="moneda"
            value={formData.moneda}
            onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
            className="w-full h-10 px-3 rounded-md bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
          >
            <option value="USD">USD - Dólar Estadounidense</option>
            <option value="ARS">ARS - Peso Argentino</option>
            <option value="EUR">EUR - Euro</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-sky-600 hover:bg-sky-700 text-white px-8"
        >
          {loading ? 'Guardando...' : 'Continuar'}
        </Button>
      </div>
    </form>
  );
};

export default CotizacionStep;
