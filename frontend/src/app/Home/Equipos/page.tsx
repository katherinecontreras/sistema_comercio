import React, { useEffect, useRef } from 'react';
import useEquipoBaseStore from '@/store/equipo/equipoStore';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import EquiposTable from '@/components/tables/EquiposTable';
import { getEquipos, importEquiposOriginal, resetEquipos } from '@/actions/equipos';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

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
    <div className="p-4">
      {/* Header */}
      <div className="relative flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-900/40">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M20 7h-4m-4 0H4m16 5h-4m-4 0H4m16 5h-4m-4 0H4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Equipos – Vista por Secciones
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Visualiza y filtra costos de propiedad, operación y resumen de equipos.
            </p>
          </div>
        </div>
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
      </div>

      {/* Tabla */}
      <div>
        <EquiposTable rows={equipos} loading={loading || loadingLoad || loadingImport} />
      </div>
    </div>
  );
};

export default Equipos;
