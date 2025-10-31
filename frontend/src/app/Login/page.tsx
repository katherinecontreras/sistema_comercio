// src/components/Login.tsx
import React from 'react';
import { authService } from '@/services/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFormHandler, validators } from '@/hooks/useFormHandler';

// Importamos los componentes de shadcn/ui y los iconos
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Camera, User, Lock } from 'lucide-react';


// Importamos nuestro componente de animación
import MotionWrap from '@/components/animations/motion-wrap';

interface LoginFormData {
  dni: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const {
    loading,
    error,
    handleSubmit,
    getFieldProps
  } = useFormHandler<LoginFormData>({
    initialData: {
      dni: '',
      password: ''
    },
    validationRules: [
      { field: 'dni', validator: validators.required('Usuario') },
      { field: 'password', validator: validators.required('Contraseña') }
    ],
    onSubmit: async (data) => {
      const response = await authService.login({ dni: data.dni, password: data.password });
      login(response.access_token, data.dni);
      navigate('/seleccionar-cliente');
    },
    showErrorToast: true,
    errorMessage: 'Error al iniciar sesión',
    showSuccessToast: false,
    resetOnSuccess: false
  });

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
                {...getFieldProps('dni')}
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
                {...getFieldProps('password')}
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
