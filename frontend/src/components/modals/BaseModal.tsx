import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  variant?: 'default' | 'danger' | 'warning' | 'info' | 'success';
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const BaseModal: React.FC<BaseModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnEscape = true,
  closeOnBackdrop = true,
  variant = 'default',
  icon,
  footer,
  className = '',
  contentClassName = ''
}) => {
  // Manejar tecla Escape
  useEffect(() => {
    if (!closeOnEscape || !open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEscape, open, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Manejar click en backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Obtener clases de tamaño
  const getSizeClasses = () => {
    const sizeMap = {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      full: 'max-w-full mx-4'
    };
    return sizeMap[size];
  };

  // Obtener estilos de variante
  const getVariantStyles = () => {
    const variantMap = {
      default: {
        headerBg: 'bg-slate-800',
        borderColor: 'border-slate-700',
        iconColor: 'text-slate-400',
        defaultIcon: null
      },
      danger: {
        headerBg: 'bg-red-900/20',
        borderColor: 'border-red-500/50',
        iconColor: 'text-red-500',
        defaultIcon: <AlertTriangle className="h-5 w-5" />
      },
      warning: {
        headerBg: 'bg-yellow-900/20',
        borderColor: 'border-yellow-500/50',
        iconColor: 'text-yellow-500',
        defaultIcon: <AlertCircle className="h-5 w-5" />
      },
      info: {
        headerBg: 'bg-blue-900/20',
        borderColor: 'border-blue-500/50',
        iconColor: 'text-blue-500',
        defaultIcon: <Info className="h-5 w-5" />
      },
      success: {
        headerBg: 'bg-green-900/20',
        borderColor: 'border-green-500/50',
        iconColor: 'text-green-500',
        defaultIcon: <CheckCircle className="h-5 w-5" />
      }
    };
    return variantMap[variant];
  };

  const variantStyles = getVariantStyles();
  const displayIcon = icon || variantStyles.defaultIcon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ${className}`}
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`
              relative w-full ${getSizeClasses()} 
              bg-slate-800 border ${variantStyles.borderColor} 
              rounded-lg shadow-xl
              ${contentClassName}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`
              flex items-center justify-between p-6 pb-4
              ${variantStyles.headerBg} rounded-t-lg
            `}>
              <div className="flex items-center gap-3">
                {displayIcon && (
                  <div className={variantStyles.iconColor}>
                    {displayIcon}
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white">
                  {title}
                </h3>
              </div>
              
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 pb-6 border-t border-slate-700 mt-4 pt-4">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Componente especializado para modales de confirmación
 */
interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false
}) => {
  const getConfirmButtonVariant = () => {
    const variantMap = {
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      info: 'bg-blue-600 hover:bg-blue-700 text-white'
    };
    return variantMap[variant];
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={title}
      variant={variant}
      size="sm"
      footer={
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={getConfirmButtonVariant()}
          >
            {loading ? 'Procesando...' : confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-slate-300">{message}</p>
    </BaseModal>
  );
};

export default BaseModal;


