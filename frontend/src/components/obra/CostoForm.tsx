import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useObraStore } from '@/store/obra';

interface CostoFormProps {
  onClose: () => void;
  costo?: any; // Para editar
  idPartida?: number;
  idSubPartida?: number;
}

const CostoForm: React.FC<CostoFormProps> = ({ onClose, costo, idPartida, idSubPartida }) => {
  const { addCostoPartida, addCostoSubPartida, updateCostoPartida, updateCostoSubPartida } = useObraStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_recurso: 0,
    cantidad: 0,
    precio_unitario_aplicado: 0,
    total_linea: 0,
    porcentaje_de_uso: 0,
    tiempo_de_uso: 0
  });

  useEffect(() => {
    if (costo) {
      setFormData({
        id_recurso: costo.id_recurso || 0,
        cantidad: costo.cantidad || 0,
        precio_unitario_aplicado: costo.precio_unitario_aplicado || 0,
        total_linea: costo.total_linea || 0,
        porcentaje_de_uso: costo.porcentaje_de_uso || 0,
        tiempo_de_uso: costo.tiempo_de_uso || 0
      });
    }
  }, [costo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const costoData = {
        ...formData,
        total_linea: formData.cantidad * formData.precio_unitario_aplicado
      };

      if (costo) {
        if (idPartida) {
          updateCostoPartida(costo.id_costo, costoData);
        } else if (idSubPartida) {
          updateCostoSubPartida(costo.id_costo, costoData);
        }
      } else {
        if (idPartida) {
          addCostoPartida({ ...costoData, id_partida: idPartida });
        } else if (idSubPartida) {
          addCostoSubPartida({ ...costoData, id_subpartida: idSubPartida });
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Error guardando costo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePorcentajeChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      porcentaje_de_uso: value,
      tiempo_de_uso: (value / 100) * (prev.cantidad || 1) // Ajustar según duración de partida
    }));
  };

  const handleTiempoChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      tiempo_de_uso: value,
      porcentaje_de_uso: (value / (prev.cantidad || 1)) * 100 // Ajustar porcentaje
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg bg-slate-800 border-slate-700">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            {costo ? 'Editar Costo' : 'Agregar Costo'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="id_recurso" className="text-white">ID Recurso *</Label>
              <Input
                id="id_recurso"
                type="number"
                value={formData.id_recurso}
                onChange={(e) => setFormData(prev => ({ ...prev, id_recurso: parseInt(e.target.value) || 0 }))}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cantidad" className="text-white">Cantidad *</Label>
                <Input
                  id="cantidad"
                  type="number"
                  step="0.01"
                  value={formData.cantidad}
                  onChange={(e) => setFormData(prev => ({ ...prev, cantidad: parseFloat(e.target.value) || 0 }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="precio_unitario" className="text-white">Precio Unitario *</Label>
                <Input
                  id="precio_unitario"
                  type="number"
                  step="0.01"
                  value={formData.precio_unitario_aplicado}
                  onChange={(e) => setFormData(prev => ({ ...prev, precio_unitario_aplicado: parseFloat(e.target.value) || 0 }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="porcentaje_uso" className="text-white">Porcentaje de Uso (%)</Label>
                <Input
                  id="porcentaje_uso"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.porcentaje_de_uso}
                  onChange={(e) => handlePorcentajeChange(parseFloat(e.target.value) || 0)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="tiempo_uso" className="text-white">Tiempo de Uso</Label>
                <Input
                  id="tiempo_uso"
                  type="number"
                  step="0.01"
                  value={formData.tiempo_de_uso}
                  onChange={(e) => handleTiempoChange(parseFloat(e.target.value) || 0)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="total_linea" className="text-white">Total Línea</Label>
              <Input
                id="total_linea"
                type="number"
                step="0.01"
                value={formData.total_linea}
                readOnly
                className="bg-slate-600 border-slate-500 text-white"
              />
              <p className="text-sm text-slate-400 mt-1">
                Calculado automáticamente: Cantidad × Precio Unitario
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" onClick={onClose} variant="outline" className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-white">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-sky-600 hover:bg-sky-700">
                {loading ? 'Guardando...' : (costo ? 'Actualizar' : 'Crear')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default CostoForm;
