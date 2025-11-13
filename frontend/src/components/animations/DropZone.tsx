import { AnimatePresence, motion } from "framer-motion";

interface DropZoneProps {
  isActive: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ isActive }) => (
  <AnimatePresence>
    {isActive && (
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 80, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative bg-emerald-500/10 border-2 border-dashed border-emerald-500 rounded"
      >
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-1 h-full bg-emerald-500" />
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);