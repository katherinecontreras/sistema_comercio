import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SmartSelectItem {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface SmartSelectProps<T extends SmartSelectItem> {
  label: string;
  placeholder: string;
  items: T[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: T) => void;
  onAddNew?: (value: string) => void;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

const SmartSelect = <T extends SmartSelectItem>({
  label,
  placeholder,
  items,
  value,
  onChange,
  onSelect,
  onAddNew,
  required = false,
  className = '',
  disabled = false,
  loading = false
}: SmartSelectProps<T>) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar items basado en el valor del input
  const filteredItems = items.filter(item =>
    item.nombre.toLowerCase().includes(value.toLowerCase())
  );

  // Verificar si el item ya existe exactamente
  const itemExists = items.some(item => 
    item.nombre.toLowerCase() === value.toLowerCase()
  );

  // Handlers
  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    setShowSuggestions(inputValue.length > 0);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : filteredItems.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredItems[selectedIndex]) {
        handleSelectItem(filteredItems[selectedIndex]);
      } else if (value.trim() && !itemExists && onAddNew) {
        onAddNew(value.trim());
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSelectItem = (item: T) => {
    onChange(item.nombre);
    onSelect(item);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleFocus = () => {
    setShowSuggestions(value.length > 0);
  };

  const handleBlur = () => {
    // Delay para permitir clicks en las sugerencias
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  // Effect para manejar clicks fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`space-y-2 relative ${className}`} ref={inputRef}>
      <Label htmlFor={label} className="text-white">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <Input
        id={label}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled || loading}
        className="bg-slate-700 border-slate-600 text-white"
      />

      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredItems.length > 0 ? (
            <div className="py-1">
              {filteredItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`w-full text-left px-4 py-2 text-white transition-colors ${
                    index === selectedIndex
                      ? 'bg-sky-600'
                      : 'hover:bg-slate-700'
                  }`}
                >
                  {item.nombre}
                  {item.descripcion && (
                    <span className="text-xs text-slate-400 block">{item.descripcion}</span>
                  )}
                </button>
              ))}
            </div>
          ) : value.trim() && !itemExists && onAddNew ? (
            <div className="p-4 text-center">
              <p className="text-sm text-slate-400 mb-2">No se encontró "{value}"</p>
              <Button
                size="sm"
                onClick={() => {
                  onAddNew(value.trim());
                  setShowSuggestions(false);
                }}
                className="bg-sky-600 hover:bg-sky-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar "{value}"
              </Button>
            </div>
          ) : value.trim() ? (
            <div className="p-4 text-center">
              <p className="text-sm text-slate-400">No se encontraron resultados</p>
            </div>
          ) : null}
        </div>
      )}

      {loading && (
        <div className="absolute right-3 top-9 text-slate-400">
          <div className="animate-spin h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default SmartSelect;