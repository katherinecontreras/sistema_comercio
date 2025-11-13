import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedTableRowProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedTableRow: React.FC<AnimatedTableRowProps> = ({
  children,
  className,
}) => (
  <motion.tr
    layout
    className={className}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    {children}
  </motion.tr>
);
