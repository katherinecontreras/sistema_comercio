import React, { useRef, useLayoutEffect } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';

import { cn } from '@/lib/utils';

interface DraggableTableHeadProps {
  headerId: string;
  isDraggable: boolean;
  isDragging: boolean;
  children: React.ReactNode;
  onRegisterPosition: (id: string, element: HTMLElement) => void;
  onDragStart: (id: string) => void;
  onDrag: (event: any, info: PanInfo) => void;
  onDragEnd: (event: any, info: PanInfo) => void;
  showDropIndicatorLeft?: boolean;
  showDropIndicatorRight?: boolean;
  className?: string;
}

const DropIndicator: React.FC<{ position: 'left' | 'right'; active?: boolean }> = ({
  position,
  active,
}) => (
  <AnimatePresence>
    {active && (
      <motion.div
        key={position}
        initial={{ opacity: 0, scaleY: 0.6 }}
        animate={{ opacity: 1, scaleY: 1 }}
        exit={{ opacity: 0, scaleY: 0.6 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn(
          'absolute top-1/2 z-40 h-[70%] w-1 -translate-y-1/2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.55)] pointer-events-none',
          position === 'left' ? '-left-3' : '-right-3'
        )}
      />
    )}
  </AnimatePresence>
);

export const DraggableTableHead: React.FC<DraggableTableHeadProps> = ({
  headerId,
  isDraggable,
  isDragging,
  children,
  onRegisterPosition,
  onDragStart,
  onDrag,
  onDragEnd,
  showDropIndicatorLeft = false,
  showDropIndicatorRight = false,
  className,
}) => {
  const ref = useRef<HTMLTableCellElement>(null);

  useLayoutEffect(() => {
    if (ref.current && isDraggable) {
      onRegisterPosition(headerId, ref.current);
    }
  });

  if (!isDraggable) {
    return (
      <th
        ref={ref}
        className={cn('relative p-0 align-top border-r border-slate-700', className)}
      >
        <DropIndicator position="left" active={showDropIndicatorLeft} />
        <DropIndicator position="right" active={showDropIndicatorRight} />
        {children}
      </th>
    );
  }

  return (
    <motion.th
      ref={ref}
      layout
      layoutId={`header-${headerId}`}
      drag="x"
      dragElastic={0}
      dragMomentum={false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={() => onDragStart(headerId)}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      className={cn(
        'relative p-0 align-top border-r border-slate-700 cursor-grab active:cursor-grabbing',
        isDragging && 'z-50',
        className
      )}
      style={{ touchAction: 'none' }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        scale: isDragging ? 1.05 : 1,
        y: isDragging ? -20 : 0,
      }}
      transition={{
        opacity: { duration: 0.1 },
        scale: { duration: 0.2 },
        y: { duration: 0.2, ease: 'easeOut' },
      }}
      whileHover={!isDragging ? { scale: 1.02 } : undefined}
    >
      <DropIndicator position="left" active={showDropIndicatorLeft} />
      <DropIndicator position="right" active={showDropIndicatorRight} />
      {children}
    </motion.th>
  );
};