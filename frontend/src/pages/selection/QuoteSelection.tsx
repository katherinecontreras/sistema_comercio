import React from 'react';
import ClientSelector from '@/pages/selection/ClientSelector';
import { useAppStore } from '@/store/app';
import { useNavigate } from 'react-router-dom';

const QuoteSelection: React.FC = () => {
  const { setStep } = useAppStore();
  const navigate = useNavigate();

  const handleGenerarCotizacion = () => {
    setStep('datos');
    navigate('/wizard');
  };

  const handleIngresarSistema = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
      <div className="p-6">
        <ClientSelector 
          onGenerarCotizacion={handleGenerarCotizacion}
          onIngresarSistema={handleIngresarSistema}
        />
      </div>
    </div>
  );
};

export default QuoteSelection;


