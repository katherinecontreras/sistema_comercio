import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MotionWrapProps {
  children: React.ReactNode;
  className?: string;
}

const MotionWrap: React.FC<MotionWrapProps> = ({ children, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};

export default MotionWrap;
