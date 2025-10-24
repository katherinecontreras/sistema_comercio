import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useObraStore } from '@/store/obra';
import { getTiposTiempo } from '@/actions/obras';
import { getEspecialidades, addEspecialidad } from '@/actions/catalogos';
import { Plus } from 'lucide-react';

interface PartidaFormProps {
  onClose: () => void;
  partida?: any; // Para editar
  onPartidaCreated?: (partidaId: number) => void; // Callback para cuando se crea una nueva partida
}

const PartidaForm: React.FC<PartidaFormProps> = ({ onClose, partida, onPartidaCreated }) => {
  const { addPartida, updatePartida } = useObraStore();
  const [loading, setLoading] = useState(false);
  const [tiposTiempo, setTiposTiempo] = useState<any[]>([]);
  const [especialidades, setEspecialidades] = useState<any[]>([]);
  
  // Estados para inputs con autocompletado
  const [tipoTiempoInput, setTipoTiempoInput] = useState('');
  const [especialidadInput, setEspecialidadInput] = useState('');
  
  // Estados para sugerencias
  const [showTiposTiempoSuggestions, setShowTiposTiempoSuggestions] = useState(false);
  const [showEspecialidadesSuggestions, setShowEspecialidadesSuggestions] = useState(false);
  
  // Estados para índices seleccionados
  const [selectedTipoTiempoIndex, setSelectedTipoTiempoIndex] = useState(-1);
  const [selectedEspecialidadIndex, setSelectedEspecialidadIndex] = useState(-1);
  
  // Estados para modales de agregar
  const [showAddEspecialidadModal, setShowAddEspecialidadModal] = useState(false);
  const [showAddTipoTiempoModal, setShowAddTipoTiempoModal] = useState(false);
  const [newEspecialidad, setNewEspecialidad] = useState({ nombre: '', descripcion: '' });
  const [newTipoTiempo, setNewTipoTiempo] = useState({ nombre: '', medida: '' });
  
  const [formData, setFormData] = useState({
    nombre_partida: '',
    descripcion: '',
    codigo: '',
    duracion: 0,
    id_tipo_tiempo: '',
    especialidad: [] as any[]
  });

  // Filtrar opciones
  const filteredTiposTiempo = tiposTiempo.filter((tipo: any) => 
    tipo.nombre.toLowerCase().includes(tipoTiempoInput.toLowerCase())
  );
  const filteredEspecialidades = especialidades.filter((esp: any) => 
    esp.nombre.toLowerCase().includes(especialidadInput.toLowerCase())
  );

  // Verificar si existe
  const tipoTiempoExists = tiposTiempo.some((tipo: any) => tipo.nombre.toLowerCase() === tipoTiempoInput.toLowerCase());
  const especialidadExists = especialidades.some((esp: any) => esp.nombre.toLowerCase() === especialidadInput.toLowerCase());

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar especialidades primero (no requiere autenticación)
        const especialidadesData = await getEspecialidades();
        setEspecialidades(especialidadesData);
        
        // Cargar tipos de tiempo (requiere autenticación)
        const tipos = await getTiposTiempo();
        setTiposTiempo(tipos);
      } catch (error) {
        
        // Si falla tipos de tiempo, intentar cargar solo especialidades
        try {
          const especialidadesData = await getEspecialidades();
          setEspecialidades(especialidadesData);
        } catch (espError) {
          console.error('Error cargando especialidades:', espError);
        }
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
        // Actualizar partida existente
        updatePartida(partida.id_partida, partidaData);
      } else {
        // Crear nueva partida (solo en el store local por ahora)
        const nuevaPartida = {
          id_partida: Date.now(),
          nombre_partida: partidaData.nombre_partida,
          descripcion: partidaData.descripcion,
          codigo: partidaData.codigo,
          tiene_subpartidas: false,
          duracion: partidaData.duracion || 0,
          id_tipo_tiempo: partidaData.id_tipo_tiempo,
          especialidad: partidaData.especialidad || []
        };
        addPartida(nuevaPartida);
        
        // Llamar al callback para redireccionar a selección de planillas
        if (onPartidaCreated) {
          onPartidaCreated(nuevaPartida.id_partida);
        }
      }
      
      // Limpiar campos y cerrar modal
      setFormData({
        nombre_partida: '',
        descripcion: '',
        codigo: '',
        duracion: 0,
        id_tipo_tiempo: '',
        especialidad: []
      });
      setTipoTiempoInput('');
      onClose();
    } catch (error) {
      console.error('Error guardando partida:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers para especialidades
  const handleEspecialidadChange = (value: string) => {
    setEspecialidadInput(value);
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
      if (selectedEspecialidadIndex >= 0 && filtered[selectedEspecialidadIndex]) {
        handleSelectEspecialidad(filtered[selectedEspecialidadIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowEspecialidadesSuggestions(false);
    }
  };

  const handleSelectEspecialidad = (especialidad: any) => {
    setEspecialidadInput(especialidad.nombre);
    setFormData(prev => ({
      ...prev,
      especialidad: [...prev.especialidad, { especialidad: especialidad.id_especialidad, partida: '' }]
    }));
    setShowEspecialidadesSuggestions(false);
    setSelectedEspecialidadIndex(-1);
  };

  // Handlers para tipos de tiempo
  const handleTipoTiempoChange = (value: string) => {
    setTipoTiempoInput(value);
    setShowTiposTiempoSuggestions(value.length > 0);
    setSelectedTipoTiempoIndex(-1);
  };

  const handleTipoTiempoKeyDown = (e: React.KeyboardEvent, filtered: any[]) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedTipoTiempoIndex(prev => 
        prev < filtered.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedTipoTiempoIndex(prev => 
        prev > 0 ? prev - 1 : filtered.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedTipoTiempoIndex >= 0 && filtered[selectedTipoTiempoIndex]) {
        handleSelectTipoTiempo(filtered[selectedTipoTiempoIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowTiposTiempoSuggestions(false);
    }
  };

  const handleSelectTipoTiempo = (tipo: any) => {
    setTipoTiempoInput(tipo.nombre);
    setFormData(prev => ({ ...prev, id_tipo_tiempo: tipo.id_tipo_tiempo?.toString() || '' }));
    setShowTiposTiempoSuggestions(false);
    setSelectedTipoTiempoIndex(-1);
  };

  // Funciones para crear nuevas especialidades y tipos de tiempo
  const handleCreateEspecialidad = async () => {
    try {
      const nuevaEspecialidad = await addEspecialidad({
        nombre: newEspecialidad.nombre,
        descripcion: newEspecialidad.descripcion
      });
      
      // Actualizar la lista de especialidades
      setEspecialidades(prev => [...prev, nuevaEspecialidad]);
      
      // Seleccionar la nueva especialidad
      setEspecialidadInput(nuevaEspecialidad.nombre);
      setFormData(prev => ({
        ...prev,
        especialidad: [...prev.especialidad, { especialidad: nuevaEspecialidad.id_especialidad, partida: '' }]
      }));
      
      // Cerrar modal y limpiar
      setShowAddEspecialidadModal(false);
      setNewEspecialidad({ nombre: '', descripcion: '' });
    } catch (error) {
      console.error('Error creando especialidad:', error);
    }
  };

  const handleCreateTipoTiempo = async () => {
    try {
      // Por ahora, solo agregar a la lista local
      const nuevoTipo = {
        id_tipo_tiempo: Date.now(), // ID temporal
        nombre: newTipoTiempo.nombre,
        medida: newTipoTiempo.medida
      };
      
      // Actualizar la lista de tipos de tiempo
      setTiposTiempo(prev => [...prev, nuevoTipo]);
      
      // Seleccionar el nuevo tipo
      setTipoTiempoInput(nuevoTipo.nombre);
      setFormData(prev => ({ ...prev, id_tipo_tiempo: nuevoTipo.id_tipo_tiempo.toString() }));
      
      // Cerrar modal y limpiar
      setShowAddTipoTiempoModal(false);
      setNewTipoTiempo({ nombre: '', medida: '' });
    } catch (error) {
      console.error('Error creando tipo de tiempo:', error);
    }
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
              
              {/* Tipo de Tiempo */}
              <div className="space-y-2 relative">
                <Label htmlFor="tipo_tiempo" className="text-white">Tipo de Tiempo *</Label>
                <Input
                  id="tipo_tiempo"
                  value={tipoTiempoInput}
                  onChange={(e) => handleTipoTiempoChange(e.target.value)}
                  onKeyDown={(e) => handleTipoTiempoKeyDown(e, filteredTiposTiempo)}
                  onFocus={() => setShowTiposTiempoSuggestions(tipoTiempoInput.length > 0)}
                  onBlur={() => setTimeout(() => setShowTiposTiempoSuggestions(false), 200)}
                  placeholder="Buscar tipo de tiempo..."
                  autoComplete="off"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                {showTiposTiempoSuggestions && (
                  <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredTiposTiempo.length > 0 ? (
                      <div className="py-1">
                        {filteredTiposTiempo.map((tipo: any, index: number) => (
                          <button
                            key={tipo.id_tipo_tiempo}
                            onClick={() => handleSelectTipoTiempo(tipo)}
                            className={`w-full text-left px-4 py-2 text-white transition-colors ${
                              index === selectedTipoTiempoIndex
                                ? 'bg-sky-600'
                                : 'hover:bg-slate-700'
                            }`}
                          >
                            {tipo.nombre} ({tipo.medida})
                          </button>
                        ))}
                      </div>
                    ) : tipoTiempoInput.trim() && !tipoTiempoExists ? (
                      <div className="p-4 text-center">
                        <p className="text-sm text-slate-400 mb-2">No se encontró el tipo de tiempo</p>
                        <Button
                          size="sm"
                        onClick={() => {
                          setNewTipoTiempo({ nombre: tipoTiempoInput, medida: '' });
                          setShowAddTipoTiempoModal(true);
                          setShowTiposTiempoSuggestions(false);
                        }}
                          className="bg-sky-600 hover:bg-sky-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar "{tipoTiempoInput}"
                        </Button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Especialidades */}
            <div className="space-y-2 relative">
              <Label htmlFor="especialidad" className="text-white">Especialidad (Opcional)</Label>
              <Input
                id="especialidad"
                value={especialidadInput}
                onChange={(e) => handleEspecialidadChange(e.target.value)}
                onKeyDown={(e) => handleEspecialidadKeyDown(e, filteredEspecialidades)}
                onFocus={() => setShowEspecialidadesSuggestions(especialidadInput.length > 0)}
                onBlur={() => setTimeout(() => setShowEspecialidadesSuggestions(false), 200)}
                placeholder="Buscar o escribir especialidad..."
                autoComplete="off"
                className="bg-slate-700 border-slate-600 text-white"
              />
              {showEspecialidadesSuggestions && (
                <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredEspecialidades.length > 0 ? (
                    <div className="py-1">
                      {filteredEspecialidades.map((esp: any, index: number) => (
                        <button
                          key={esp.id_especialidad}
                          onClick={() => handleSelectEspecialidad(esp)}
                          className={`w-full text-left px-4 py-2 text-white transition-colors ${
                            index === selectedEspecialidadIndex
                              ? 'bg-sky-600'
                              : 'hover:bg-slate-700'
                          }`}
                        >
                          {esp.nombre}
                          {esp.descripcion && (
                            <span className="text-xs text-slate-400 block">{esp.descripcion}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : especialidadInput.trim() && !especialidadExists ? (
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

      {/* Modal para agregar especialidad */}
      {showAddEspecialidadModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100]">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Agregar Especialidad</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre_especialidad" className="text-white">Nombre *</Label>
                  <Input
                    id="nombre_especialidad"
                    value={newEspecialidad.nombre}
                    onChange={(e) => setNewEspecialidad(prev => ({ ...prev, nombre: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion_especialidad" className="text-white">Descripción</Label>
                  <Textarea
                    id="descripcion_especialidad"
                    value={newEspecialidad.descripcion}
                    onChange={(e) => setNewEspecialidad(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    onClick={() => setShowAddEspecialidadModal(false)}
                    variant="outline"
                    className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateEspecialidad}
                    disabled={!newEspecialidad.nombre.trim()}
                    className="bg-sky-600 hover:bg-sky-700"
                  >
                    Crear
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal para agregar tipo de tiempo */}
      {showAddTipoTiempoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100]">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Agregar Tipo de Tiempo</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre_tipo" className="text-white">Nombre *</Label>
                  <Input
                    id="nombre_tipo"
                    value={newTipoTiempo.nombre}
                    onChange={(e) => setNewTipoTiempo(prev => ({ ...prev, nombre: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="medida_tipo" className="text-white">Medida *</Label>
                  <Input
                    id="medida_tipo"
                    value={newTipoTiempo.medida}
                    onChange={(e) => setNewTipoTiempo(prev => ({ ...prev, medida: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="ej: hrs, días, meses"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    onClick={() => setShowAddTipoTiempoModal(false)}
                    variant="outline"
                    className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateTipoTiempo}
                    disabled={!newTipoTiempo.nombre.trim() || !newTipoTiempo.medida.trim()}
                    className="bg-sky-600 hover:bg-sky-700"
                  >
                    Crear
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

export default PartidaForm;