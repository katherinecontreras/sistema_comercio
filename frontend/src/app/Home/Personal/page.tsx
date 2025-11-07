import { useEffect, useRef, useState } from 'react';
import { getPersonal, importPersonalOriginal, resetPersonalTable } from '@/actions/personal';
import { usePersonalBaseStore } from '@/store/personal/personalStore';
import PersonalTable from '@/components/tables/PersonalTable';
import { Button } from '@/components/ui/button';
import { Upload, Calendar } from 'lucide-react';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import MesesJornadaPage from './MesesJornada/page';

const PersonalPage = () => {
  const [showMesesJornada, setShowMesesJornada] = useState(false);
  const { personales, setPersonales, loading, setLoading, setError } = usePersonalBaseStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { execute: executeLoad, loading: loadingLoad } = useAsyncOperation();
  const { execute: executeImport, loading: loadingImport } = useAsyncOperation();

  // Cargar datos al montar
  useEffect(() => {
    executeLoad(
      async () => {
        setLoading(true);
        const data = await getPersonal();
        setPersonales(Array.isArray(data) ? data : []);
      },
      {
        showErrorToast: false,
        onError: (err: any) => {
          setError(err?.message || 'Error cargando personal');
        },
        onSuccess: () => {
          setLoading(false);
        }
      }
    );
  }, [executeLoad, setLoading, setError, setPersonales]);

  // Sincronizar loading del hook con el store
  useEffect(() => {
    if (loadingLoad) setLoading(true);
  }, [loadingLoad, setLoading]);

  const handleCargarPersonalClick = () => {
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
        await resetPersonalTable();
        // Importar
        await importPersonalOriginal(file);
        // Refrescar lista
        const data = await getPersonal();
        setPersonales(Array.isArray(data) ? data : []);
      },
      {
        showSuccessToast: true,
        successMessage: 'Personal cargado exitosamente',
        errorMessage: 'Error cargando personal',
        onSuccess: () => {
          setLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
        onError: (err: any) => {
          const errorMessage = err?.response?.data?.detail || err?.message || 'Error cargando personal';
          setError(errorMessage);
          console.error('Error al cargar personal:', err);
          console.error('Error completo:', JSON.stringify(err?.response?.data, null, 2));
          setLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      }
    );
  };

  return (
    <div className="p-4">
      <div className="relative flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-900/40">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Personal – Vista por Secciones
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Visualiza y filtra sueldos, costos, descuentos, cargas sociales y otros conceptos.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!showMesesJornada && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                onClick={handleCargarPersonalClick}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Cargar Personal</span>
                <span className="sm:hidden">Cargar</span>
              </Button>
            </>
          )}
          <Button
            onClick={() => setShowMesesJornada(!showMesesJornada)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">
              {showMesesJornada ? 'Volver a Personal' : 'Ajustar Meses Jornada'}
            </span>
            <span className="sm:hidden">
              {showMesesJornada ? 'Personal' : 'Meses'}
            </span>
          </Button>
        </div>
      </div>
      {/* Contenido: Personal o MesesJornada */}
      {showMesesJornada ? (
        <MesesJornadaPage />
      ) : (
        <div>
          <PersonalTable rows={personales} loading={loading || loadingLoad || loadingImport} />
        </div>
      )}
    </div>
  );
};

export default PersonalPage;