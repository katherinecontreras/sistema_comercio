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
import Materiales from '@/app/Home/Materiales/page';
import TipoMaterial from '@/app/Home/Materiales/tipoMaterial/page';
import OfertaLayout from './app/Oferta/page';
import Obra from './app/Oferta/Obra/page';
import Recursos from './app/Oferta/Recursos/page';
import Items from './app/Oferta/Items/page';
import Costos from './app/Oferta/Costos/page';

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
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
          <Route path="/materiales" element={<ProtectedRoute><Layout><Materiales/></Layout></ProtectedRoute>} />
          <Route path="/materiales/tipoMaterial" element={<ProtectedRoute><Layout><TipoMaterial/></Layout></ProtectedRoute>} />
          <Route path="/materiales/tipoMaterial/:id" element={<ProtectedRoute><Layout><TipoMaterial/></Layout></ProtectedRoute>} />
          
          {/*oferta - layout con sidebar*/}
          <Route path="/oferta" element={<ProtectedRoute><OfertaLayout/></ProtectedRoute>}>
            <Route index element={<Navigate to="/oferta/obra" replace />} />
            <Route path="obra" element={<Obra />} />
            <Route path="items" element={<Items />} />
            <Route path="recursos" element={<Recursos />} />
            <Route path="costos" element={<Costos />} />
          </Route>
          
          {/* Redirección de /obra a /oferta/obra para mantener compatibilidad */}
          <Route path="/obra" element={<Navigate to="/oferta/obra" replace />} />
        </Routes>
    </Router>
    </ToastProvider>
  );
}

export default App;


