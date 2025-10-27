import React from 'react';
import ClientSelector from '@/pages/selection/ClientSelector';
import { useNavigate } from 'react-router-dom';

const QuoteSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleGenerarCotizacion = () => {
    navigate('/obra');
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


