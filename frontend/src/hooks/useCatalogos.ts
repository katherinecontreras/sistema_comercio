import { useState, useCallback } from 'react';
import { 
  getTypesOfRecursos, 
  getRecursosFrom, 
  getUnidades, 
  getEspecialidades,
  addUnidad as addUnidadAPI,
  addRecursos as addRecursosAPI
} from '@/actions';

export const useCatalogos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tipos de Recursos
  const loadTypesOfRecursos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTypesOfRecursos();
      return data;
    } catch (err: any) {
      setError(err.message || 'Error cargando tipos de recursos');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Recursos de una planilla
  const loadRecursosFrom = useCallback(async (idTipoRecurso: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecursosFrom(idTipoRecurso);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error cargando recursos');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Unidades
  const loadUnidades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUnidades();
      return data;
    } catch (err: any) {
      setError(err.message || 'Error cargando unidades');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Especialidades
  const loadEspecialidades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEspecialidades();
      return data;
    } catch (err: any) {
      setError(err.message || 'Error cargando especialidades');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Agregar unidad
  const handleAddUnidad = useCallback(async (formData: { nombre: string; abreviatura: string }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await addUnidadAPI(formData);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error agregando unidad');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Agregar recursos
  const handleAddRecursos = useCallback(async (recursoData: any) => {
    try {
      setLoading(true);
      setError(null);
      const data = await addRecursosAPI(recursoData);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error agregando recurso');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    loadTypesOfRecursos,
    loadRecursosFrom,
    loadUnidades,
    loadEspecialidades,
    handleAddUnidad,
    handleAddRecursos
  };
};


