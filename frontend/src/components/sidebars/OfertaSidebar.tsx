import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { FileText, Package, ArrowLeft, X, Menu, Inspect, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useObraBaseStore } from '@/store/obra/obraStore';
import { useIsMobile } from '@/hooks/useIsMobile';
import { NavLink } from './NavLink';
import useCostoStore from '@/store/costo/costoStore';

interface OfertaSidebarProps {
  onToggle?: (isOpen: boolean) => void;
}

const OfertaSidebar: React.FC<OfertaSidebarProps> = React.memo(({ onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { obra } = useObraBaseStore();
  const costosReady = useCostoStore((state) => state.ready);
  
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(!isMobile);
  const prevIsMobileRef = useRef<boolean | null>(null);

  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    onToggle?.(open);
  };

  // Efecto para colapsar/expandir automáticamente 
  useEffect(() => {
    const prevIsMobile = prevIsMobileRef.current;
    if (prevIsMobile !== null && prevIsMobile !== isMobile) {
      const newState = !isMobile;
      handleToggle(newState);
    }
    prevIsMobileRef.current = isMobile;
  }, [isMobile]);

  type NavigationItem = {
    name: string;
    href: string;
    icon: LucideIcon;
    requiresReady?: boolean;
    disabledReason?: string;
  };

  const navigation: NavigationItem[] = [
    { name: 'Obra', href: '/oferta/obra', icon: FileText },
    { name: 'Items', href: '/oferta/Items', icon: Inspect },
    { name: 'Recursos', href: '/oferta/recursos', icon: Package },
    {
      name: 'Costos',
      href: '/oferta/costos',
      icon: Coins,
      requiresReady: true,
      disabledReason: 'Finaliza los items con recursos para calcular los costos',
    },
  ];

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <>
      {/* Overlay para móvil cuando el menú está abierto */}
      {isMobile && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => handleToggle(false)} 
          className="fixed inset-0 bg-black/50 z-40"
        />
      )}
      
      {/* Componente Sidebar */}
      <motion.aside
        animate={
          isMobile
            ? { x: isOpen ? 0 : "-100%" }
            : { width: isOpen ? "18rem" : "5rem" }
        }
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`bg-slate-900 fixed text-slate-100 p-4 flex flex-col h-screen shadow-2xl z-50 border-r border-slate-700`}
      >
        {/* Contenedor del Logo y Botón de Control */}
        <div className="mb-6">
          <div className={`flex ${isOpen ? "justify-end" : "justify-center"} mb-4`}>
            <button
              onClick={() => handleToggle(!isOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-slate-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
                
          <div className="flex justify-start items-start">
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="title-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-2"
                >
                  <h2 className="text-lg font-semibold text-slate-100">Oferta de Obra</h2>
                  {obra?.nombre_proyecto && (
                    <p className="text-xs text-slate-400 mt-1 truncate">{obra.nombre_proyecto}</p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="logo-small"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center w-full"
                >
                  <FileText className="h-6 w-6 text-slate-300" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navegación principal */}
        <nav className="flex-grow space-y-2">
          {navigation.map((link, index) => {
            const isActive = location.pathname === link.href;
            const disabled = Boolean(link.requiresReady && !costosReady);
            return (
              <NavLink
                key={`${link.name}-${index}`}
                href={link.href}
                icon={link.icon}
                text={link.name}
                isOpen={isOpen}
                isActive={isActive}
                disabled={disabled}
                disabledReason={disabled ? link.disabledReason : undefined}
              />
            );
          })}
        </nav>

        {/* Footer - Botón volver */}
        <div className="mt-auto space-y-2">
          <button
            onClick={handleBack}
            className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 text-slate-300 hover:bg-slate-800 hover:text-slate-100 ${
              isOpen ? "justify-start" : "justify-center"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            {isOpen && <span className="ml-3">Volver</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
});

OfertaSidebar.displayName = 'OfertaSidebar';

export default OfertaSidebar;



