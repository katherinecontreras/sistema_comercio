import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ItemsHeaderProps {
  itemsCount: number;
  onAddItem: () => void;
  showAddButton?: boolean;
}

export const ItemsHeader: React.FC<ItemsHeaderProps> = ({ 
  itemsCount, 
  onAddItem, 
  showAddButton = true 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-xl font-semibold">Items de Obra</h3>
        <p className="text-muted-foreground">Define los items que componen cada obra</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          {itemsCount} item{itemsCount !== 1 ? 's' : ''} agregado{itemsCount !== 1 ? 's' : ''}
        </div>
        {showAddButton && (
          <Button 
            onClick={onAddItem}
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Item
          </Button>
        )}
      </div>
    </div>
  );
};

