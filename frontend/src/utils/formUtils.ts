
// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

export interface FormFieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string | number; label: string }>;
  validation?: ValidationRule[];
  className?: string;
  rows?: number; // Para textarea
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface FormConfig<T = any> {
  fields: FormFieldConfig[];
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// ============================================================================
// VALIDADORES COMUNES
// ============================================================================

export const commonValidators = {
  required: (fieldName: string): ValidationRule => ({
    type: 'required',
    message: `${fieldName} es requerido`
  }),

  minLength: (fieldName: string, min: number): ValidationRule => ({
    type: 'minLength',
    value: min,
    message: `${fieldName} debe tener al menos ${min} caracteres`
  }),

  maxLength: (fieldName: string, max: number): ValidationRule => ({
    type: 'maxLength',
    value: max,
    message: `${fieldName} no debe exceder ${max} caracteres`
  }),

  email: (): ValidationRule => ({
    type: 'pattern',
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Formato de email inválido'
  }),

  phone: (): ValidationRule => ({
    type: 'pattern',
    value: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Formato de teléfono inválido'
  }),

  positiveNumber: (fieldName: string): ValidationRule => ({
    type: 'custom',
    message: `${fieldName} debe ser un número positivo`,
    validator: (value: any) => !isNaN(value) && parseFloat(value) > 0
  }),

  nonNegativeNumber: (fieldName: string): ValidationRule => ({
    type: 'custom',
    message: `${fieldName} debe ser un número no negativo`,
    validator: (value: any) => !isNaN(value) && parseFloat(value) >= 0
  }),

  dateNotInPast: (): ValidationRule => ({
    type: 'custom',
    message: 'La fecha no puede ser anterior a hoy',
    validator: (value: string) => {
      if (!value) return true; // Opcional
      return new Date(value) >= new Date(new Date().toDateString());
    }
  }),

  custom: (message: string, validator: (value: any) => boolean): ValidationRule => ({
    type: 'custom',
    message,
    validator
  })
};

// ============================================================================
// UTILIDADES DE VALIDACIÓN
// ============================================================================

export const validateField = (value: any, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (value === null || value === undefined || value === '') {
          return rule.message;
        }
        break;

      case 'minLength':
        if (typeof value === 'string' && value.length < rule.value) {
          return rule.message;
        }
        break;

      case 'maxLength':
        if (typeof value === 'string' && value.length > rule.value) {
          return rule.message;
        }
        break;

      case 'pattern':
        if (typeof value === 'string' && !rule.value.test(value)) {
          return rule.message;
        }
        break;

      case 'custom':
        if (rule.validator && !rule.validator(value)) {
          return rule.message;
        }
        break;
    }
  }
  return null;
};

export const validateForm = <T extends Record<string, any>>(
  values: T,
  config: FormConfig<T>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const errors: Partial<Record<keyof T, string>> = {};
  let isValid = true;

  config.fields.forEach(field => {
    if (field.validation) {
      const error = validateField(values[field.name as keyof T], field.validation);
      if (error) {
        errors[field.name as keyof T] = error;
        isValid = false;
      }
    }
  });

  return { isValid, errors };
};

// ============================================================================
// UTILIDADES DE TRANSFORMACIÓN
// ============================================================================

export const transformFormData = {
  // Convertir strings a números
  toNumber: (value: string): number | null => {
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  },

  // Convertir números a strings para inputs
  toString: (value: number | null | undefined): string => {
    return value?.toString() || '';
  },

  // Limpiar strings
  cleanString: (value: string): string => {
    return value?.trim() || '';
  },

  // Formatear fechas para inputs
  toDateInput: (date: Date | string | null): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },

  // Convertir fecha de input a Date
  fromDateInput: (dateString: string): Date | null => {
    return dateString ? new Date(dateString) : null;
  },

  // Capitalizar primera letra
  capitalize: (value: string): string => {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  },

  // Formatear moneda
  toCurrency: (value: number, currency = 'ARS'): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency
    }).format(value);
  },

  // Parsear moneda a número
  fromCurrency: (value: string): number => {
    return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
  }
};

// ============================================================================
// UTILIDADES DE CONFIGURACIÓN DE FORMULARIOS
// ============================================================================

export const createFormConfig = <T extends Record<string, any>>(
  config: Partial<FormConfig<T>>
): FormConfig<T> => ({
  fields: [],
  initialValues: {} as T,
  onSubmit: async () => {},
  validationMode: 'onBlur',
  ...config
});

