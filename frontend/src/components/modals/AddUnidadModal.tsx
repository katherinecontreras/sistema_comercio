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
  onAdd: (data: { nombre: string; abreviatura: string }) => Promise<void>;
}

export const AddUnidadModal: React.FC<AddUnidadModalProps> = ({
  open,
  onClose,
  onAdd
}) => {
  const [nombre, setNombre] = useState('');
  const [abreviatura, setAbreviatura] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim() || !abreviatura.trim()) return;

    try {
      setLoading(true);
      await onAdd({ nombre: nombre.trim(), abreviatura: abreviatura.trim() });
      setNombre('');
      setAbreviatura('');
      onClose();
    } catch (error) {
      console.error('Error agregando unidad:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-600 text-white">
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
            <Label htmlFor="abreviatura">Abreviatura</Label>
            <Input
              id="abreviatura"
              value={abreviatura}
              onChange={(e) => setAbreviatura(e.target.value)}
              placeholder="Ej: m, kg, etc."
              className="bg-slate-700 border-slate-600 text-white"
              required
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
              disabled={loading || !nombre.trim() || !abreviatura.trim()}
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


