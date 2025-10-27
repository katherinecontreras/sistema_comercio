import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useObraStore } from '@/store/obra';
import { useAppStore } from '@/store/app';

const ObraForm: React.FC = () => {
  const { setObra } = useObraStore();
  const { client } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    codigo_proyecto: '',
    nombre_proyecto: '',
    descripcion_proyecto: '',
    fecha_creacion: new Date().toISOString().split('T')[0],
    fecha_entrega: '',
    fecha_recepcion: '',
    moneda: 'ARS',
    // Campos de resumen (se llenarán automáticamente)
    total_partidas: 0,
    total_subpartidas: 0,
    total_costo_obra_sin_incremento: 0,
    total_costo_obra_con_incrementos: 0,
    total_duracion_obra: 0,
    total_incrementos: 0,
    costos_partidas: null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!client.selectedClientId) {
        throw new Error('No hay cliente seleccionado');
      }
      setObra({
        ...formData,
        id_cliente: client.selectedClientId,
        estado: 'borrador'
      });
    } catch (error) {
      console.error('Error creando obra:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-800 border-slate-700">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Crear Oferta de Obra</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre_proyecto" className="text-white">Nombre del Proyecto *</Label>
                <Input
                  id="nombre_proyecto"
                  value={formData.nombre_proyecto}
                  onChange={(e) => setFormData({...formData, nombre_proyecto: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="codigo_proyecto" className="text-white">Código del Proyecto</Label>
                <Input
                  id="codigo_proyecto"
                  value={formData.codigo_proyecto}
                  onChange={(e) => setFormData({...formData, codigo_proyecto: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="descripcion_proyecto" className="text-white">Descripción del Proyecto</Label>
              <textarea
                id="descripcion_proyecto"
                value={formData.descripcion_proyecto}
                onChange={(e) => setFormData({...formData, descripcion_proyecto: e.target.value})}
                className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Describe el proyecto..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fecha_creacion" className="text-white">Fecha de Creación *</Label>
                <Input
                  id="fecha_creacion"
                  type="date"
                  value={formData.fecha_creacion}
                  onChange={(e) => setFormData({...formData, fecha_creacion: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="fecha_entrega" className="text-white">Fecha de Entrega</Label>
                <Input
                  id="fecha_entrega"
                  type="date"
                  value={formData.fecha_entrega}
                  onChange={(e) => setFormData({...formData, fecha_entrega: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="fecha_recepcion" className="text-white">Fecha de Recepción</Label>
                <Input
                  id="fecha_recepcion"
                  type="date"
                  value={formData.fecha_recepcion}
                  onChange={(e) => setFormData({...formData, fecha_recepcion: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="moneda" className="text-white">Moneda</Label>
              <select
                id="moneda"
                value={formData.moneda}
                onChange={(e) => setFormData({...formData, moneda: e.target.value})}
                className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="ARS">ARS - Peso Argentino</option>
                <option value="USD">USD - Dólar Americano</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="bg-sky-600 hover:bg-sky-700 text-white"
              >
                {loading ? 'Creando...' : 'Continuar'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ObraForm;
