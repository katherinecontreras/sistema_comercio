import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSmartSearchProps<T> {
  items: T[];
  searchKey: string;
  onSelect: (item: T) => void;
  onAdd?: (value: string) => Promise<void>;
  minChars?: number;
}

export const useSmartSearch = <T extends Record<string, any>>({
  items,
  searchKey,
  onSelect,
  onAdd,
  minChars = 1
}: UseSmartSearchProps<T>) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<T[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Obtener sugerencias basadas en el input
  const getSuggestions = useCallback((value: string) => {
    if (value.length < minChars) {
      return [];
    }

    const searchValue = value.toLowerCase().trim();
    return items.filter(item => 
      item[searchKey]?.toLowerCase().includes(searchValue)
    );
  }, [items, searchKey, minChars]);

  // Manejar cambios en el input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    const newSuggestions = getSuggestions(value);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
    setSelectedIndex(-1);
  };

  // Seleccionar una sugerencia
  const handleSelect = (item: T) => {
    setInputValue(item[searchKey]);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    onSelect(item);
  };

  // Navegar con teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      // Si presiona Enter y hay un handler de agregar, y no hay sugerencias exactas
      if (e.key === 'Enter' && onAdd && inputValue.trim()) {
        e.preventDefault();
        const exactMatch = items.find(
          item => item[searchKey]?.toLowerCase() === inputValue.toLowerCase().trim()
        );
        if (!exactMatch) {
          handleAdd();
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        } else if (onAdd && inputValue.trim()) {
          handleAdd();
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Agregar nuevo item
  const handleAdd = async () => {
    if (!onAdd || !inputValue.trim() || isAdding) return;

    try {
      setIsAdding(true);
      await onAdd(inputValue.trim());
      setInputValue('');
      setShowSuggestions(false);
      setSuggestions([]);
    } catch (error) {
      console.error('Error agregando item:', error);
    } finally {
      setIsAdding(false);
    }
  };

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Limpiar input
  const clearInput = () => {
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  return {
    inputValue,
    setInputValue,
    suggestions,
    showSuggestions,
    selectedIndex,
    isAdding,
    inputRef,
    handleChange,
    handleSelect,
    handleKeyDown,
    handleAdd,
    getSuggestions,
    clearInput
  };
};

