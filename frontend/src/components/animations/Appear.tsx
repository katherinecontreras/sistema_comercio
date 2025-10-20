import React from 'react';
import { motion } from 'framer-motion';

interface AppearProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const Appear: React.FC<AppearProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.3,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration,
        delay,
        ease: 'easeOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

