import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/app';
import { useIsMobile } from '@/hooks/useIsMobile';
import Sidebar from '@/components/sidebars/Sidebar';
import { motion } from 'framer-motion';

const Layout: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  const location = useLocation();
  const { sidebar } = useAppStore();
  const isMobile = useIsMobile();

  const isForSideBar = () => {
    let result = false;
    if (location.pathname === "/dashboard" || location.pathname === "/equipos" || location.pathname === "/personal" || location.pathname === "/planilla" || location.pathname === "/configuracion") {
      result = true;
    }
    return result;
  };

  const isObraPage = location.pathname.startsWith("/oferta") || location.pathname.startsWith("/obra");

  const getSidebarWidth = () => {
    if (isObraPage) return '0rem';
    
    if (!isForSideBar()) return '0rem';
    if (isMobile) return '0rem'; 
    return sidebar.isOpen ? '18rem' : '5rem'; 
  };

  if (isObraPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
      <div className="flex relative">
        {isForSideBar() && <Sidebar />}
        <motion.div
          animate={{
            marginLeft: getSidebarWidth(),
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-1 overflow-hidden w-full"
        >
          <main className="p-6">{children}</main>
        </motion.div>
      </div>
    </div>
  );
});

export default Layout;

