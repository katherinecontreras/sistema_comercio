import { useEffect } from 'react';
import { useAppStore } from '@/store/app';

export const useAuth = () => {
  const { user, setToken, setDni, logout } = useAppStore();

  // Sincronizar token del localStorage con el store al cargar
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && !user.accessToken) {
      setToken(token);
    }
  }, [user.accessToken, setToken]);

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    return !!token && !!user.accessToken;
  };

  // Login
  const login = (token: string, dni: string) => {
    setToken(token);
    setDni(dni);
  };

  // Logout
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return {
    isAuthenticated: isAuthenticated(),
    user,
    login,
    logout: handleLogout,
  };
};




