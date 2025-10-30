import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Info } from 'lucide-react';

interface BaseFormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

interface FormFieldProps extends BaseFormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  min?: number | string;
  max?: number;
  step?: number;
  maxLength?: number;
  autoComplete?: string;
  autoFocus?: boolean;
}

interface TextareaFieldProps extends BaseFormFieldProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  rows?: number;
  maxLength?: number;
  autoFocus?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

/**
 * Componente base para campos de formulario con label, error y hint
 */
export const FormFieldWrapper: React.FC<BaseFormFieldProps> = ({
  label,
  required = false,
  error,
  hint,
  className = '',
  children,
  id
}) => {
  const fieldId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={fieldId} className="text-sm font-medium text-slate-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        {children}
      </div>
      
      {(error || hint) && (
        <div className="space-y-1">
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {hint && !error && (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Info className="h-4 w-4 flex-shrink-0" />
              <span>{hint}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Campo de texto con wrapper completo
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  hint,
  className,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
  readOnly,
  min,
  max,
  step,
  maxLength,
  autoComplete,
  autoFocus,
  ...props
}) => {
  const fieldId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <FormFieldWrapper
      label={label}
      required={required}
      error={error}
      hint={hint}
      className={className}
      id={fieldId}
    >
      <Input
        id={fieldId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        min={min}
        max={max}
        step={step}
        maxLength={maxLength}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={`${error ? 'border-red-500 focus:border-red-500' : ''}`}
        {...props}
      />
    </FormFieldWrapper>
  );
};

/**
 * Campo de textarea con wrapper completo
 */
export const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  required,
  error,
  hint,
  className,
  id,
  value,
  onChange,
  placeholder,
  disabled,
  readOnly,
  rows = 3,
  maxLength,
  autoFocus,
  resize = 'vertical',
  ...props
}) => {
  const fieldId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <FormFieldWrapper
      label={label}
      required={required}
      error={error}
      hint={hint}
      className={className}
      id={fieldId}
    >
      <Textarea
        id={fieldId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        rows={rows}
        maxLength={maxLength}
        autoFocus={autoFocus}
        className={`
          ${error ? 'border-red-500 focus:border-red-500' : ''}
          ${resize === 'none' ? 'resize-none' : ''}
          ${resize === 'vertical' ? 'resize-y' : ''}
          ${resize === 'horizontal' ? 'resize-x' : ''}
          ${resize === 'both' ? 'resize' : ''}
        `}
        {...props}
      />
    </FormFieldWrapper>
  );
};

/**
 * Campo numérico especializado
 */
interface NumberFieldProps extends Omit<FormFieldProps, 'type'> {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  allowNegative?: boolean;
  allowDecimal?: boolean;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  precision = 2,
  allowNegative = true,
  allowDecimal = true,
  onChange,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Permitir solo números, punto decimal y signo negativo
    if (!allowNegative) {
      value = value.replace(/-/g, '');
    }
    
    if (!allowDecimal) {
      value = value.replace(/\./g, '');
    }
    
    // Limitar precisión decimal
    if (allowDecimal && precision > 0) {
      const parts = value.split('.');
      if (parts[1] && parts[1].length > precision) {
        value = `${parts[0]}.${parts[1].substring(0, precision)}`;
      }
    }
    
    // Crear evento sintético
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value
      }
    };
    
    onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <FormField
      {...props}
      type="number"
      onChange={handleChange}
    />
  );
};

/**
 * Campo de contraseña con toggle de visibilidad
 */
interface PasswordFieldProps extends Omit<FormFieldProps, 'type'> {
  showToggle?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  showToggle = true,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <FormFieldWrapper
      label={props.label}
      required={props.required}
      error={props.error}
      hint={props.hint}
      className={props.className}
      id={props.id}
    >
      <div className="relative">
        <Input
          {...props}
          type={showPassword ? 'text' : 'password'}
          className={`${props.error ? 'border-red-500 focus:border-red-500' : ''} ${
            showToggle ? 'pr-10' : ''
          }`}
        />
        {showToggle && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </FormFieldWrapper>
  );
};

export default FormField;


