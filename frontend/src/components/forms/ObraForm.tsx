import React from 'react';
import { Card } from '@/components/ui/card';
import useObraStore from '@/store/obra/obraStore';
import { useAppStore } from '@/store/app';
import { useFormHandler, validators } from '@/hooks/useFormHandler';
import { FormField, TextareaField, LoadingButton } from '@/components';

interface ObraFormData {
  codigo_proyecto: string;
  nombre_proyecto: string;
  descripcion_proyecto: string;
  fecha_creacion: string;
  fecha_entrega: string;
  fecha_recepcion: string;
  moneda: string;
}

const ObraForm: React.FC = () => {
  const { setObra } = useObraStore();
  const { client } = useAppStore();

  const {
    formData,
    loading,
    error,
    handleSubmit,
    getFieldProps
  } = useFormHandler<ObraFormData>({
    initialData: {
      codigo_proyecto: '',
      nombre_proyecto: '',
      descripcion_proyecto: '',
      fecha_creacion: new Date().toISOString().split('T')[0],
      fecha_entrega: '',
      fecha_recepcion: '',
      moneda: 'ARS'
    },
    validationRules: [
      { field: 'nombre_proyecto', validator: validators.required('Nombre del proyecto') },
      { field: 'fecha_creacion', validator: validators.required('Fecha de creación') }
    ],
    onSubmit: async (data) => {
      if (!client.selectedClientId) {
        throw new Error('No hay cliente seleccionado');
      }
      
      setObra({
        ...data,
        id_cliente: client.selectedClientId,
        estado: 'borrador'
      });
    },
    showSuccessToast: true,
    successMessage: 'Obra creada exitosamente',
    errorMessage: 'Error al crear la obra'
  });

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-800 border-slate-700">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Crear Oferta de Obra</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Nombre del Proyecto"
                required
                {...getFieldProps('nombre_proyecto')}
                placeholder="Ingrese el nombre del proyecto"
              />
              
              <FormField
                label="Código del Proyecto"
                {...getFieldProps('codigo_proyecto')}
                placeholder="Código opcional del proyecto"
              />
            </div>

            <TextareaField
              label="Descripción del Proyecto"
              {...getFieldProps('descripcion_proyecto')}
              placeholder="Describe el proyecto..."
              rows={4}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Fecha de Creación <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...getFieldProps('fecha_creacion')}
                  className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Fecha de Entrega</label>
                <input
                  type="date"
                  {...getFieldProps('fecha_entrega')}
                  className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Fecha de Recepción</label>
                <input
                  type="date"
                  {...getFieldProps('fecha_recepcion')}
                  className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Moneda</label>
              <select
                value={formData.moneda}
                onChange={(e) => getFieldProps('moneda').onChange(e)}
                className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="ARS">ARS - Peso Argentino</option>
                <option value="USD">USD - Dólar Americano</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-900/20 border border-red-500/50 rounded p-3">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <LoadingButton
                loading={loading}
                loadingText="Creando..."
                className="bg-sky-600 hover:bg-sky-700 text-white"
                onClick={handleSubmit}
              >
                Continuar
              </LoadingButton>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ObraForm;
