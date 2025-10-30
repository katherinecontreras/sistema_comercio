import React from 'react';

// Importamos nuestro componente de animación
import MotionWrap from '@/components/animations/motion-wrap';

const Obra: React.FC = () => {

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
      <MotionWrap className="w-full max-w-sm">
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl shadow-glow p-8 space-y-8">
          oferta
        </div>
      </MotionWrap>
    </div>
  );
};

export default Obra;
