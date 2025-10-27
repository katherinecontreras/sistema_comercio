import { useState, useCallback } from 'react';
import { 
  getTiposRecursos, 
  getRecursosByTipo, 
  getUnidades, 
  getEspecialidades,
  getTiposTiempo,
  addUnidad as addUnidadAPI,
  addEspecialidad as addEspecialidadAPI,
  createTipoTiempo,
  createRecurso as createRecursoAPI
} from '@/actions/catalogos';

export const useCatalogos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para datos cacheados
  const [tiposRecursos, setTiposRecursos] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [especialidades, setEspecialidades] = useState<any[]>([]);
  const [tiposTiempo, setTiposTiempo] = useState<any[]>([]);
  const [recursosByTipo, setRecursosByTipo] = useState<{[key: number]: any[]}>({});

  // Cargar tipos de recursos
  const loadTiposRecursos = useCallback(async (force = false) => {
    if (tiposRecursos.length > 0 && !force) return tiposRecursos;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getTiposRecursos();
      setTiposRecursos(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error cargando tipos de recursos');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tiposRecursos.length]);

  // Cargar recursos por tipo
  const loadRecursosByTipo = useCallback(async (idTipoRecurso: number, force = false) => {
    if (recursosByTipo[idTipoRecurso] && !force) return recursosByTipo[idTipoRecurso];
    
    try {
      setLoading(true);
      setError(null);
      const data = await getRecursosByTipo(idTipoRecurso);
      setRecursosByTipo(prev => ({ ...prev, [idTipoRecurso]: data }));
      return data;
    } catch (err: any) {
      setError(err.message || 'Error cargando recursos');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [recursosByTipo]);

  // Cargar unidades
  const loadUnidades = useCallback(async (force = false) => {
    if (unidades.length > 0 && !force) return unidades;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getUnidades();
      setUnidades(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error cargando unidades');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [unidades.length]);

  // Cargar especialidades
  const loadEspecialidades = useCallback(async (force = false) => {
    if (especialidades.length > 0 && !force) return especialidades;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getEspecialidades();
      setEspecialidades(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error cargando especialidades');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [especialidades.length]);

  // Cargar tipos de tiempo
  const loadTiposTiempo = useCallback(async (force = false) => {
    if (tiposTiempo.length > 0 && !force) return tiposTiempo;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getTiposTiempo();
      setTiposTiempo(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error cargando tipos de tiempo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tiposTiempo.length]);

  // Agregar unidad
  const handleAddUnidad = useCallback(async (formData: { nombre: string; simbolo: string; descripcion?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await addUnidadAPI(formData);
      setUnidades(prev => [...prev, data]);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error agregando unidad');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Agregar especialidad
  const handleAddEspecialidad = useCallback(async (formData: { nombre: string; descripcion?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await addEspecialidadAPI(formData);
      setEspecialidades(prev => [...prev, data]);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error agregando especialidad');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Agregar tipo de tiempo
  const handleAddTipoTiempo = useCallback(async (formData: { nombre: string; medida: string }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await createTipoTiempo(formData);
      setTiposTiempo(prev => [...prev, data]);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error agregando tipo de tiempo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Agregar recurso
  const handleAddRecurso = useCallback(async (recursoData: any) => {
    try {
      setLoading(true);
      setError(null);
      const data = await createRecursoAPI(recursoData);
      
      // Actualizar cache si existe
      if (recursoData.id_tipo_recurso) {
        setRecursosByTipo(prev => ({
          ...prev,
          [recursoData.id_tipo_recurso]: [...(prev[recursoData.id_tipo_recurso] || []), data]
        }));
      }
      
      return data;
    } catch (err: any) {
      setError(err.message || 'Error agregando recurso');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar todos los catálogos
  const loadAllCatalogos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        loadTiposRecursos(true),
        loadUnidades(true),
        loadEspecialidades(true),
        loadTiposTiempo(true)
      ]);
    } catch (err: any) {
      setError(err.message || 'Error cargando catálogos');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTiposRecursos, loadUnidades, loadEspecialidades, loadTiposTiempo]);

  // Limpiar cache
  const clearCache = useCallback(() => {
    setTiposRecursos([]);
    setUnidades([]);
    setEspecialidades([]);
    setTiposTiempo([]);
    setRecursosByTipo({});
  }, []);

  return {
    // Estados
    loading,
    error,
    tiposRecursos,
    unidades,
    especialidades,
    tiposTiempo,
    recursosByTipo,
    
    // Funciones de carga
    loadTiposRecursos,
    loadRecursosByTipo,
    loadUnidades,
    loadEspecialidades,
    loadTiposTiempo,
    loadAllCatalogos,
    
    // Funciones de creación
    handleAddUnidad,
    handleAddEspecialidad,
    handleAddTipoTiempo,
    handleAddRecurso,
    
    // Utilidades
    clearCache
  };
};
