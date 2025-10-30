import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { addCliente } from '@/actions';
import { useFormHandler, validators } from '@/hooks/useFormHandler';
import { BaseModal, FormField } from '@/components';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface ClientFormData {
  razon_social: string;
  cuit: string;
  direccion: string;
}

const AddClientModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const {
    loading,
    error,
    handleSubmit,
    getFieldProps,
    resetForm
  } = useFormHandler<ClientFormData>({
    initialData: {
      razon_social: '',
      cuit: '',
      direccion: ''
    },
    validationRules: [
      { field: 'razon_social', validator: validators.required('Razón Social') },
      { field: 'cuit', validator: validators.required('CUIT') }
    ],
    onSubmit: async (data) => {
      await addCliente(data);
    },
    onSuccess: () => {
      onCreated();
      onClose();
    },
    resetOnSuccess: true,
    successMessage: 'Cliente creado exitosamente',
    errorMessage: 'Error al crear cliente'
  });

  // Limpiar campos cuando se abre el modal
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);


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
            onClick={handleSubmit}
            className="bg-sky-600 hover:bg-sky-700"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Razón Social"
          required
          {...getFieldProps('razon_social')}
          placeholder="Ingrese la razón social"
        />
        
        <FormField
          label="CUIT"
          required
          {...getFieldProps('cuit')}
          placeholder="Ingrese el CUIT"
        />
        
        <FormField
          label="Dirección"
          {...getFieldProps('direccion')}
          placeholder="Ingrese la dirección (opcional)"
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



