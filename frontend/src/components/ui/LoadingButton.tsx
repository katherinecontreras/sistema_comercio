import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: (e?: React.FormEvent) => void | Promise<void>;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Botón con estado de carga integrado
 */
const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  icon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <Button
      disabled={disabled || loading}
      className={`${className} ${loading ? 'cursor-not-allowed' : ''}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </Button>
  );
};

export default LoadingButton;
