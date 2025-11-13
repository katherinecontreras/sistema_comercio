import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DraftHeaderProps {
  id: string;
  title: string;
  isEditable: boolean;
  isCantidad: boolean;
  isQuantityDefined: boolean;
  showQuantityQuestion: boolean;
  isSelectionMode: boolean;
  highlightedColumns: Set<string>;
  isFlashing: boolean;
  onTitleChange: (value: string) => void;
  onRemove: () => void;
  onQuantityResponse: (value: boolean) => void;
  loading: boolean;
  className?: string;
  isDragging?: boolean;
}

export const DraftTableHeader: React.FC<DraftHeaderProps> = ({
  id,
  title,
  isEditable,
  isCantidad,
  isQuantityDefined,
  showQuantityQuestion,
  isSelectionMode,
  highlightedColumns,
  isFlashing,
  onTitleChange,
  onRemove,
  onQuantityResponse,
  loading,
  className,
  isDragging = false,
}) => {
  const [localFlashing, setLocalFlashing] = useState(false);

  // Flasheo cuando no está definida la cantidad
  useEffect(() => {
    if (!isQuantityDefined) {
      setLocalFlashing(true);
    } else {
      setLocalFlashing(false);
    }
  }, [isQuantityDefined]);

  const isHighlighted = highlightedColumns.has(id) && isSelectionMode;
  const isPulsing = isFlashing || localFlashing;

  return (
    <motion.div
      layout
      animate={{
        backgroundColor: isDragging
          ? 'rgba(16, 185, 129, 0.2)'
          : isHighlighted || isPulsing
          ? 'rgba(59, 130, 246, 0.2)'
          : 'rgba(15, 23, 42, 0.8)',
      }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative h-full w-full px-4 py-3 transition-all',
        isHighlighted && 'ring-1 ring-blue-400/40',
        isPulsing && 'shadow-[0_0_0_3px_rgba(59,130,246,0.4)] animate-pulse',
        isDragging && 'ring-2 ring-emerald-400/70 shadow-lg shadow-emerald-900/40',
        className
      )}
    >
      <div className="space-y-3 ">
        {/* Header con botón de eliminar */}
        <div className="flex relative items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Input o título */}
            {isEditable && isQuantityDefined ? (
              <Input
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Nombre del header..."
                disabled={loading || isDragging}
                className="h-8 bg-slate-800/80 border-slate-700 text-white text-sm font-semibold 
                  focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none
                  disabled:opacity-50 flex-1 w-full"
              />
            ) : (
              <span className="text-sm mt-2 mb-1 font-semibold text-emerald-300 truncate">
                {title || 'Nuevo header'}
              </span>
            )}
          </div>

          {/* Botón de eliminar */}
          {isEditable && (
            <AnimatePresence>
              {!isDragging && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0 absolute -top-6 z-10 text-slate-400 bg-slate-800 border border-slate-700 
                               rounded-full hover:text-red-400 hover:border-red-500 transition-colors"
                    onClick={onRemove}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Pregunta de cantidad con animación */}
        <AnimatePresence>
          {showQuantityQuestion && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2 overflow-hidden"
            >
              <p className="text-xs text-slate-300">¿Es una cantidad?</p>
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Button
                    type="button"
                    size="sm"
                    variant={isCantidad ? 'default' : 'outline'}
                    className={cn(
                      'text-xs h-7 w-full',
                      isCantidad
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'border-slate-600'
                    )}
                    onClick={() => onQuantityResponse(true)}
                    disabled={loading}
                  >
                    Sí
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Button
                    type="button"
                    size="sm"
                    variant={!isCantidad && isQuantityDefined ? 'default' : 'outline'}
                    className={cn(
                      'text-xs h-7 w-full',
                      !isCantidad && isQuantityDefined
                        ? 'bg-slate-600 hover:bg-slate-700 text-white'
                        : 'border-slate-600'
                    )}
                    onClick={() => onQuantityResponse(false)}
                    disabled={loading}
                  >
                    No
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicador visual de arrastre */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 
                         px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full 
                         shadow-lg whitespace-nowrap"
            >
              Arrastrando...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DraftTableHeader;