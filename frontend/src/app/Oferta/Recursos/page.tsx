import React from 'react';

const Recursos: React.FC = () => {
  return (
    <div className="p-4">
      <div className="relative flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-900/40">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M20 7h-4m-4 0H4m16 5h-4m-4 0H4m16 5h-4m-4 0H4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Recursos
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Gestiona los recursos para la obra
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-300">Contenido de recursos pendiente de implementar...</p>
        </div>
      </div>
    </div>
  );
};

export default Recursos;
