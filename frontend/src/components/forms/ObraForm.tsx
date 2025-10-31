import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useObraBaseStore } from '@/store/obra/obraStore';
import { useAppStore } from '@/store/app';
import { FormField, TextareaField, LoadingButton } from '@/components';
import { Button } from '@/components/ui/button';
import { useFormHandler, validators } from '@/hooks/useFormHandler';

interface ObraFormData {
  codigo_proyecto: string;
  nombre_proyecto: string;
  descripcion_proyecto: string;
  fecha_creacion: string;
  fecha_entrega: string;
  fecha_recepcion: string;
  moneda: string;
}

const initialFormData: ObraFormData = {
  codigo_proyecto: '',
  nombre_proyecto: '',
  descripcion_proyecto: '',
  fecha_creacion: new Date().toISOString().split('T')[0],
  fecha_entrega: '',
  fecha_recepcion: '',
  moneda: 'ARS'
};

const ObraForm: React.FC = () => {
  const { obra, setObra } = useObraBaseStore();
  const { client } = useAppStore();
  const navigate = useNavigate();
  
  const {
    loading,
    error,
    handleSubmit,
    setFormData,
    resetForm,
    getFieldProps
  } = useFormHandler<ObraFormData>({
    initialData: initialFormData,
    validationRules: [
      { field: 'nombre_proyecto', validator: validators.required('Nombre del proyecto') },
      { field: 'fecha_creacion', validator: validators.required('Fecha de creación') }
    ],
    onSubmit: async (data) => {
      if (!client.selectedClientId) {
        throw new Error('No hay cliente seleccionado');
      }
      
      // Guardar localmente en el store (NO en la base de datos)
      setObra({
        ...data,
        id_cliente: client.selectedClientId,
        estado: obra?.estado || 'borrador',
        id_obra: obra?.id_obra // Mantener el ID si existe
      });
    },
    onSuccess: () => {
      // Redirigir a recursos después de guardar exitosamente
      navigate('/oferta/recursos');
    },
    showSuccessToast: true,
    successMessage: 'Obra guardada exitosamente',
    errorMessage: 'Error al guardar la obra',
    resetOnSuccess: false
  });

  // Cargar datos de la obra local si existe
  useEffect(() => {
    if (obra) {
      setFormData({
        codigo_proyecto: obra.codigo_proyecto || '',
        nombre_proyecto: obra.nombre_proyecto || '',
        descripcion_proyecto: obra.descripcion_proyecto || '',
        fecha_creacion: obra.fecha_creacion || new Date().toISOString().split('T')[0],
        fecha_entrega: obra.fecha_entrega || '',
        fecha_recepcion: obra.fecha_recepcion || '',
        moneda: obra.moneda || 'ARS'
      });
    }
  }, [obra, setFormData]);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="relative flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-900/40">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Información de la Obra
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Completa los datos de la obra para comenzar la cotización
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="px-6">
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/50 rounded-lg p-6 border border-slate-700">
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
                required
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
              {...getFieldProps('moneda')}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setObra(null);
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Limpiar
            </Button>
            <LoadingButton
              type="submit"
              loading={loading}
              loadingText="Guardando..."
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              Guardar Obra
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ObraForm;
