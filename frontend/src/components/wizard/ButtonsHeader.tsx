import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, Save } from 'lucide-react';

interface ButtonsHeaderProps {
  currentStep: string;
  isFirstStep: boolean;
  isLastStep: boolean;
  canContinue?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSaveAndExit: () => void;
  customContinueLabel?: string;
}

export const ButtonsHeader: React.FC<ButtonsHeaderProps> = ({
  currentStep,
  isFirstStep,
  isLastStep,
  canContinue = true,
  onPrevious,
  onNext,
  onSaveAndExit,
  customContinueLabel
}) => {
  const getStepTitle = () => {
    const titles: Record<string, string> = {
      oferta: 'Crear Cotización',
      obras: 'Obras',
      items: 'Items de Obra',
      costos: 'Asignar Costos',
      incrementos: 'Incrementos',
      verificacion: 'Verificación Final'
    };
    return titles[currentStep] || 'Paso';
  };

  const getContinueLabel = () => {
    if (customContinueLabel) return customContinueLabel;
    if (isLastStep) return 'Finalizar';
    return 'Continuar';
  };

  const getContinueIcon = () => {
    if (isLastStep) return <Check className="h-4 w-4 ml-2" />;
    return <ChevronRight className="h-4 w-4 ml-2" />;
  };

  return (
    <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Botón Anterior */}
        <div className="flex-1">
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={onPrevious}
              className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          )}
        </div>

        {/* Título del paso */}
        <div className="flex-1 text-center">
          <h3 className="text-lg font-semibold text-white">{getStepTitle()}</h3>
        </div>

        {/* Botones de acción */}
        <div className="flex-1 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onSaveAndExit}
            className="bg-amber-600 hover:bg-amber-700 text-white border-amber-500"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar y Salir
          </Button>
          
          <Button
            onClick={onNext}
            disabled={!canContinue}
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            {getContinueLabel()}
            {getContinueIcon()}
          </Button>
        </div>
      </div>
    </div>
  );
};


