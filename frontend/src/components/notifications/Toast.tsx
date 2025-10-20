import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { FadeIn } from '@/components/animations';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
  show: boolean;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  show
}) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/90 border-green-600';
      case 'error':
        return 'bg-red-900/90 border-red-600';
      case 'warning':
        return 'bg-amber-900/90 border-amber-600';
      default:
        return 'bg-blue-900/90 border-blue-600';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <FadeIn direction="right" duration={0.3}>
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${getBackgroundColor()} shadow-lg backdrop-blur-sm min-w-[300px] max-w-[500px]`}
        >
          {getIcon()}
          <p className="flex-1 text-sm text-white">{message}</p>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </FadeIn>
    </div>
  );
};

