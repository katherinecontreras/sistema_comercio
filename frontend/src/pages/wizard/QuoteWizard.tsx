import React, { useState } from 'react';
import CotizacionStep from '@/components/wizard/paso1/CotizacionStep';
import ObrasStep from '@/components/wizard/paso2/ObrasStep';
import ItemsStep from '@/components/wizard/paso3/ItemsStep';
import CostosStep from '@/components/wizard/paso4/CostosStepNew';
import IncrementosStep from '@/components/wizard/paso5/IncrementosStepNew';
import VerificationStep from '@/components/wizard/paso6/VerificationStep';
import { ButtonsHeader } from '@/components/wizard/ButtonsHeader';
import { BorradorModal } from '@/components/modals';
import { useAppStore } from '@/store/app';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const QuoteWizard: React.FC = () => {
  const { wizard, setStep } = useAppStore();
  const navigate = useNavigate();
  const [showBorradorModal, setShowBorradorModal] = useState(false);
  const [maxStepReached, setMaxStepReached] = useState(0); // Trackear el paso más lejano visitado

  const steps = [
    { key: 'oferta', label: 'Oferta', number: 1 },
    { key: 'obras', label: 'Obras', number: 2 },
    { key: 'items', label: 'Items', number: 3 },
    { key: 'costos', label: 'Costos', number: 4 },
    { key: 'incrementos', label: 'Incrementos', number: 5 },
    { key: 'verificacion', label: 'Verificación', number: 6 }
  ];

  const stepOrder = ['oferta', 'obras', 'items', 'costos', 'incrementos', 'verificacion'];

  const getCurrentStepNumber = () => {
    const currentStep = steps.find(s => s.key === wizard.step);
    return currentStep?.number || 1;
  };

  // Actualizar el paso máximo alcanzado cuando cambia el step
  React.useEffect(() => {
    const currentIndex = stepOrder.indexOf(wizard.step);
    if (currentIndex > maxStepReached) {
      setMaxStepReached(currentIndex);
    }
  }, [wizard.step, maxStepReached]);

  const isStepCompleted = (stepKey: string) => {
    const stepIndex = stepOrder.indexOf(stepKey);
    const currentIndex = stepOrder.indexOf(wizard.step);
    return stepIndex < currentIndex;
  };

  const canNavigateToStep = (stepKey: string) => {
    if (stepKey === wizard.step) return true;
    const stepIndex = stepOrder.indexOf(stepKey);
    const currentIndex = stepOrder.indexOf(wizard.step);
    
    // Permitir navegación a pasos anteriores
    if (stepIndex < currentIndex) return true;
    
    // Permitir navegación al siguiente paso si el actual está completo
    if (stepIndex === currentIndex + 1) {
      // Verificar si el paso actual está completo
      switch (wizard.step) {
        case 'oferta':
          return wizard.quoteFormData?.nombre_proyecto && wizard.quoteFormData?.fecha_creacion;
        case 'obras':
          return wizard.obras.length > 0;
        case 'items':
          return wizard.items.length > 0;
        case 'costos':
          return wizard.costos.length > 0;
        case 'incrementos':
          return true; // Los incrementos son opcionales
        case 'verificacion':
          return true;
        default:
          return false;
      }
    }
    
    return stepIndex <= maxStepReached;
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

  const isCurrentStepComplete = () => {
    switch (wizard.step) {
      case 'oferta':
        return wizard.quoteFormData?.nombre_proyecto && wizard.quoteFormData?.fecha_creacion;
      case 'obras':
        return wizard.obras.length > 0;
      case 'items':
        return wizard.items.length > 0;
      case 'costos':
        return wizard.costos.length > 0;
      case 'incrementos':
        return true; // Los incrementos son opcionales
      case 'verificacion':
        return true;
      default:
        return false;
    }
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

  const handleStep1Continue = async () => {
    // Lógica específica del paso 1 (crear cotización)
    // Esta lógica se moverá desde CotizacionStep
    const { client, setActiveQuote, wizard } = useAppStore.getState();
    
    if (!client.selectedClientId) {
      alert('Debe seleccionar un cliente primero');
      return;
    }

    try {
      // const { createCotizacion } = await import('@/api/quotes');
      const cotizacion = await createCotizacion({
        id_cliente: client.selectedClientId,
        nombre_proyecto: wizard.quoteFormData?.nombre_proyecto || 'Proyecto sin nombre',
        fecha_creacion: wizard.quoteFormData?.fecha_creacion || new Date().toISOString().split('T')[0],
      });
      
      setActiveQuote(cotizacion.id_cotizacion);
      setStep('obras');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al crear cotización');
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
          {/* Header de progreso */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-2">Crear Nueva Cotización</h2>
            <p className="text-slate-400 mb-6">Paso {getCurrentStepNumber()} de {steps.length}</p>
            
            {/* Barra de progreso */}
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.key}>
                  <div 
                    className={`flex items-center gap-2 ${
                      canNavigateToStep(step.key) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    }`}
                    onClick={() => canNavigateToStep(step.key) && setStep(step.key as any)}
                  >
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold
                      ${wizard.step === step.key 
                        ? 'bg-sky-600 text-white' 
                        : isStepCompleted(step.key)
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-700 text-slate-400'
                      }
                    `}>
                      {isStepCompleted(step.key) ? <CheckCircle size={20} /> : step.number}
                    </div>
                    <span className={`text-sm hidden md:block ${
                      wizard.step === step.key ? 'text-white font-semibold' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 rounded ${
                      isStepCompleted(steps[index + 1].key) ? 'bg-green-600' : 'bg-slate-700'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ButtonsHeader - Navegación de pasos */}
          <ButtonsHeader
            currentStep={wizard.step}
            isFirstStep={isFirstStep()}
            isLastStep={isLastStep()}
            canContinue={isCurrentStepComplete() ? true : false}
            onPrevious={handlePrevious}
            onNext={wizard.step === 'oferta' ? handleStep1Continue : handleNext}
            onSaveAndExit={handleSaveAndExit}
          />
          
          {/* Contenido de cada paso */}
          {wizard.step === 'oferta' && <CotizacionStep />}
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




