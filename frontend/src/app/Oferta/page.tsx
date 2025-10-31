import React from 'react';
import { Outlet } from 'react-router-dom';
import OfertaSidebar from '@/components/sidebars/OfertaSidebar';
import { useIsMobile } from '@/hooks/useIsMobile';
import { motion } from 'framer-motion';

const OfertaLayout: React.FC = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  // Calcular el margen izquierdo para el contenido principal
  const getMainMargin = () => {
    if (isMobile) return '0rem';
    return sidebarOpen ? '18rem' : '5rem';
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
      <OfertaSidebar onToggle={setSidebarOpen} />
      <motion.main
        animate={{
          marginLeft: getMainMargin(),
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-1 overflow-hidden w-full"
      >
        <Outlet />
      </motion.main>
    </div>
  );
};

export default OfertaLayout;
