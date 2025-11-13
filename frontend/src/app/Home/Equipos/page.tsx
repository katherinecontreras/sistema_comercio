import React, { useEffect, useRef } from 'react';
import { Upload, Package } from 'lucide-react';

import { getEquipos, importEquiposOriginal, resetEquipos } from '@/actions/equipos';
import { HeaderHome } from '@/components';
import EquiposTable from '@/components/tables/EquiposTable';
import { Button } from '@/components/ui/button';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import useEquipoBaseStore from '@/store/equipo/equipoStore';

const Equipos: React.FC = () => {
  const { equipos, setEquipos, loading, setLoading, setError } = useEquipoBaseStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { execute: executeLoad, loading: loadingLoad } = useAsyncOperation();
  const { execute: executeImport, loading: loadingImport } = useAsyncOperation();

  // Cargar datos al montar
  useEffect(() => {
    executeLoad(
      async () => {
        setLoading(true);
        const data = await getEquipos();
        setEquipos(Array.isArray(data) ? data : []);
      },
      {
        showErrorToast: false,
        onError: (err: any) => {
          setError(err?.message || 'Error cargando equipos');
        },
        onSuccess: () => {
          setLoading(false);
        }
      }
    );
  }, [executeLoad, setLoading, setError, setEquipos]);

  // Sincronizar loading del hook con el store
  useEffect(() => {
    if (loadingLoad) setLoading(true);
  }, [loadingLoad, setLoading]);

  const handleCargarEquiposClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    await executeImport(
      async () => {
        // Reset antes de cargar
        await resetEquipos();
        // Importar
        await importEquiposOriginal(file);
        // Refrescar lista
        const data = await getEquipos();
        setEquipos(Array.isArray(data) ? data : []);
      },
      {
        showSuccessToast: true,
        successMessage: 'Equipos cargados exitosamente',
        errorMessage: 'Error cargando equipos',
        onSuccess: () => {
          setLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
        onError: (err: any) => {
          const errorMessage = err?.response?.data?.detail || err?.message || 'Error cargando equipos';
          setError(errorMessage);
          console.error('Error al cargar equipos:', err);
          console.error('Error completo:', JSON.stringify(err?.response?.data, null, 2));
          setLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <HeaderHome
        title="Equipos – Vista por Secciones"
        description="Visualiza y filtra costos de propiedad, operación y resumen de equipos."
        icon={Package}
        aside={
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              onClick={handleCargarEquiposClick}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Cargar Equipos</span>
              <span className="sm:hidden">Cargar</span>
            </Button>
          </div>
        }
      />

      <EquiposTable rows={equipos} loading={loading || loadingLoad || loadingImport} />
    </div>
  );
};

export default Equipos;
