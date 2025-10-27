import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCatalogos } from '@/hooks/useCatalogos';
import { Plus } from 'lucide-react';

interface SmartSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: any[];
  onAddNew?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const SmartSelect: React.FC<SmartSelectProps> = ({
  label,
  value,
  onChange,
  options,
  onAddNew,
  placeholder = `Seleccionar ${label.toLowerCase()}`,
  required = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAddNew, setShowAddNew] = useState(false);

  const filteredOptions = options.filter(option =>
    option.nombre.toLowerCase().includes(value.toLowerCase())
  );

  const optionExists = options.some(option =>
    option.nombre.toLowerCase() === value.toLowerCase()
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(newValue.length > 0);
    setShowAddNew(newValue.length > 0 && !optionExists && onAddNew !== undefined);
  };

  const handleSelectOption = (option: any) => {
    onChange(option.nombre);
    setShowSuggestions(false);
    setShowAddNew(false);
  };

  const handleAddNew = () => {
    if (onAddNew && value.trim()) {
      onAddNew(value.trim());
      setShowSuggestions(false);
      setShowAddNew(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase()}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={label.toLowerCase()}
          value={value}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(value.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="w-full"
        />
        
        {showSuggestions && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectOption(option)}
              >
                {option.nombre}
              </div>
            ))}
            
            {showAddNew && (
              <div
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 cursor-pointer border-t border-gray-200 flex items-center gap-2"
                onClick={handleAddNew}
              >
                <Plus className="h-4 w-4 text-blue-600" />
                <span className="text-blue-600">Agregar "{value}"</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface PartidaBasicInfoProps {
  formData: any;
  setFormData: (data: any) => void;
}

const PartidaBasicInfo: React.FC<PartidaBasicInfoProps> = ({
  formData,
  setFormData
}) => {
  const { especialidades, tiposTiempo, loadEspecialidades, loadTiposTiempo, handleAddEspecialidad, handleAddTipoTiempo } = useCatalogos();

  useEffect(() => {
    loadEspecialidades();
    loadTiposTiempo();
  }, [loadEspecialidades, loadTiposTiempo]);

  const handleEspecialidadAdd = async (nombre: string) => {
    try {
      await handleAddEspecialidad({ nombre, descripcion: '' });
    } catch (error) {
      console.error('Error agregando especialidad:', error);
    }
  };

  const handleTipoTiempoAdd = async (nombre: string) => {
    try {
      const medida = nombre === 'horas' ? 'hrs' : 
                    nombre === 'días' ? 'ds' : 
                    nombre === 'meses' ? 'ms' : 
                    nombre === 'años' ? 'as' : 'un';
      await handleAddTipoTiempo({ nombre, medida });
    } catch (error) {
      console.error('Error agregando tipo de tiempo:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="nombre_partida">
          Nombre de la Partida <span className="text-red-500">*</span>
        </Label>
        <Input
          id="nombre_partida"
          value={formData.nombre_partida}
          onChange={(e) => setFormData({ ...formData, nombre_partida: e.target.value })}
          placeholder="Ej: Instalación de tuberías"
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="codigo">Código</Label>
        <Input
          id="codigo"
          value={formData.codigo}
          onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
          placeholder="Ej: PT-001"
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          placeholder="Descripción detallada de la partida"
          className="w-full"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duracion">Duración</Label>
          <Input
            id="duracion"
            type="number"
            value={formData.duracion}
            onChange={(e) => setFormData({ ...formData, duracion: parseFloat(e.target.value) || 0 })}
            placeholder="0"
            className="w-full"
          />
        </div>

        <SmartSelect
          label="Tipo de Tiempo"
          value={formData.tipoTiempoInput || ''}
          onChange={(value) => {
            const tipo = tiposTiempo.find(t => t.nombre === value);
            setFormData({ 
              ...formData, 
              id_tipo_tiempo: tipo?.id_tipo_tiempo || '',
              tipoTiempoInput: value 
            });
          }}
          options={tiposTiempo}
          onAddNew={handleTipoTiempoAdd}
          placeholder="Seleccionar tipo de tiempo"
        />
      </div>

      <SmartSelect
        label="Especialidad"
        value={formData.especialidadInput || ''}
        onChange={(value) => {
          const especialidad = especialidades.find(e => e.nombre === value);
          setFormData({ 
            ...formData, 
            especialidad: especialidad ? [especialidad] : [],
            especialidadInput: value 
          });
        }}
        options={especialidades}
        onAddNew={handleEspecialidadAdd}
        placeholder="Seleccionar especialidad"
      />
    </div>
  );
};

export default PartidaBasicInfo;
export { SmartSelect };