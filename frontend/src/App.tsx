import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/auth';
import { ToastProvider } from './components/notifications/ToastProvider';
import Layout from './Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import QuoteSelection from './pages/selection/QuoteSelection';
import ObraPage from './pages/ObraPage';

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
        <Route 
          path="/login" 
          element={
            authService.isAuthenticated() ? 
            <Navigate to="/seleccionar-cliente" replace /> : 
            <Login />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route
          path="/seleccionar-cliente"
          element={
            <ProtectedRoute>
              <QuoteSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/obra"
          element={
            <ProtectedRoute>
              <ObraPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/" 
          element={
            authService.isAuthenticated() ? 
            <Navigate to="/seleccionar-cliente" replace /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="*" 
          element={
            authService.isAuthenticated() ? 
            <Navigate to="/seleccionar-cliente" replace /> : 
            <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </Router>
    </ToastProvider>
  );
}

export default App;


