import React from 'react';
import Sidebar from '@/components/sidebars/Sidebar';
import { useLocation } from 'react-router-dom';
import { ObraSidebar } from './components';

const Layout: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  
  let location = useLocation()

  const isForSideBar = () => {
    let result = false
    if (location.pathname == "/dashboard" || location.pathname == "/equipos" || location.pathname == "/personal") {
      result= true
    }
    return result
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white ">
      <div className="flex">
        {isForSideBar() && (
          <Sidebar />
        )}
        {location.pathname == "/obra" && (
          <ObraSidebar />
        )}
        <div className="flex-1 overflow-hidden">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
});

export default Layout;

