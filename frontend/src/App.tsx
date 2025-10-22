import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import QuoteSelection from './pages/selection/QuoteSelection';
// import QuoteWizard from './pages/wizard/QuoteWizard';
import ObraPage from './pages/ObraPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
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
        {/* <Route
          path="/wizard"
          element={
            <ProtectedRoute>
              <QuoteWizard />
            </ProtectedRoute>
          }
        /> */}
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
            isAuthenticated ? 
            <Navigate to="/seleccionar-cliente" replace /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="*" 
          element={
            isAuthenticated ? 
            <Navigate to="/seleccionar-cliente" replace /> : 
            <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;


