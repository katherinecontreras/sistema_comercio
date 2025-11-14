import React from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface AnimatedTableCellProps {
  isDragging: boolean;
  isInDropZone: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onPointerDown?: (event: React.PointerEvent<HTMLTableCellElement>) => void;
  dataSelectable?: boolean;
  dataHelpAnchor?: string;
  colSpan?: number;
}

export const AnimatedTableCell: React.FC<AnimatedTableCellProps> = ({
  isDragging,
  isInDropZone,
  children,
  className,
  onClick,
  onPointerDown,
  dataSelectable,
  dataHelpAnchor,
  colSpan,
}) => (
  <motion.td
    layout
    colSpan={colSpan}
    className={cn(
      'border-r border-slate-800 px-4 py-6 align-top transition-colors bg-slate-900/50',
      isDragging && 'opacity-30',
      isInDropZone && 'bg-emerald-500/5',
      className
    )}
    onClick={onClick}
    onPointerDown={onPointerDown}
    data-calculo-selectable={dataSelectable ? 'true' : undefined}
    data-help-anchor={dataHelpAnchor}
  >
    {children}
  </motion.td>
);
