import React from 'react';
import Sidebar from '@/components/Sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white text-foreground">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
});

export default Layout;

