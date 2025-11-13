import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BaseHeaderOption {
  id: number;
  label: string;
}

interface CustomHeaderOption {
  id: string;
  label: string;
}

interface HeaderSelectionBarProps {
  baseOptions: BaseHeaderOption[];
  customOptions: CustomHeaderOption[];
  onSelectBase: (id: number) => void;
  onRestoreCustom: (id: string) => void;
  onDiscardCustom: (id: string) => void;
  loading: boolean;
}

export const HeaderSelectionBar: React.FC<HeaderSelectionBarProps> = ({
  baseOptions,
  customOptions,
  onSelectBase,
  onRestoreCustom,
  onDiscardCustom,
  loading,
}) => {
  const hasBaseOptions = baseOptions.length > 0;
  const hasCustomOptions = customOptions.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -20 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, y: -20 }}
      transition={{ 
        duration: 0.3, 
        ease: [0.4, 0, 0.2, 1],
        height: { duration: 0.4 }
      }}
      className="space-y-4 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="space-y-1"
      >
        <h3 className="text-sm font-semibold text-white">Headers disponibles</h3>
        <p className="text-xs text-slate-400">
          Reincorpora headers base opcionales o restaura los que creaste previamente.
        </p>
      </motion.div>

      {/* Headers base */}
      <AnimatePresence mode="wait">
        {hasBaseOptions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">Headers base</p>
            <div className="flex flex-wrap items-center gap-2">
              {baseOptions.map((option, index) => (
                <motion.div
                  key={`base-${option.id}`}
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20 }}
                  transition={{ 
                    delay: index * 0.05,
                    duration: 0.2,
                    ease: 'easeOut'
                  }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-200 transition-all 
                               hover:border-emerald-500 hover:bg-emerald-600 hover:text-white
                               hover:scale-105 active:scale-95"
                    onClick={() => onSelectBase(option.id)}
                    disabled={loading}
                  >
                    {option.label}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Headers personalizados */}
      <AnimatePresence mode="wait">
        {hasCustomOptions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="space-y-2"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Headers personalizados
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {customOptions.map((option, index) => (
                <motion.div
                  key={`custom-${option.id}`}
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20 }}
                  transition={{ 
                    delay: index * 0.05,
                    duration: 0.2,
                    ease: 'easeOut'
                  }}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    'group flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-all',
                    'border-slate-600 bg-slate-900/60 text-slate-200',
                    'hover:border-emerald-500 hover:bg-emerald-600 hover:text-white hover:scale-105',
                    loading && 'cursor-not-allowed opacity-60 hover:scale-100',
                    !loading && 'cursor-pointer'
                  )}
                  onClick={() => {
                    if (!loading) onRestoreCustom(option.id);
                  }}
                  onKeyDown={(event) => {
                    if (!loading && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault();
                      onRestoreCustom(option.id);
                    }
                  }}
                  whileHover={!loading ? { scale: 1.05 } : undefined}
                  whileTap={!loading ? { scale: 0.95 } : undefined}
                >
                  <span>{option.label}</span>
                  <motion.button
                    type="button"
                    className="rounded-full border border-transparent p-1 text-slate-400 
                               transition-colors hover:border-slate-500 hover:text-red-400"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (!loading) onDiscardCustom(option.id);
                    }}
                    disabled={loading}
                    aria-label={`Eliminar ${option.label} de las opciones`}
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HeaderSelectionBar;