import React, { useEffect } from 'react';
import { useObraBaseStore } from '@/store/obra/obraStore';
import { useAppStore } from '@/store/app';
import { FormField, TextareaField, LoadingButton } from '@/components';
import { Button } from '@/components/ui/button';
import { useFormHandler, validators } from '@/hooks/useFormHandler';
import { getObras } from '@/actions/obras';

interface ObraFormData {
  id_obra: number;
  codigo_proyecto: string;
  nombre_proyecto: string;
  descripcion_proyecto: string;
  fecha_creacion: string;
  fecha_entrega: string;
  fecha_recepcion: string;
  moneda: string;
}

const initialFormData: ObraFormData = {
  id_obra: 0,
  codigo_proyecto: '',
  nombre_proyecto: '',
  descripcion_proyecto: '',
  fecha_creacion: new Date().toISOString().split('T')[0],
  fecha_entrega: '',
  fecha_recepcion: '',
  moneda: 'ARS'
};

const ObraForm: React.FC = () => {
  const { obra, setObra, setEditObra } = useObraBaseStore();
  const { client } = useAppStore();
  
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
      // Obtener último id de obras en DB para asignar uno provisional local si hace falta
      let newId = obra?.id_obra;
      try {
        const obrasDB = await getObras();
        const maxId = Array.isArray(obrasDB)
          ? obrasDB.reduce((acc: number, o: any) => {
              const v = Number(o?.id_obra) || 0;
              return v > acc ? v : acc;
            }, 0)
          : 0;
        if (!newId || newId <= 0) newId = maxId + 1;
      } catch (_) {
        // si falla, usar 1 o mantener existente
        if (!newId || newId <= 0) newId = 1;
      }

      // Guardar localmente en el store (NO en la base de datos)
      const { id_obra: _formIdIgnored, ...restData } = data;
      setObra({
        id_obra: newId!,
        ...restData,
        id_cliente: client.selectedClientId,
        estado: obra?.estado || 'borrador',
      });

      setEditObra(false)
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
        id_obra: obra.id_obra || 0,
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
