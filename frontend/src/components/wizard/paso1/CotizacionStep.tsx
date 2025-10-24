import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/app';
// import { createCotizacion } from '@/api/quotes';
// import { CotizacionData } from '@/store/cotizacion';


const CotizacionStep: React.FC = () => {
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CotizacionData>({
    codigo_proyecto: '',
    nombre_proyecto: '',
    descripcion_proyecto: '',
    fecha_creacion: new Date().toISOString().split('T')[0],
    fecha_entrega: '',
    fecha_recepcion: '',
    moneda: 'USD'
  });
  
  const { client, setStep, setActiveQuote, wizard, setQuoteFormData } = useAppStore();

  // Cargar datos existentes del estado global al montar
  useEffect(() => {
    if (wizard.quoteFormData.nombre_proyecto || wizard.quoteFormData.fecha_creacion) {
      setFormData({
        codigo_proyecto: wizard.quoteFormData.codigo_proyecto || '',
        nombre_proyecto: wizard.quoteFormData.nombre_proyecto || '',
        descripcion_proyecto: wizard.quoteFormData.descripcion_proyecto || '',
        fecha_creacion: wizard.quoteFormData.fecha_creacion || new Date().toISOString().split('T')[0],
        fecha_entrega: wizard.quoteFormData.fecha_entrega || '',
        fecha_recepcion: wizard.quoteFormData.fecha_recepcion || '',
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
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full mx-auto">
      <div className="grid grid-cols-5 grid-rows-5 gap-4">
        {/* Nombre del Proyecto */}
        <div>
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

        {/* Código del Proyecto */}
        <div>
          <Label htmlFor="codigo" className="text-slate-300">Código del Proyecto</Label>
          <Input
            id="codigo"
            value={formData.codigo_proyecto}
            onChange={(e) => setFormData({ ...formData, codigo_proyecto: e.target.value })}
            placeholder="Ej: PRY-2024-001"
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

        {/* Fecha Entrega */}
        <div className="row-start-2">
          <Label htmlFor="fecha_entrega" className="text-slate-300">Fecha de Entrega</Label>
          <Input
            id="fecha_entrega"
            type="date"
            value={formData.fecha_entrega}
            onChange={(e) => setFormData({ ...formData, fecha_entrega: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
        
        {/* Fecha Recepción */}
        <div className="row-start-2">
          <Label htmlFor="fecha_recepcion" className="text-slate-300">Fecha de Recepción</Label>
          <Input
            id="fecha_recepcion"
            type="date"
            value={formData.fecha_recepcion}
            onChange={(e) => setFormData({ ...formData, fecha_recepcion: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
        
        {/* Fecha Creación (Solo lectura) */}
        <div className="row-start-2">
          <Label htmlFor="fecha_creacion" className="text-slate-300">Fecha de Creación</Label>
          <Input
            id="fecha_creacion"
            type="date"
            value={formData.fecha_creacion}
            className=" text-slate-400 bg-transparent border-transparent cursor-not-allowed"
            disabled
            readOnly
          />
        </div>
        
        {/* Descripción del Proyecto */}
        <div className="col-span-3 row-start-3">
          <Label htmlFor="descripcion" className="text-slate-300">Descripción del Proyecto</Label>
          <textarea
            id="descripcion"
            value={formData.descripcion_proyecto}
            onChange={(e) => setFormData({ ...formData, descripcion_proyecto: e.target.value })}
            placeholder="Descripción breve del alcance del proyecto..."
            className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-white min-h-[80px] focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>
      {error && (
        <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
    </form>
  );
};

export default CotizacionStep;
