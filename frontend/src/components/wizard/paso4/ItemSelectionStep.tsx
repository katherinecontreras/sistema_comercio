import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Check } from 'lucide-react';
import { useAppStore } from '@/store/app';
import { ItemObra } from '@/store/obra';

interface ItemSelectionStepProps {
  onItemSelected: (item: ItemObra) => void;
  onNext: () => void;
}

export const ItemSelectionStep: React.FC<ItemSelectionStepProps> = ({ 
  onItemSelected, 
  onNext 
}) => {
  const { wizard } = useAppStore();
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  const getObraName = (obraId: string) => {
    const obra = wizard.obras.find(o => o.id === obraId);
    return obra?.nombre || 'Obra no encontrada';
  };

  const selectedItem = wizard.items.find(item => item.id === selectedItemId);

  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    const item = wizard.items.find(i => i.id === itemId);
    if (item) {
      onItemSelected(item);
    }
  };

  const handleContinue = () => {
    if (selectedItem) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Seleccionar Item de Obra</h3>
          <p className="text-muted-foreground">Elige el item al que quieres asignar recursos</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {wizard.items.length} item{wizard.items.length !== 1 ? 's' : ''} disponible{wizard.items.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Sin resumen aquí - se mostrará al final */}

      {/* Lista de Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {wizard.items.map((item) => {
              const isSelected = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemSelect(item.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-sky-600/20 border-sky-500' 
                      : 'bg-slate-700/50 border-slate-600 hover:bg-slate-600/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">
                          {item.codigo && `${item.codigo} - `}{item.descripcion_tarea}
                        </h4>
                        {isSelected && <Check className="h-4 w-4 text-sky-400" />}
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        📍 {getObraName(item.id_obra)}
                        {item.especialidad && ` • ${item.especialidad}`}
                        {item.unidad && ` • ${item.unidad}`}
                        {item.cantidad > 0 && ` • Cantidad: ${item.cantidad}`}
                        {item.precio_unitario > 0 && ` • Precio: $${item.precio_unitario}`}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Botón Continuar */}
      {selectedItem && (
        <div className="flex justify-end">
          <Button 
            onClick={handleContinue}
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            Continuar con {selectedItem.codigo || selectedItem.descripcion_tarea}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};
