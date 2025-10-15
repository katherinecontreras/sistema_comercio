import React from 'react';
import Sidebar from '@/components/Sidebar';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
});

export default DashboardLayout;


