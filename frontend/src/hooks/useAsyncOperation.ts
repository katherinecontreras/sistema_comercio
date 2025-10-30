import { useState, useCallback } from 'react';
import { useToastHelpers } from '@/components/notifications/ToastProvider';

interface UseAsyncOperationOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

interface UseAsyncOperationReturn<T> {
  loading: boolean;
  error: string | null;
  execute: (operation: () => Promise<T>, options?: UseAsyncOperationOptions) => Promise<T | undefined>;
  clearError: () => void;
  reset: () => void;
}

/**
 * Hook para manejar operaciones asíncronas con estado de loading, error y notificaciones
 * Centraliza el patrón repetido de try/catch/finally con loading y error handling
 */
export const useAsyncOperation = <T = any>(): UseAsyncOperationReturn<T> => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToastHelpers();

  const execute = useCallback(async (
    operation: () => Promise<T>,
    options: UseAsyncOperationOptions = {}
  ): Promise<T | undefined> => {
    const {
      showSuccessToast = false,
      showErrorToast = true,
      successMessage = 'Operación completada exitosamente',
      errorMessage = 'Error en la operación',
      onSuccess,
      onError
    } = options;

    try {
      setLoading(true);
      setError(null);
      
      const result = await operation();
      
      // Ejecutar callback de éxito si existe
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Mostrar toast de éxito si está habilitado
      if (showSuccessToast) {
        showSuccess('Éxito', successMessage);
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || err?.message || errorMessage;
      setError(errorMsg);
      
      // Ejecutar callback de error si existe
      if (onError) {
        onError(err);
      }
      
      // Mostrar toast de error si está habilitado
      if (showErrorToast) {
        showError('Error', errorMsg);
      }
      
      // Re-lanzar el error para que el componente pueda manejarlo si es necesario
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError,
    reset
  };
};

/**
 * Hook especializado para operaciones CRUD con mensajes predefinidos
 */
export const useCrudOperation = () => {
  const asyncOp = useAsyncOperation();

  const create = useCallback((operation: () => Promise<any>, entityName: string = 'elemento') => {
    return asyncOp.execute(operation, {
      showSuccessToast: true,
      successMessage: `${entityName} creado exitosamente`,
      errorMessage: `Error al crear ${entityName}`
    });
  }, [asyncOp]);

  const update = useCallback((operation: () => Promise<any>, entityName: string = 'elemento') => {
    return asyncOp.execute(operation, {
      showSuccessToast: true,
      successMessage: `${entityName} actualizado exitosamente`,
      errorMessage: `Error al actualizar ${entityName}`
    });
  }, [asyncOp]);

  const remove = useCallback((operation: () => Promise<any>, entityName: string = 'elemento') => {
    return asyncOp.execute(operation, {
      showSuccessToast: true,
      successMessage: `${entityName} eliminado exitosamente`,
      errorMessage: `Error al eliminar ${entityName}`
    });
  }, [asyncOp]);

  const load = useCallback((operation: () => Promise<any>, entityName: string = 'datos') => {
    return asyncOp.execute(operation, {
      showSuccessToast: false,
      errorMessage: `Error al cargar ${entityName}`
    });
  }, [asyncOp]);

  return {
    ...asyncOp,
    create,
    update,
    remove,
    load
  };
};

export default useAsyncOperation;


