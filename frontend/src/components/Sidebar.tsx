import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calculator, Package, Users, Settings, LogOut } from 'lucide-react';
import { useAppStore } from '@/store/app';

const Sidebar: React.FC = React.memo(() => {
  const location = useLocation();
  const logout = useAppStore((s) => s.logout);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Planilla', href: '/dashboard', icon: Calculator },
    { name: 'Recursos', href: '/dashboard', icon: Package },
    { name: 'Usuarios', href: '/dashboard', icon: Users },
    { name: 'Configuración', href: '/dashboard', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border bg-slate-900">
      <div className="flex items-center px-4 h-16">
        <h1 className="text-lg font-bold">Sistema de Comercio</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
              }`}
            >
              <Icon className="h-5 w-5" /> {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <button onClick={logout} className="w-full inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md hover:bg-accent">
          <LogOut className="h-5 w-5" /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
});
export default Sidebar;


