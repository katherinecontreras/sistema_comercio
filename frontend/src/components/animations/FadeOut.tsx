import React from 'react';
import { motion } from 'framer-motion';

interface FadeOutProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  onAnimationComplete?: () => void;
  className?: string;
}

export const FadeOut: React.FC<FadeOutProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.3,
  direction = 'none',
  onAnimationComplete,
  className = ''
}) => {
  const directionOffset = {
    up: { y: -20 },
    down: { y: 20 },
    left: { x: -20 },
    right: { x: 20 },
    none: {}
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ 
        opacity: 0,
        ...directionOffset[direction]
      }}
      transition={{ 
        duration,
        delay,
        ease: 'easeIn'
      }}
      onAnimationComplete={onAnimationComplete}
      className={className}
    >
      {children}
    </motion.div>
  );
};

