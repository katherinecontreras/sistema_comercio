import React from 'react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HelpStepOverlayProps {
  stepIndex: number;
  totalSteps: number;
  title: string;
  description: React.ReactNode;
  position: {
    top: number;
    left: number;
    transform: string;
  };
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const HelpStepOverlay: React.FC<HelpStepOverlayProps> = ({
  stepIndex,
  totalSteps,
  title,
  description,
  position,
  onNext,
  onPrev,
  onClose,
  isFirst,
  isLast,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        transform: position.transform,
      }}
      className="pointer-events-auto z-[9999] max-w-md"
    >
      <div className="relative overflow-hidden rounded-xl border border-emerald-500/40 bg-slate-900/95 shadow-xl shadow-emerald-900/30 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between px-5 pt-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Paso {stepIndex + 1} de {totalSteps}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-red-300"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
        <div className="relative space-y-3 px-5 pb-4">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <div className={cn('space-y-2 text-sm text-emerald-50')}>{description}</div>
          <div className="flex items-center justify-between pt-2">
            {isFirst ? (
              <span className="text-xs text-slate-400">Inicio de la guía</span>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-200 hover:bg-slate-800/70"
                onClick={onPrev}
              >
                Volver
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={isLast ? onClose : onNext}
            >
              {isLast ? 'Finalizar' : 'Continuar'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HelpStepOverlay;

