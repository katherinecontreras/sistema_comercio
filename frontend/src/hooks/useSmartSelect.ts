import { useState, useCallback } from 'react';

interface SmartSelectItem {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface UseSmartSelectOptions<T extends SmartSelectItem> {
  items: T[];
  onSelect: (item: T) => void;
  onAddNew?: (value: string) => void;
  initialValue?: string;
}

export const useSmartSelect = <T extends SmartSelectItem>({
  items,
  onSelect,
  onAddNew,
  initialValue = ''
}: UseSmartSelectOptions<T>) => {
  const [inputValue, setInputValue] = useState(initialValue);

  const handleChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleSelect = useCallback((item: T) => {
    setInputValue(item.nombre);
    onSelect(item);
  }, [onSelect]);

  const handleAddNew = useCallback((value: string) => {
    if (onAddNew) {
      onAddNew(value);
      setInputValue(''); // Limpiar después de agregar
    }
  }, [onAddNew]);

  const clearValue = useCallback(() => {
    setInputValue('');
  }, []);

  const setValue = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  return {
    inputValue,
    handleChange,
    handleSelect,
    handleAddNew,
    clearValue,
    setValue,
    // Props para el componente SmartSelect
    smartSelectProps: {
      value: inputValue,
      onChange: handleChange,
      onSelect: handleSelect,
      onAddNew: onAddNew ? handleAddNew : undefined,
      items
    }
  };
};

export default useSmartSelect;



