import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useObraStore } from '@/store/obra';
import { getTiposTiempo } from '@/actions/obras';
import { getEspecialidades } from '@/actions/catalogos';

interface PartidaFormProps {
  onClose: () => void;
  partida?: any; // Para editar
}

const PartidaForm: React.FC<PartidaFormProps> = ({ onClose, partida }) => {
  const { addPartida, updatePartida } = useObraStore();
  const [loading, setLoading] = useState(false);
  const [tiposTiempo, setTiposTiempo] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [formData, setFormData] = useState({
    nombre_partida: '',
    descripcion: '',
    codigo: '',
    duracion: 0,
    id_tipo_tiempo: '',
    especialidad: [] as any[]
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tipos, especialidadesData] = await Promise.all([
          getTiposTiempo(),
          getEspecialidades()
        ]);
        setTiposTiempo(tipos);
        setEspecialidades(especialidadesData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };
    loadData();

    // Si es edición, cargar datos existentes
    if (partida) {
      setFormData({
        nombre_partida: partida.nombre_partida || '',
        descripcion: partida.descripcion || '',
        codigo: partida.codigo || '',
        duracion: partida.duracion || 0,
        id_tipo_tiempo: partida.id_tipo_tiempo?.toString() || '',
        especialidad: partida.especialidad || []
      });
    }
  }, [partida]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const partidaData = {
        ...formData,
        id_tipo_tiempo: formData.id_tipo_tiempo ? parseInt(formData.id_tipo_tiempo) : undefined,
        tiene_subpartidas: false
      };

      if (partida) {
        updatePartida(partida.id_partida, partidaData);
      } else {
        addPartida(partidaData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error guardando partida:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEspecialidad = () => {
    setFormData(prev => ({
      ...prev,
      especialidad: [...prev.especialidad, { especialidad: '', partida: '' }]
    }));
  };

  const removeEspecialidad = (index: number) => {
    setFormData(prev => ({
      ...prev,
      especialidad: prev.especialidad.filter((_, i) => i !== index)
    }));
  };

  const updateEspecialidad = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      especialidad: prev.especialidad.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            {partida ? 'Editar Partida' : 'Agregar Partida'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre_partida" className="text-white">Nombre de la Partida *</Label>
                <Input
                  id="nombre_partida"
                  value={formData.nombre_partida}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre_partida: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="codigo" className="text-white">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="descripcion" className="text-white">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duracion" className="text-white">Duración *</Label>
                <Input
                  id="duracion"
                  type="number"
                  step="0.01"
                  value={formData.duracion}
                  onChange={(e) => setFormData(prev => ({ ...prev, duracion: parseFloat(e.target.value) || 0 }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="tipo_tiempo" className="text-white">Tipo de Tiempo *</Label>
                <Select value={formData.id_tipo_tiempo} onValueChange={(value) => setFormData(prev => ({ ...prev, id_tipo_tiempo: value }))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Seleccionar tipo de tiempo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposTiempo.map((tipo: any) => (
                      <SelectItem key={tipo.id_tipo_tiempo} value={tipo.id_tipo_tiempo.toString()}>
                        {tipo.nombre} ({tipo.medida})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Especialidades */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-white">Especialidades</Label>
                <Button type="button" onClick={addEspecialidad} size="sm" className="bg-sky-600 hover:bg-sky-700">
                  Agregar Especialidad
                </Button>
              </div>
              
              {formData.especialidad.map((esp, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Select 
                    value={esp.especialidad} 
                    onValueChange={(value) => updateEspecialidad(index, 'especialidad', value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Seleccionar especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {especialidades.map((especialidad: any) => (
                        <SelectItem key={especialidad.id_especialidad} value={especialidad.id_especialidad.toString()}>
                          {especialidad.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    type="button" 
                    onClick={() => removeEspecialidad(index)}
                    size="sm" 
                    variant="destructive"
                  >
                    X
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" onClick={onClose} variant="outline" className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-white">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-sky-600 hover:bg-sky-700">
                {loading ? 'Guardando...' : (partida ? 'Actualizar' : 'Crear')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default PartidaForm;