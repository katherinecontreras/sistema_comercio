import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/auth';
import MainLayout from './layouts/MainLayout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import QuoteSelection from './pages/QuoteSelection';
import QuoteWizard from './pages/wizard/QuoteWizard';

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
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            authService.isAuthenticated() ? 
            <Navigate to="/dashboard" replace /> : 
            <Login />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route
          path="/seleccionar-cotizacion"
          element={
            <ProtectedRoute>
              <QuoteSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wizard"
          element={
            <ProtectedRoute>
              <QuoteWizard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/" 
          element={<Navigate to="/seleccionar-cotizacion" replace />} 
        />
        {/* Rutas adicionales se agregarán aquí */}
        <Route 
          path="*" 
          element={<Navigate to="/seleccionar-cotizacion" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;


