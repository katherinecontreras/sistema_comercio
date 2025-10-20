import React, { useState } from 'react';
import CotizacionStep from '@/components/wizard/CotizacionStep';
import ObrasStep from '@/components/wizard/ObrasStep';
import ItemsStep from '@/components/wizard/ItemsStep';
import CostosStep from '@/components/wizard/CostosStep';
import IncrementosStep from '@/components/wizard/IncrementosStep';
import VerificationStep from '@/components/wizard/VerificationStep';
import { ButtonsHeader } from '@/components/wizard/ButtonsHeader';
import { BorradorModal } from '@/components/modals';
import { useAppStore } from '@/store/app';
import { useNavigate } from 'react-router-dom';

const QuoteWizard: React.FC = () => {
  const { wizard, setStep } = useAppStore();
  const navigate = useNavigate();
  const [showBorradorModal, setShowBorradorModal] = useState(false);

  const steps = [
    { key: 'datos', label: 'Datos', number: 1 },
    { key: 'obras', label: 'Obras', number: 2 },
    { key: 'items', label: 'Items', number: 3 },
    { key: 'costos', label: 'Costos', number: 4 },
    { key: 'incrementos', label: 'Incrementos', number: 5 },
    { key: 'verificacion', label: 'Verificación', number: 6 }
  ];

  const stepOrder = ['datos', 'obras', 'items', 'costos', 'incrementos', 'verificacion'];

  const getCurrentStepNumber = () => {
    const currentStep = steps.find(s => s.key === wizard.step);
    return currentStep?.number || 1;
  };

  const getMaxCompletedStep = () => {
    const currentIndex = stepOrder.indexOf(wizard.step);
    return currentIndex;
  };

  const isStepCompleted = (stepKey: string) => {
    const stepIndex = stepOrder.indexOf(stepKey);
    const maxCompletedIndex = getMaxCompletedStep();
    return stepIndex < maxCompletedIndex;
  };

  const canNavigateToStep = (stepKey: string) => {
    if (stepKey === wizard.step) return true;
    const stepIndex = stepOrder.indexOf(stepKey);
    const maxCompletedIndex = getMaxCompletedStep();
    return stepIndex <= maxCompletedIndex;
  };

  const getCurrentStepIndex = () => {
    return stepOrder.indexOf(wizard.step);
  };

  const isFirstStep = () => {
    return getCurrentStepIndex() === 0;
  };

  const isLastStep = () => {
    return getCurrentStepIndex() === stepOrder.length - 1;
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setStep(stepOrder[currentIndex - 1] as any);
    }
  };

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < stepOrder.length - 1) {
      setStep(stepOrder[currentIndex + 1] as any);
    }
  };

  const handleSaveAndExit = () => {
    setShowBorradorModal(true);
  };

  const handleBorradorSuccess = () => {
    setShowBorradorModal(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
      <div className="p-6">
        <div className="space-y-6">
          {/* Header con título */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Crear Nueva Cotización</h2>
            <div className="text-sm text-slate-300">
              Paso {getCurrentStepNumber()} de 6
            </div>
          </div>

          {/* Navegación entre pasos */}
          <div className="bg-slate-800 rounded-lg border border-slate-600 p-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <button
                    onClick={() => canNavigateToStep(step.key) && setStep(step.key as any)}
                    disabled={!canNavigateToStep(step.key)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      step.key === wizard.step
                        ? 'bg-sky-500 border-sky-400 text-white'
                        : isStepCompleted(step.key)
                        ? 'bg-green-600 border-green-500 text-white hover:bg-green-500'
                        : 'bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed'
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
                    step.key === wizard.step ? 'text-sky-400' : 
                    isStepCompleted(step.key) ? 'text-green-400' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isStepCompleted(step.key) ? 'bg-green-500' : 'bg-slate-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ButtonsHeader - Navegación de pasos */}
          <ButtonsHeader
            currentStep={wizard.step}
            isFirstStep={isFirstStep()}
            isLastStep={isLastStep()}
            canContinue={true}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSaveAndExit={handleSaveAndExit}
          />
          
          {/* Contenido de cada paso */}
          {wizard.step === 'datos' && <CotizacionStep />}
          {wizard.step === 'obras' && <ObrasStep />}
          {wizard.step === 'items' && <ItemsStep />}
          {wizard.step === 'costos' && <CostosStep />}
          {wizard.step === 'incrementos' && <IncrementosStep />}
          {wizard.step === 'verificacion' && <VerificationStep />}
        </div>
      </div>

      {/* Modal para Guardar Borrador */}
      <BorradorModal
        isOpen={showBorradorModal}
        onClose={() => setShowBorradorModal(false)}
        onSuccess={handleBorradorSuccess}
      />
    </div>
  );
};

export default QuoteWizard;



