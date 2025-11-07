import { useState, useCallback } from 'react';
import { useAsyncOperation } from './useAsyncOperation';

interface ValidationRule<T> {
  field: keyof T;
  validator: (value: any, formData: T) => string | null;
}

interface UseFormHandlerOptions<T> {
  initialData: T;
  validationRules?: ValidationRule<T>[];
  onSubmit: (data: T) => Promise<any>;
  onSuccess?: (result: any, formData: T) => void;
  onError?: (error: any, formData: T) => void;
  resetOnSuccess?: boolean;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

interface UseFormHandlerReturn<T> {
  formData: T;
  errors: Partial<Record<keyof T, string>>;
  loading: boolean;
  error: string | null;
  isValid: boolean;
  isDirty: boolean;
  
  // Métodos para manejar campos
  updateField: (field: keyof T, value: any) => void;
  updateFields: (updates: Partial<T>) => void;
  setFormData: (data: T) => void;
  resetForm: () => void;
  
  // Métodos para validación
  validateField: (field: keyof T) => string | null;
  validateForm: () => boolean;
  clearErrors: () => void;
  clearFieldError: (field: keyof T) => void;
  
  // Método para envío
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  
  // Utilidades
  getFieldProps: (field: keyof T) => {
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    error?: string;
  };
}

/**
 * Hook para manejar formularios con validación, estado y envío
 * Centraliza la lógica común de formularios
 */
export const useFormHandler = <T extends Record<string, any>>(
  options: UseFormHandlerOptions<T>
): UseFormHandlerReturn<T> => {
  const {
    initialData,
    validationRules = [],
    onSubmit,
    onSuccess,
    onError,
    resetOnSuccess = false,
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'Formulario enviado exitosamente',
    errorMessage = 'Error al enviar formulario'
  } = options;

  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isDirty, setIsDirty] = useState(false);
  
  const { loading, error, execute } = useAsyncOperation();

  // Validar un campo específico
  const validateField = useCallback((field: keyof T): string | null => {
    const rule = validationRules.find(r => r.field === field);
    if (!rule) return null;
    
    return rule.validator(formData[field], formData);
  }, [formData, validationRules]);

  // Validar todo el formulario
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    validationRules.forEach(rule => {
      const error = rule.validator(formData[rule.field], formData);
      if (error) {
        newErrors[rule.field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validationRules]);

  // Actualizar un campo
  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Actualizar múltiples campos
  const updateFields = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
    
    // Limpiar errores de los campos actualizados
    const fieldsToUpdate = Object.keys(updates) as (keyof T)[];
    setErrors(prev => {
      const newErrors = { ...prev };
      fieldsToUpdate.forEach(field => {
        delete newErrors[field];
      });
      return newErrors;
    });
  }, []);

  // Resetear formulario
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsDirty(false);
  }, [initialData]);

  // Limpiar errores
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Limpiar error de un campo específico
  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Manejar envío del formulario
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Validar formulario antes de enviar
    if (!validateForm()) {
      return;
    }

    try {
      const result = await execute(
        () => onSubmit(formData),
        {
          showSuccessToast,
          showErrorToast,
          successMessage,
          errorMessage,
          onSuccess: (result) => {
            if (onSuccess) {
              onSuccess(result, formData);
            }
            if (resetOnSuccess) {
              resetForm();
            }
          },
          onError: (error) => {
            if (onError) {
              onError(error, formData);
            }
          }
        }
      );
      
      return result;
    } catch (error) {
      // El error ya fue manejado por useAsyncOperation
      throw error;
    }
  }, [
    formData,
    validateForm,
    execute,
    onSubmit,
    onSuccess,
    onError,
    resetOnSuccess,
    showSuccessToast,
    showErrorToast,
    successMessage,
    errorMessage,
    resetForm
  ]);

  // Obtener props para un campo (útil para inputs)
  const getFieldProps = useCallback((field: keyof T) => ({
    value: formData[field] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      updateField(field, e.target.value);
    },
    error: errors[field]
  }), [formData, errors, updateField]);

  // Calcular si el formulario es válido
  const isValid = Object.keys(errors).length === 0;

  return {
    formData,
    errors,
    loading,
    error,
    isValid,
    isDirty,
    updateField,
    updateFields,
    setFormData,
    resetForm,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    handleSubmit,
    getFieldProps
  };
};

/**
 * Validadores comunes para usar con useFormHandler
 */
export const validators = {
  required: (fieldName: string) => (value: any) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} es requerido`;
    }
    return null;
  },

  email: (value: string) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Email inválido';
  },

  minLength: (min: number, fieldName: string) => (value: string) => {
    if (!value) return null;
    return value.length >= min ? null : `${fieldName} debe tener al menos ${min} caracteres`;
  },

  maxLength: (max: number, fieldName: string) => (value: string) => {
    if (!value) return null;
    return value.length <= max ? null : `${fieldName} no puede tener más de ${max} caracteres`;
  },

  numeric: (fieldName: string) => (value: any) => {
    if (!value) return null;
    const num = Number(value);
    return !isNaN(num) ? null : `${fieldName} debe ser un número válido`;
  },

  positive: (fieldName: string) => (value: any) => {
    if (!value) return null;
    const num = Number(value);
    return num > 0 ? null : `${fieldName} debe ser mayor a 0`;
  },

  custom: (validatorFn: (value: any) => boolean, errorMessage: string) => (value: any) => {
    return validatorFn(value) ? null : errorMessage;
  }
};

export default useFormHandler;
