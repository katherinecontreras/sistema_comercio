import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { addCliente } from '@/actions';
import { BaseModal, FormField } from '@/components';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const AddClientModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    razon_social: '',
    cuit: '',
    actividad: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { execute, loading, error } = useAsyncOperation();

  // Limpiar campos cuando se abre el modal
  useEffect(() => {
    if (open) {
      setFormData({
        razon_social: '',
        cuit: '',
        actividad: ''
      });
      setErrors({});
    }
  }, [open]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.razon_social.trim()) {
      newErrors.razon_social = 'Razón Social es requerido';
    }
    
    if (!formData.cuit.trim()) {
      newErrors.cuit = 'CUIT es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    await execute(
      async () => {
        await addCliente(formData);
      },
      {
        showSuccessToast: true,
        showErrorToast: true,
        successMessage: 'Cliente creado exitosamente',
        errorMessage: 'Error al crear cliente',
        onSuccess: () => {
          onCreated();
          onClose();
          setFormData({
            razon_social: '',
            cuit: '',
            actividad: ''
          });
        }
      }
    );
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Agregar Cliente"
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            form="client-form"
            className="bg-sky-600 hover:bg-sky-700"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      }
    >
      <form id="client-form" onSubmit={handleSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
        <FormField
          label="Razón Social"
          required
          value={formData.razon_social}
          onChange={(e) => handleChange('razon_social', e.target.value)}
          error={errors.razon_social}
          placeholder="Ingrese la razón social"
        />
        
        <FormField
          label="CUIT"
          required
          value={formData.cuit}
          onChange={(e) => handleChange('cuit', e.target.value)}
          error={errors.cuit}
          placeholder="Ingrese el CUIT"
        />
        
        <FormField
          label="Actividad"
          value={formData.actividad}
          onChange={(e) => handleChange('actividad', e.target.value)}
          error={errors.actividad}
          placeholder="Ingrese la actividad (opcional)"
        />
        
        {error && (
          <div className="text-red-500 text-sm bg-red-900/20 border border-red-500/50 rounded p-3">
            {error}
          </div>
        )}
      </form>
    </BaseModal>
  );
};

export default AddClientModal;
