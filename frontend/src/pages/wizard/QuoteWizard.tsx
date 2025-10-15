import React from 'react';
import QuoteDataForm from '@/components/wizard/QuoteDataForm';
import ObrasStep from '@/components/wizard/ObrasStep';
import ItemsStep from '@/components/wizard/ItemsStep';
import CostosStep from '@/components/wizard/CostosStep';
import IncrementosStep from '@/components/wizard/IncrementosStep';
import VerificationPage from '@/pages/VerificationPage';
import { useAppStore } from '@/store/app';

const QuoteWizard: React.FC = () => {
  const { wizard, setStep } = useAppStore();

  const steps = [
    { key: 'datos', label: 'Datos', number: 1 },
    { key: 'obras', label: 'Obras', number: 2 },
    { key: 'items', label: 'Items', number: 3 },
    { key: 'costos', label: 'Costos', number: 4 },
    { key: 'incrementos', label: 'Incrementos', number: 5 },
    { key: 'verificacion', label: 'Verificación', number: 6 }
  ];

  const getCurrentStepNumber = () => {
    const currentStep = steps.find(s => s.key === wizard.step);
    return currentStep?.number || 1;
  };

  const isStepCompleted = (stepKey: string) => {
    switch (stepKey) {
      case 'datos':
        return wizard.step !== 'datos';
      case 'obras':
        return wizard.step !== 'datos' && wizard.step !== 'obras';
      case 'items':
        return wizard.step !== 'datos' && wizard.step !== 'obras' && wizard.step !== 'items';
      case 'costos':
        return wizard.step !== 'datos' && wizard.step !== 'obras' && wizard.step !== 'items' && wizard.step !== 'costos';
      case 'incrementos':
        return wizard.step !== 'datos' && wizard.step !== 'obras' && wizard.step !== 'items' && wizard.step !== 'costos' && wizard.step !== 'incrementos';
      case 'verificacion':
        return wizard.step === 'verificacion';
      default:
        return false;
    }
  };

  const canNavigateToStep = (stepKey: string) => {
    // Siempre se puede ir al paso actual
    if (stepKey === wizard.step) return true;
    
    // Se puede ir a pasos ya completados
    return isStepCompleted(stepKey);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-6">
        <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Crear Nueva Cotización</h2>
          <div className="text-sm text-muted-foreground">
            Paso {getCurrentStepNumber()} de 6
          </div>
        </div>

        {/* Navegación entre pasos */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <button
                  onClick={() => canNavigateToStep(step.key) && setStep(step.key as any)}
                  disabled={!canNavigateToStep(step.key)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    step.key === wizard.step
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isStepCompleted(step.key)
                      ? 'bg-green-100 border-green-500 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isStepCompleted(step.key) ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </button>
                <span className={`ml-2 text-sm font-medium ${
                  step.key === wizard.step ? 'text-blue-600' : 
                  isStepCompleted(step.key) ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    isStepCompleted(step.key) ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {wizard.step === 'datos' && <QuoteDataForm />}
        {wizard.step === 'obras' && <ObrasStep />}
        {wizard.step === 'items' && <ItemsStep />}
        {wizard.step === 'costos' && <CostosStep />}
        {wizard.step === 'incrementos' && <IncrementosStep />}
        {wizard.step === 'verificacion' && <VerificationPage />}
        </div>
      </div>
    </div>
  );
};

export default QuoteWizard;
