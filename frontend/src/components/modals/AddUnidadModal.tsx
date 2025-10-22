import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

interface AddUnidadModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { nombre: string; simbolo: string; descripcion?: string }) => Promise<void>;
  initialNombre?: string; // Para pre-llenar el nombre
}

export const AddUnidadModal: React.FC<AddUnidadModalProps> = ({
  open,
  onClose,
  onAdd,
  initialNombre = ''
}) => {
  const [nombre, setNombre] = useState(initialNombre);
  const [simbolo, setSimbolo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  // Actualizar el nombre cuando cambie initialNombre
  React.useEffect(() => {
    setNombre(initialNombre);
  }, [initialNombre]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim() || !simbolo.trim()) return;

    try {
      setLoading(true);
      await onAdd({ 
        nombre: nombre.trim(), 
        simbolo: simbolo.trim(),
        descripcion: descripcion.trim() || undefined
      });
      setNombre('');
      setSimbolo('');
      setDescripcion('');
      onClose();
    } catch (error) {
      console.error('Error agregando unidad:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-600 text-white w-[30vw] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-500" />
            Agregar Nueva Unidad
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la Unidad</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Metro, Kilogramo, etc."
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="simbolo">Símbolo</Label>
            <Input
              id="simbolo"
              value={simbolo}
              onChange={(e) => setSimbolo(e.target.value)}
              placeholder="Ej: m, kg, etc."
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (Opcional)</Label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescripcion(e.target.value)}
              placeholder="Descripción breve de la unidad..."
              className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-white min-h-[80px] focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !nombre.trim() || !simbolo.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


