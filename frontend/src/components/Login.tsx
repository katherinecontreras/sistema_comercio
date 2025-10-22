// src/components/Login.tsx
import React, { useState } from 'react';
import { authService } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Importamos los componentes de shadcn/ui y los iconos
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Camera, User, Lock } from 'lucide-react';


// Importamos nuestro componente de animación
import MotionWrap from './animations/motion-wrap';

const Login: React.FC = () => {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({ dni, password });
      login(response.access_token, dni);
      navigate('/seleccionar-cliente');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
      
      <MotionWrap className="w-full max-w-sm">
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl shadow-glow p-8 space-y-8">
          
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-400/30">
              <Camera className="w-10 h-10 text-sky-300" />
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="dni"
                type="text"
                placeholder="Username"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required
                // Clases actualizadas para mejor consistencia con el tema oscuro
                className="pl-11 h-12 bg-white/5 border-white/20 focus:border-sky-400 focus-visible:ring-sky-400"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-11 h-12 bg-white/5 border-white/20 focus:border-sky-400 focus-visible:ring-sky-400"
              />
            </div>
            
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" className="border-gray-400" />
                <Label htmlFor="remember-me" className="text-gray-300 font-light cursor-pointer">
                  Remember me
                </Label>
              </div>
              <a href="#" className="font-medium text-sky-400 hover:text-sky-300">
                Forgot Password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-sky-600 hover:bg-sky-500 text-base font-bold text-white"
            >
              {loading ? 'Logging in...' : 'LOGIN'}
            </Button>
            
          </form>
        </div>
      </MotionWrap>
    </div>
  );
};

export default Login;
