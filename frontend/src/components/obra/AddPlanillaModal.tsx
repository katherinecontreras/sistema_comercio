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
import { Plus, X, FileSpreadsheet, Package, Wrench, Zap } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { createTipoRecurso } from '@/actions/catalogos';

interface AddPlanillaModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (planilla: { id: number, nombre: string }) => void;
}

const iconOptions = [
  { name: 'FileSpreadsheet', icon: FileSpreadsheet },
  { name: 'Package', icon: Package },
  { name: 'Wrench', icon: Wrench },
  { name: 'Zap', icon: Zap },
  { name: 'Hammer', icon: LucideIcons.Hammer },
  { name: 'Settings', icon: LucideIcons.Settings },
  { name: 'Cpu', icon: LucideIcons.Cpu },
  { name: 'Gauge', icon: LucideIcons.Gauge },
];

export const AddPlanillaModal: React.FC<AddPlanillaModalProps> = ({
  open,
  onClose,
  onAdd
}) => {
  const [nombre, setNombre] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('FileSpreadsheet');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) return;

    try {
      setLoading(true);
      console.log('Creando nueva planilla:', { nombre: nombre.trim(), icono: selectedIcon });
      
      const response = await createTipoRecurso({
        nombre: nombre.trim(),
        icono: selectedIcon
      });
      
      console.log('Respuesta del backend:', response);
      
      // Llamar al callback con la nueva planilla
      onAdd({
        id: response.id_tipo_recurso,
        nombre: response.nombre
      });
      
      // Limpiar campos y cerrar
      setNombre('');
      setSelectedIcon('FileSpreadsheet');
      onClose();
    } catch (error: any) {
      console.error('Error agregando planilla:', error);
      console.error('Detalles del error:', error.response?.data);
      alert('Error al crear la planilla. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Limpiar campos cuando se abre/cierra el modal
  React.useEffect(() => {
    if (open) {
      setNombre('');
      setSelectedIcon('FileSpreadsheet');
      setLoading(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-600 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-500" />
            Agregar Nueva Planilla
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la Planilla</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Materiales, Herramientas, etc."
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Seleccionar Icono</Label>
            <div className="grid grid-cols-4 gap-2">
              {iconOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => setSelectedIcon(option.name)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedIcon === option.name
                        ? 'border-green-500 bg-green-900/30'
                        : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <Icon className="h-6 w-6 mx-auto text-white" />
                  </button>
                );
              })}
            </div>
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
              disabled={loading || !nombre.trim()}
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
