import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from '@/services/auth';
import { ToastProvider } from '@/components/notifications/ToastProvider';

import Layout from '@/Layout';
import Login from '@/app/Login/page';
import Dashboard from '@/app/Home/Dashboard/page';
import ClientSelector from '@/app/Login/Clientes/page';
import Equipos from '@/app/Home/Equipos/page';
import Personal from '@/app/Home/Personal/page';
import Obra from './app/Oferta/Obra/page';

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return authService.isAuthenticated() ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  return (
    <ToastProvider>

      <Router>
        <Routes>
          {/*inicio de sesion*/}
          <Route path="/login" element={authService.isAuthenticated() ? <Navigate to="/seleccionar-cliente" replace /> : <Layout><Login/></Layout> } />
          <Route path="/seleccionar-cliente" element={<ProtectedRoute><Layout><ClientSelector/></Layout></ProtectedRoute>}/>
          <Route path="/" element={authService.isAuthenticated() ? <Navigate to="/seleccionar-cliente" replace /> : <Navigate to="/login" replace />} />
          <Route path="*" element={authService.isAuthenticated() ? <Navigate to="/seleccionar-cliente" replace /> : <Navigate to="/login" replace />} />

          {/*home*/}
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard/></Layout></ProtectedRoute>} />
          <Route path="/equipos" element={<ProtectedRoute><Layout><Equipos/></Layout></ProtectedRoute>} />
          <Route path="/personal" element={<ProtectedRoute><Layout><Personal/></Layout></ProtectedRoute>} />
          
          {/*oferta*/}
          <Route path="/obra" element={<ProtectedRoute><Layout><Obra/></Layout></ProtectedRoute>}/>
        </Routes>
    </Router>
    </ToastProvider>
  );
}

export default App;


