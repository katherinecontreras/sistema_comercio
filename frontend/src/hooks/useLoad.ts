import { useEffect } from 'react';
import useAsyncOperation from './useAsyncOperation';
import { getRecursos, getTiposRecurso } from '@/actions/recursos';
import { getPersonal } from '@/actions/personal';
import { getEquipos } from '@/actions/equipos';
/**
 * Hook centralizado para cargar datos base del sistema.
 * Se puede usar en páginas o stores que necesiten inicializar datos.
 * 
 * @returns Objeto con estados de loading para cada operación
 */
export const useLoad = ({
  tipoRecursoSelected,
  setTiposRecursoDB,
  setPersonalDB,
  setEquiposDB,
  setRecursosDB,
}: {
  tipoRecursoSelected?: { id_tipo_recurso?: number };
  setTiposRecursoDB: (data: any[]) => void;
  setPersonalDB: (data: any[]) => void;
  setEquiposDB: (data: any[]) => void;
  setRecursosDB: (data: any[]) => void;
}) => {

  // Reutilizamos las funciones de ejecución controlada
  const { execute: executeLoadTipos, loading: loadingTipos } = useAsyncOperation();
  const { execute: executeLoadRecursos, loading: loadingRecursos } = useAsyncOperation();
  const { execute: executeLoadPersonal, loading: loadingPersonal } = useAsyncOperation();
  const { execute: executeLoadEquipos, loading: loadingEquipos } = useAsyncOperation();

  // 🔹 Cargar tipos de recurso al montar
  useEffect(() => {
    executeLoadTipos(
      async () => {
        const data = await getTiposRecurso();
        setTiposRecursoDB(Array.isArray(data) ? data : []);
      },
      {
        showErrorToast: true,
        errorMessage: 'Error cargando tipos de recurso',
      }
    );
  }, [executeLoadTipos, setTiposRecursoDB]);

  // 🔹 Cargar personal y equipos
  useEffect(() => {
    executeLoadPersonal(
      async () => {
        const data = await getPersonal();
        setPersonalDB(Array.isArray(data) ? data : []);
      },
      { showErrorToast: false }
    );

    executeLoadEquipos(
      async () => {
        const data = await getEquipos();
        setEquiposDB(Array.isArray(data) ? data : []);
      },
      { showErrorToast: false }
    );
  }, [executeLoadPersonal, executeLoadEquipos, setPersonalDB, setEquiposDB]);

  // 🔹 Cargar recursos cuando se selecciona un tipo
  useEffect(() => {
    if (tipoRecursoSelected?.id_tipo_recurso) {
      executeLoadRecursos(
        async () => {
          const data = await getRecursos(tipoRecursoSelected.id_tipo_recurso);
          setRecursosDB(Array.isArray(data) ? data : []);
        },
        {
          showErrorToast: true,
          errorMessage: 'Error cargando recursos',
        }
      );
    }
  }, [tipoRecursoSelected?.id_tipo_recurso, executeLoadRecursos, setRecursosDB]);

  // Retornar estados de loading para uso externo
  return {
    loadingTipos,
    loadingRecursos,
    loadingPersonal,
    loadingEquipos,
  };
};
