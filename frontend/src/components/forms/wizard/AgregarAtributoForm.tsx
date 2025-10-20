import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

interface AgregarAtributoFormProps {
  onAdd: (atributo: { nombre: string; tipo: 'texto' | 'numerico' | 'entero' }) => void;
  onCancel: () => void;
}

export const AgregarAtributoForm: React.FC<AgregarAtributoFormProps> = ({
  onAdd,
  onCancel
}) => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'texto' | 'numerico' | 'entero'>('texto');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim()) {
      onAdd({ nombre: nombre.trim(), tipo });
      setNombre('');
      setTipo('texto');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="attr-nombre" className="text-slate-300">Nombre del Atributo</Label>
          <Input
            id="attr-nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Color, Marca, etc."
            className="bg-slate-600 border-slate-500 text-white"
            autoFocus
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="attr-tipo" className="text-slate-300">Tipo de Dato</Label>
          <select
            id="attr-tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as 'texto' | 'numerico' | 'entero')}
            className="w-full h-10 px-3 rounded-md bg-slate-600 border border-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="texto">Texto</option>
            <option value="numerico">Numérico</option>
            <option value="entero">Entero</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={!nombre.trim()}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          size="sm"
          variant="outline"
          className="bg-slate-600 hover:bg-slate-500 border-slate-500 text-white"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </form>
  );
};

