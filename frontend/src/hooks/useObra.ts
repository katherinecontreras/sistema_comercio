import { useState, useCallback, useEffect } from 'react';
import { useObraStore } from '@/store/obra';
import { 
  createObra, 
  getObra, 
  updateObra, 
  finalizarObra,
  createPartida,
  getPartidas,
  updatePartida,
  deletePartida,
  createSubPartida,
  getIncremento,
  createIncremento,
  updateIncremento,
  deleteIncremento
} from '@/actions/obras';

export const useObra = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    obra,
    partidas,
    incrementos,
    resumen,
    selectedPartida,
    selectedSubPartida,
    selectedPlanilla,
    setObra,
    setPartidas,
    addPartidaWithEffects,
    updatePartida: updatePartidaStore,
    addSubPartida: addSubPartidaStore,
    updateSubPartida: updateSubPartidaStore,
    addIncremento: addIncrementoStore,
    getIncremento: getIncremento,
    updateIncremento: updateIncrementoStore,
    removeIncremento: removeIncrementoStore,
    calcularResumenObra,
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage
  } = useObraStore();

  // Cargar obra desde API
  const loadObra = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getObra(id);
      setObra(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error cargando obra');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setObra]);

  // Crear obra
  const handleCreateObra = useCallback(async (obraData: any) => {
    try {
      setLoading(true);
      setError(null);
      const data = await createObra(obraData);
      setObra(data);
      saveToLocalStorage();
      return data;
    } catch (err: any) {
      setError(err.message || 'Error creando obra');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setObra, saveToLocalStorage]);

  // Actualizar obra
  const handleUpdateObra = useCallback(async (id: number, obraData: any) => {
    try {
      setLoading(true);
      setError(null);
      const data = await updateObra(id, obraData);
      setObra(data);
      saveToLocalStorage();
      return data;
    } catch (err: any) {
      setError(err.message || 'Error actualizando obra');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setObra, saveToLocalStorage]);

  // Finalizar obra con datos completos del localStorage
  const handleFinalizarObra = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparar datos completos para enviar al backend
      const obraCompleta = {
        ...obra,
        partidas: partidas.map(partida => ({
          ...partida,
          subpartidas: partida.subpartidas || [],
          costos: partida.costos || [],
          incrementos: incrementos.filter(inc => inc.id_partida === partida.id_partida)
        })),
        incrementos: incrementos.filter(inc => inc.id_obra === id),
        resumen: resumen
      };
      
      const data = await finalizarObra(id, obraCompleta);
      setObra(data);
      
      // Limpiar localStorage después de finalizar
      clearLocalStorage();
      
      return data;
    } catch (err: any) {
      setError(err.message || 'Error finalizando obra');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [obra, partidas, incrementos, resumen, setObra, clearLocalStorage]);

  // Cargar partidas desde API
  const loadPartidas = useCallback(async (idObra: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPartidas(idObra);
      setPartidas(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error cargando partidas');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setPartidas]);

  // Crear partida (local + API)
  const handleCreatePartida = useCallback(async (partidaData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // Agregar localmente primero
      const localPartida = {
        id_partida: Date.now(),
        ...partidaData,
        tiene_subpartidas: false
      };
      addPartidaWithEffects(localPartida);
      
      // Crear en API si hay obra
      if (obra?.id_obra) {
        const apiData = await createPartida({
          ...partidaData,
          id_obra: obra.id_obra
        });
        // Actualizar con ID real de la API
        updatePartidaStore(localPartida.id_partida, { id_partida: apiData.id_partida });
      }
      
      return localPartida;
    } catch (err: any) {
      setError(err.message || 'Error creando partida');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [obra, addPartidaWithEffects, updatePartidaStore]);

  // Actualizar partida
  const handleUpdatePartida = useCallback(async (id: number, partidaData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // Actualizar localmente
      updatePartidaStore(id, partidaData);
      
      // Actualizar en API si existe
      if (id > 1000000000) { // ID local (timestamp)
        // Solo actualizar localmente para IDs locales
      } else {
        await updatePartida(id, partidaData);
      }
      
      saveToLocalStorage();
      return true;
    } catch (err: any) {
      setError(err.message || 'Error actualizando partida');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updatePartidaStore, saveToLocalStorage]);

  // Eliminar partida
  const handleDeletePartida = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Eliminar de API si existe
      if (id <= 1000000000) { // ID real de API
        await deletePartida(id);
      }
      
      // Eliminar localmente
      const newPartidas = partidas.filter(p => p.id_partida !== id);
      setPartidas(newPartidas);
      saveToLocalStorage();
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Error eliminando partida');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [partidas, setPartidas, saveToLocalStorage]);

  // Crear subpartida
  const handleCreateSubPartida = useCallback(async (idPartida: number, subpartidaData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const localSubPartida = {
        id_subpartida: Date.now(),
        ...subpartidaData,
        id_partida: idPartida
      };
      
      addSubPartidaStore(idPartida, localSubPartida);
      
      // Crear en API si la partida existe en API
      const partida = partidas.find(p => p.id_partida === idPartida);
      if (partida && partida.id_partida && partida.id_partida <= 1000000000) {
        const apiData = await createSubPartida({
          ...subpartidaData,
          id_partida: partida.id_partida
        });
        updateSubPartidaStore(localSubPartida.id_subpartida, { id_subpartida: apiData.id_subpartida });
      }
      
      saveToLocalStorage();
      return localSubPartida;
    } catch (err: any) {
      setError(err.message || 'Error creando subpartida');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [partidas, addSubPartidaStore, updateSubPartidaStore, saveToLocalStorage]);

  // Cargar incrementos desde API
  const loadIncrementos = useCallback(async (idObra: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getIncrementos(idObra);
      // Actualizar store con incrementos cargados
      data.forEach(incremento => {
        addIncrementoStore(incremento);
      });
      return data;
    } catch (err: any) {
      setError(err.message || 'Error cargando incrementos');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addIncrementoStore]);

  // Crear incremento
  const handleCreateIncremento = useCallback(async (incrementoData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const localIncremento = {
        id_incremento: Date.now(),
        ...incrementoData
      };
      
      addIncrementoStore(localIncremento);
      
      // Crear en API si hay obra
      if (obra?.id_obra) {
        const apiData = await createIncremento({
          ...incrementoData,
          id_obra: obra.id_obra
        });
        updateIncrementoStore(localIncremento.id_incremento, { id_incremento: apiData.id_incremento });
      }
      
      saveToLocalStorage();
      return localIncremento;
    } catch (err: any) {
      setError(err.message || 'Error creando incremento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [obra, addIncrementoStore, updateIncrementoStore, saveToLocalStorage]);

  // Actualizar incremento
  const handleUpdateIncremento = useCallback(async (id: number, incrementoData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      updateIncrementoStore(id, incrementoData);
      
      if (id <= 1000000000) {
        await updateIncremento(id, incrementoData);
      }
      
      saveToLocalStorage();
      return true;
    } catch (err: any) {
      setError(err.message || 'Error actualizando incremento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateIncrementoStore, saveToLocalStorage]);

  // Eliminar incremento
  const handleDeleteIncremento = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      if (id <= 1000000000) {
        await deleteIncremento(id);
      }
      
      removeIncrementoStore(id);
      saveToLocalStorage();
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Error eliminando incremento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [removeIncrementoStore, saveToLocalStorage]);

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Recalcular resumen cuando cambien los datos
  useEffect(() => {
    if (obra) {
      calcularResumenObra();
    }
  }, [obra, partidas, incrementos, calcularResumenObra]);

  return {
    // Estado
    obra,
    partidas,
    incrementos,
    resumen,
    selectedPartida,
    selectedSubPartida,
    selectedPlanilla,
    loading,
    error,
    
    // Acciones de obra
    loadObra,
    handleCreateObra,
    handleUpdateObra,
    handleFinalizarObra,
    
    // Acciones de partidas
    loadPartidas,
    handleCreatePartida,
    handleUpdatePartida,
    handleDeletePartida,
    
    // Acciones de subpartidas
    handleCreateSubPartida,
    
    // Acciones de incrementos
    loadIncrementos,
    handleCreateIncremento,
    handleUpdateIncremento,
    handleDeleteIncremento,
    
    // Utilidades
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
    calcularResumenObra
  };
};
