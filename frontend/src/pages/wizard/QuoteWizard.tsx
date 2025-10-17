import React, { useState } from 'react';
import QuoteDataForm from '@/components/wizard/QuoteDataForm';
import ObrasStep from '@/components/wizard/ObrasStep';
import ItemsStep from '@/components/wizard/ItemsStep';
import CostosStep from '@/components/wizard/CostosStep';
import IncrementosStep from '@/components/wizard/IncrementosStep';
import VerificationPage from '@/pages/VerificationPage';
import { useAppStore } from '@/store/app';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const QuoteWizard: React.FC = () => {
  const { wizard, setStep, setObras, setItems, setCostos, setIncrementos } = useAppStore();
  const navigate = useNavigate();
  const [showEliminarDialog, setShowEliminarDialog] = useState(false);
  const [showGuardarDialog, setShowGuardarDialog] = useState(false);

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

  const getMaxCompletedStep = () => {
    // Encuentra el paso más avanzado al que se ha llegado
    const stepOrder = ['datos', 'obras', 'items', 'costos', 'incrementos', 'verificacion'];
    const currentIndex = stepOrder.indexOf(wizard.step);
    return currentIndex;
  };

  const isStepCompleted = (stepKey: string) => {
    const stepOrder = ['datos', 'obras', 'items', 'costos', 'incrementos', 'verificacion'];
    const stepIndex = stepOrder.indexOf(stepKey);
    const maxCompletedIndex = getMaxCompletedStep();
    return stepIndex < maxCompletedIndex;
  };

  const canNavigateToStep = (stepKey: string) => {
    // Siempre se puede ir al paso actual
    if (stepKey === wizard.step) return true;
    
    // Se puede ir a pasos anteriores o iguales al máximo completado
    const stepOrder = ['datos', 'obras', 'items', 'costos', 'incrementos', 'verificacion'];
    const stepIndex = stepOrder.indexOf(stepKey);
    const maxCompletedIndex = getMaxCompletedStep();
    return stepIndex <= maxCompletedIndex;
  };

  const handleEliminarYSalir = () => {
    // Limpiar todos los datos del wizard
    setObras([]);
    setItems([]);
    setCostos([]);
    setIncrementos([]);
    setStep('datos');
    // TODO: Eliminar datos de la base de datos si ya se guardaron
    navigate('/dashboard');
  };

  const handleGuardarYSalir = () => {
    // Los datos ya se van guardando automáticamente
    // Solo verificamos y redirigimos
    // TODO: Verificar que los datos se guardaron correctamente en BD
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
      <div className="p-6">
        <div className="space-y-6">
          {/* Header con título y botones */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Crear Nueva Cotización</h2>
            <div className="flex items-center gap-3">
              <Button 
                variant="destructive"
                onClick={() => setShowEliminarDialog(true)}
              >
                Eliminar Cotización y Salir
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowGuardarDialog(true)}
                className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
              >
                Guardar como Borrador y Salir
              </Button>
              <div className="text-sm text-slate-300">
                Paso {getCurrentStepNumber()} de 6
              </div>
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
          
          {wizard.step === 'datos' && <QuoteDataForm />}
          {wizard.step === 'obras' && <ObrasStep />}
          {wizard.step === 'items' && <ItemsStep />}
          {wizard.step === 'costos' && <CostosStep />}
          {wizard.step === 'incrementos' && <IncrementosStep />}
          {wizard.step === 'verificacion' && <VerificationPage />}
        </div>
      </div>

      {/* Dialog para Eliminar Cotización */}
      <AlertDialog open={showEliminarDialog} onOpenChange={setShowEliminarDialog}>
        <AlertDialogContent className="bg-slate-800 border-slate-600 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cotización y salir?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Si continúas, perderás todos los datos que has llenado en esta cotización. 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEliminarYSalir}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar y Salir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para Guardar Borrador */}
      <AlertDialog open={showGuardarDialog} onOpenChange={setShowGuardarDialog}>
        <AlertDialogContent className="bg-slate-800 border-slate-600 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Guardar como borrador y salir?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Se guardará el progreso actual de la cotización aunque no la hayas terminado. 
              Podrás continuar más tarde desde el dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleGuardarYSalir}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Guardar y Salir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuoteWizard;
