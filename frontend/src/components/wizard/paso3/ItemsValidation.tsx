import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ItemsValidationProps {
  showValidationAlert: boolean;
  validationMessage: string;
  obrasWithoutItems: string[];
  obras: Array<{ id: string; nombre: string }>;
}

export const ItemsValidation: React.FC<ItemsValidationProps> = ({
  showValidationAlert,
  validationMessage,
  obrasWithoutItems,
  obras
}) => {
  if (!showValidationAlert) return null;

  const getObraName = (obraId: string) => {
    const obra = obras.find(o => o.id === obraId);
    return obra?.nombre || 'Obra no encontrada';
  };

  return (
    <Alert className="bg-yellow-900/30 border-yellow-600/50">
      <AlertTriangle className="h-4 w-4 text-yellow-400" />
      <AlertDescription className="text-yellow-200">
        <div className="space-y-2">
          <p className="font-medium">{validationMessage}</p>
          {obrasWithoutItems.length > 0 && (
            <div>
              <p className="text-sm">Obras sin items:</p>
              <ul className="list-disc list-inside text-sm ml-4">
                {obrasWithoutItems.map(obraId => (
                  <li key={obraId}>{getObraName(obraId)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};





