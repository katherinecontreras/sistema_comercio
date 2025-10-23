import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus } from 'lucide-react';
import { getEspecialidades, addEspecialidad } from '@/actions/catalogos';

interface SubPartidaFormProps {
  partidaId: number;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const SubPartidaForm: React.FC<SubPartidaFormProps> = ({ partidaId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion_tarea: '',
    id_especialidad: ''
  });

  const [especialidades, setEspecialidades] = useState<any[]>([]);
  const [especialidadInput, setEspecialidadInput] = useState('');
  const [showEspecialidadesSuggestions, setShowEspecialidadesSuggestions] = useState(false);
  const [filteredEspecialidades, setFilteredEspecialidades] = useState<any[]>([]);
  const [selectedEspecialidadIndex, setSelectedEspecialidadIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  // Estados para modal de agregar especialidad
  const [showAddEspecialidadModal, setShowAddEspecialidadModal] = useState(false);
  const [newEspecialidad, setNewEspecialidad] = useState({ nombre: '', descripcion: '' });

  useEffect(() => {
    cargarEspecialidades();
  }, []);

  const cargarEspecialidades = async () => {
    try {
      const especialidadesData = await getEspecialidades();
      setEspecialidades(especialidadesData);
      setFilteredEspecialidades(especialidadesData);
    } catch (error) {
      console.error('Error cargando especialidades:', error);
    }
  };

  // Funciones para manejar especialidades
  const handleEspecialidadChange = (value: string) => {
    setEspecialidadInput(value);
    setFormData({ ...formData, id_especialidad: value });
    
    const filtered = especialidades.filter(esp => 
      esp.nombre.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredEspecialidades(filtered);
    setShowEspecialidadesSuggestions(value.length > 0);
    setSelectedEspecialidadIndex(-1);
  };

  const handleEspecialidadKeyDown = (e: React.KeyboardEvent, filtered: any[]) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedEspecialidadIndex(prev => 
        prev < filtered.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedEspecialidadIndex(prev => 
        prev > 0 ? prev - 1 : filtered.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedEspecialidadIndex >= 0 && selectedEspecialidadIndex < filtered.length) {
        handleSelectEspecialidad(filtered[selectedEspecialidadIndex].nombre);
      }
    } else if (e.key === 'Escape') {
      setShowEspecialidadesSuggestions(false);
    }
  };

  const handleSelectEspecialidad = (nombre: string) => {
    setEspecialidadInput(nombre);
    setFormData({ ...formData, id_especialidad: nombre });
    setShowEspecialidadesSuggestions(false);
    setSelectedEspecialidadIndex(-1);
  };

  const handleCreateEspecialidad = async () => {
    if (!newEspecialidad.nombre.trim()) return;
    
    setLoading(true);
    try {
      const nuevaEspecialidad = await addEspecialidad({
        nombre: newEspecialidad.nombre,
        descripcion: newEspecialidad.descripcion
      });
      
      setEspecialidades(prev => [...prev, nuevaEspecialidad]);
      setEspecialidadInput(nuevaEspecialidad.nombre);
      setFormData({ ...formData, id_especialidad: nuevaEspecialidad.nombre });
      setShowAddEspecialidadModal(false);
      setNewEspecialidad({ nombre: '', descripcion: '' });
    } catch (error) {
      console.error('Error creando especialidad:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subpartidaData = {
      ...formData,
      id_partida: partidaId,
      id_especialidad: formData.id_especialidad ? 
        especialidades.find(esp => esp.nombre === formData.id_especialidad)?.id_especialidad : null
    };
    onSave(subpartidaData);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Agregar SubPartida</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="codigo" className="text-white">Código</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Código de la subpartida (opcional)"
              />
            </div>

            <div>
              <Label htmlFor="descripcion_tarea" className="text-white">Descripción de la Tarea *</Label>
              <Textarea
                id="descripcion_tarea"
                value={formData.descripcion_tarea}
                onChange={(e) => setFormData({...formData, descripcion_tarea: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Descripción detallada de la tarea"
                required
                rows={3}
              />
            </div>

            {/* Especialidad */}
            <div className="space-y-2 relative">
              <Label htmlFor="especialidad" className="text-white">Especialidad</Label>
              <Input
                id="especialidad"
                value={especialidadInput}
                onChange={(e) => handleEspecialidadChange(e.target.value)}
                onKeyDown={(e) => handleEspecialidadKeyDown(e, filteredEspecialidades)}
                onFocus={() => setShowEspecialidadesSuggestions(especialidadInput.length > 0)}
                onBlur={() => setTimeout(() => setShowEspecialidadesSuggestions(false), 200)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Buscar o escribir especialidad..."
                autoComplete="off"
              />
              {showEspecialidadesSuggestions && (
                <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredEspecialidades.length > 0 ? (
                    <div className="py-1">
                      {filteredEspecialidades.map((esp, index) => (
                        <button
                          key={esp.id_especialidad}
                          onClick={() => handleSelectEspecialidad(esp.nombre)}
                          className={`w-full text-left px-4 py-2 text-white transition-colors ${
                            index === selectedEspecialidadIndex ? 'bg-sky-600' : 'hover:bg-slate-700'
                          }`}
                        >
                          {esp.nombre}
                          {esp.descripcion && (
                            <span className="text-xs text-slate-400 block">{esp.descripcion}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : especialidadInput.trim() ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-slate-400 mb-2">No se encontró la especialidad</p>
                      <Button
                        size="sm"
                        onClick={() => {
                          setNewEspecialidad({ nombre: especialidadInput, descripcion: '' });
                          setShowAddEspecialidadModal(true);
                          setShowEspecialidadesSuggestions(false);
                        }}
                        className="bg-sky-600 hover:bg-sky-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar "{especialidadInput}"
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-700">
                Agregar SubPartida
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Modal para agregar especialidad */}
      {showAddEspecialidadModal && (
        <div className="fixed inset-0 z-[200] grid place-items-center bg-black/60">
          <Card className="w-full max-w-sm bg-slate-800 border-slate-700">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Agregar Especialidad</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddEspecialidadModal(false);
                    setNewEspecialidad({ nombre: '', descripcion: '' });
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre" className="text-white">Nombre</Label>
                  <Input
                    id="nombre"
                    value={newEspecialidad.nombre}
                    onChange={(e) => setNewEspecialidad({...newEspecialidad, nombre: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Nombre de la especialidad"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="descripcion" className="text-white">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={newEspecialidad.descripcion}
                    onChange={(e) => setNewEspecialidad({...newEspecialidad, descripcion: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Descripción de la especialidad"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleCreateEspecialidad}
                    disabled={loading || !newEspecialidad.nombre.trim()}
                    className="flex-1 bg-sky-600 hover:bg-sky-700"
                  >
                    {loading ? 'Creando...' : 'Crear'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddEspecialidadModal(false);
                      setNewEspecialidad({ nombre: '', descripcion: '' });
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SubPartidaForm;