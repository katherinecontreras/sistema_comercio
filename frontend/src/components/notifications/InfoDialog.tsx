import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface InfoDialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description: React.ReactNode;
  actionLabel?: string;
  variant?: 'default' | 'destructive' | 'primary';
}

export const InfoDialog: React.FC<InfoDialogProps> = ({
  open,
  onClose,
  title,
  description,
  actionLabel = 'Entendido',
  variant = 'primary'
}) => {
  // Reutilizamos la misma lógica para el color del botón
  const getActionClassName = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-600 hover:bg-red-700';
      case 'primary':
        return 'bg-sky-600 hover:bg-sky-700';
      default:
        return '';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-slate-800 border-slate-600 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Nota: Solo tenemos AlertDialogAction, no hay Cancel */}
          <AlertDialogAction
            onClick={onClose} // La única acción es cerrar el diálogo
            className={getActionClassName()}
          >
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};