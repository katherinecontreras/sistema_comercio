import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/auth';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return authService.isAuthenticated() ? (
    <Layout>{children}</Layout>
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
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />
        {/* Rutas adicionales se agregarán aquí */}
        <Route 
          path="*" 
          element={<Navigate to="/dashboard" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;


