import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Package, Users, LogOut, X, Menu, Building2, Boxes } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAppStore } from '@/store/app';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { NavLink } from './NavLink';
import { getClientes } from '@/actions/catalogos';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Cliente {
  id_cliente: number;
  razon_social: string;
  cuit: string;
  actividad?: string;
}


const Sidebar: React.FC = React.memo(() => {
  const location = useLocation();
  const { logout, client, selectClient, sidebar, setSidebarOpen } = useAppStore();
  
  const isMobile = useIsMobile();
  
  const isOpen = sidebar.isOpen;
  const prevIsMobileRef = useRef<boolean | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const { execute, loading } = useAsyncOperation();

  // Cargar clientes al montar el componente
  useEffect(() => {
    execute(
      async () => {
        const data = await getClientes();
        setClientes(data);
      },
      {
        showErrorToast: false,
        showSuccessToast: false,
        onError: (error) => {
          console.error('Error al cargar clientes:', error);
        }
      }
    );
  }, [execute]);

  // Efecto para colapsar/expandir automáticamente 
  useEffect(() => {
    const prevIsMobile = prevIsMobileRef.current;
    if (prevIsMobile !== null && prevIsMobile !== isMobile) {
      if (isMobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    }
    prevIsMobileRef.current = isMobile;
  }, [isMobile, setSidebarOpen]);


  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Equipos', href: '/equipos', icon: Package },
    { name: 'Personal', href: '/personal', icon: Users },
    { name: 'Materiales', href: '/materiales', icon: Boxes },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const selectedCliente = clientes.find(c => c.id_cliente === client.selectedClientId);
  const otrosClientes = clientes.filter(c => c.id_cliente !== client.selectedClientId);

  // Manejar cambio de cliente
  const handleClientChange = (value: string) => {
    const clientId = parseInt(value, 10);
    selectClient(clientId);
  };

  return (
    <>
      {/* Overlay para móvil cuando el menú está abierto */}
      {isMobile && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)} 
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
        className={`bg-slate-900 fixed text-slate-100 p-4 flex flex-col h-screen shadow-2xl z-50 border-r border-slate-700 `}
      >
        {/* Contenedor del Logo y Botón de Control */}
        <div className="mb-6">
          <div className={`flex ${isOpen ? "justify-end" : "justify-center"} mb-4`}>
            <button
              onClick={() => setSidebarOpen(!isOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-slate-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          <div className="flex justify-start items-start">
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="logo-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-2"
                >
                  <h1 className="text-lg font-bold text-slate-100">Sistema de Comercio</h1>
                </motion.div>
              ) : (
                <motion.div
                  key="logo-small"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center w-full"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                    <span className="text-slate-200 font-bold text-sm">SC</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navegación principal */}
        <nav className="flex-grow space-y-2">
          {navigation.map((link, index) => {
            const isActive =
              location.pathname === link.href ||
              location.pathname.startsWith(`${link.href}/`);
            return (
              <NavLink
                key={`${link.name}-${index}`}
                href={link.href}
                icon={link.icon}
                text={link.name}
                isOpen={isOpen}
                isActive={isActive}
              />
          );
        })}
      </nav>

        {/* Footer Cliente */}
        <div className="mt-auto space-y-2">
          {isOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-2"
            >
              {loading ? (
                <div className="px-2 py-2 text-xs text-slate-400">Cargando...</div>
              ) : (
                <Select
                  value={client.selectedClientId?.toString() || ''}
                  onValueChange={handleClientChange}
                >
                  <SelectTrigger className="w-full h-fit bg-slate-800 border-transparent text-slate-100 hover:bg-slate-700">
                    <SelectValue placeholder={selectedCliente ? selectedCliente.razon_social : 'Sin cliente'} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 text-slate-100">
                    {/* Cliente seleccionado como primera opción */}
                    {selectedCliente && (
                      <SelectItem  value={selectedCliente.id_cliente.toString()} className="hover:bg-slate-700 transition-all ease-in-out focus:bg-slate-700">
                        <div className="flex flex-col text-start break-normal whitespace-normal">
                          <span className="font-medium">{selectedCliente.razon_social}</span>
                          <span className="text-xs text-slate-400">{selectedCliente.cuit}</span>
                        </div>
                      </SelectItem>
                    )}
                    {/* Separador si hay más clientes */}
                    {selectedCliente && otrosClientes.length > 0 && (
                      <div className="h-px bg-slate-600 my-1" />
                    )}
                    {/* Resto de clientes */}
                    {otrosClientes.map((cliente) => (
                      <SelectItem
                        key={cliente.id_cliente}
                        value={cliente.id_cliente.toString()}
                        className="hover:bg-slate-700 focus:bg-slate-700"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{cliente.razon_social}</span>
                          <span className="text-xs text-slate-400">{cliente.cuit}</span>
                        </div>
                      </SelectItem>
                    ))}
                    {clientes.length === 0 && (
                      <SelectItem value="no-clientes" disabled>
                        No hay clientes disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </motion.div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center"
              >
                <Building2 className="h-5 w-5 text-slate-400" />
              </motion.div>
            </AnimatePresence>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 text-slate-300 hover:bg-slate-800 hover:text-slate-100 ${
              isOpen ? "justify-start" : "justify-center"
            }`}
          >
            <LogOut className="w-5 h-5" />
            {isOpen && <span className="ml-3">Cerrar sesión</span>}
        </button>
      </div>
      </motion.aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
