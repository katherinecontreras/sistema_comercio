import React from 'react';
import ClientSelector from '@/components/selection/ClientSelector';
import QuoteSelector from '@/components/selection/QuoteSelector';
import { useAppStore } from '@/store/app';
import { useNavigate } from 'react-router-dom';

const QuoteSelection: React.FC = () => {
  const { wizard, setStep, setActiveQuote } = useAppStore();
  const navigate = useNavigate();

  const handleFinalize = (quoteId: number) => {
    setActiveQuote(quoteId);
    navigate('/dashboard');
  };

  const handleCreateNew = () => {
    setStep('datos');
    navigate('/wizard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-6">
        {wizard.step === 'cliente' && (
          <ClientSelector onContinue={() => setStep('cotizacion')} />
        )}
        {wizard.step === 'cotizacion' && (
          <QuoteSelector onFinalize={handleFinalize} onCreateNew={handleCreateNew} />
        )}
      </div>
    </div>
  );
};

export default QuoteSelection;