// Configuraciones predefinidas para formularios comunes
export const formConfigs = {
  // Configuración para datos de obra
  obra: (): FormConfig<any> => ({
    fields: [
      {
        name: 'nombre_proyecto',
        label: 'Nombre del Proyecto',
        type: 'text',
        required: true,
        validation: [commonValidators.required('Nombre del proyecto')]
      },
      {
        name: 'codigo_proyecto',
        label: 'Código del Proyecto',
        type: 'text',
        placeholder: 'Código opcional'
      },
      {
        name: 'descripcion_proyecto',
        label: 'Descripción',
        type: 'textarea',
        rows: 4,
        placeholder: 'Describe el proyecto...'
      },
      {
        name: 'fecha_creacion',
        label: 'Fecha de Creación',
        type: 'date',
        required: true,
        validation: [commonValidators.required('Fecha de creación')]
      },
      {
        name: 'fecha_entrega',
        label: 'Fecha de Entrega',
        type: 'date',
        validation: [commonValidators.dateNotInPast()]
      },
      {
        name: 'moneda',
        label: 'Moneda',
        type: 'select',
        options: [
          { value: 'ARS', label: 'ARS - Peso Argentino' },
          { value: 'USD', label: 'USD - Dólar Americano' },
          { value: 'EUR', label: 'EUR - Euro' }
        ]
      }
    ],
    initialValues: {
      nombre_proyecto: '',
      codigo_proyecto: '',
      descripcion_proyecto: '',
      fecha_creacion: new Date().toISOString().split('T')[0],
      fecha_entrega: '',
      moneda: 'ARS'
    },
    onSubmit: async () => {}
  }),

  // Configuración para partidas
  partida: (): FormConfig<any> => ({
    fields: [
      {
        name: 'nombre_partida',
        label: 'Nombre de la Partida',
        type: 'text',
        required: true,
        validation: [commonValidators.required('Nombre de la partida')]
      },
      {
        name: 'codigo',
        label: 'Código',
        type: 'text',
        placeholder: 'Código opcional'
      },
      {
        name: 'descripcion',
        label: 'Descripción',
        type: 'textarea',
        rows: 3,
        placeholder: 'Describe la partida...'
      },
      {
        name: 'duracion',
        label: 'Duración',
        type: 'number',
        required: true,
        validation: [
          commonValidators.required('Duración'),
          commonValidators.positiveNumber('Duración')
        ]
      }
    ],
    initialValues: {
      nombre_partida: '',
      codigo: '',
      descripcion: '',
      duracion: 1,
      tiene_subpartidas: false
    },
    onSubmit: async () => {}
  }),

  // Configuración para incrementos
  incremento: (): FormConfig<any> => ({
    fields: [
      {
        name: 'concepto',
        label: 'Concepto',
        type: 'text',
        required: true,
        validation: [commonValidators.required('Concepto')]
      },
      {
        name: 'descripcion',
        label: 'Descripción',
        type: 'textarea',
        rows: 2,
        placeholder: 'Describe el incremento...'
      },
      {
        name: 'tipo_incremento',
        label: 'Tipo de Incremento',
        type: 'select',
        required: true,
        options: [
          { value: 'porcentaje', label: 'Porcentaje' },
          { value: 'monto_fijo', label: 'Monto Fijo' }
        ],
        validation: [commonValidators.required('Tipo de incremento')]
      },
      {
        name: 'valor',
        label: 'Valor',
        type: 'number',
        required: true,
        validation: [
          commonValidators.required('Valor'),
          commonValidators.positiveNumber('Valor')
        ]
      }
    ],
    initialValues: {
      concepto: '',
      descripcion: '',
      tipo_incremento: 'porcentaje',
      valor: 0,
      monto_calculado: 0
    },
    onSubmit: async () => {}
  })
};

// ============================================================================
// UTILIDADES DE DEBUGGING
// ============================================================================

export const debugForm = <T extends Record<string, any>>(
  formName: string,
  values: T,
  errors: Partial<Record<keyof T, string>>,
  isValid: boolean
) => {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    console.group(`🔍 Form Debug: ${formName}`);
    console.log('Values:', values);
    console.log('Errors:', errors);
    console.log('Is Valid:', isValid);
    console.groupEnd();
  }
};

export default {
  commonValidators,
  validateField,
  validateForm,
  transformFormData,
  createFormConfig,
  formConfigs,
  debugForm
};
