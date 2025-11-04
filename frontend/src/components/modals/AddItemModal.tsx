import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { BaseModal, FormField } from '@/components';
import { useFormHandler, validators } from '@/hooks/useFormHandler';
import useItemObraBaseStore from '@/store/itemObra/itemObraStore';
import useObraBaseStore from '@/store/obra/obraStore';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

interface ItemFormData {
  descripcion: string;
}

const AddItemModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const { obra } = useObraBaseStore();
  const { itemsObra, setItemsObra, setItemCreate } = useItemObraBaseStore();

  const {
    loading,
    error,
    handleSubmit,
    getFieldProps,
    resetForm,
  } = useFormHandler<ItemFormData>({
    initialData: { descripcion: '' },
    validationRules: [
      { field: 'descripcion', validator: validators.required('Descripción') },
    ],
    onSubmit: async (data) => {
      const provisionalId = obra?.id_obra ?? -1;

      const nuevo = {
        id_item_Obra: Math.floor(Math.random() * 1000000),
        id_obra: provisionalId,
        descripcion: (data.descripcion || '').trim(),
        meses_operario: 0,
        capataz: 0,
      };
      setItemsObra([...(itemsObra || []), nuevo]);
    },
    onSuccess: () => {
      setItemCreate(false);
      if (onCreated) onCreated();
      onClose();
    },
    resetOnSuccess: true,
    successMessage: 'Item agregado',
    errorMessage: 'Error al agregar item',
  });

  const prevOpenRef = useRef<boolean | null>(null);
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    if (open && wasOpen === false) {
      resetForm();
    }
    if (wasOpen === null && open) {
      resetForm();
    }
    prevOpenRef.current = open;
  }, [open, resetForm]);

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Agregar Item"
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
          label="Descripción"
          required
          {...getFieldProps('descripcion')}
          placeholder="Ingrese la descripción del item"
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

export default AddItemModal;
