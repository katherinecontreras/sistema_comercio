import { create } from 'zustand';

//INTERFACES
export interface Recurso {
  id_recurso: number;
  id_tipo_recurso: number
  descripcion: string;
  unidad: number;
  cantidad: number;
  meses_operario?: string;
}

export interface TipoRecurso {
  id_tipo_recurso: number;
  descripcion: string;
}

// STORE DE RECURSO BASE
interface RecursoBaseState {
  recurso: Recurso | null;
  recursos: Recurso[];
  tipoRecurso: TipoRecurso | null;
  tiposRecurso: TipoRecurso[];
  loading: boolean;
  error: string | null;
}

interface RecursoBaseActions {
    // Recurso CRUD
    getRecurso: () => Recurso | null;
    getRecursos: () => Recurso[] | null;
    getTipoRecurso: () => TipoRecurso | null;
    getTiposRecurso: () => TipoRecurso[] | null;
    
    setRecurso: (recurso: Recurso | null) => void;
    setRecursos: (rows: Recurso[]) => void;
    setTipoRecurso: (recurso: TipoRecurso | null) => void;
    setTiposRecurso: (rows: TipoRecurso[]) => void;

    clearRecurso: () => void;
    clearRecursos: () => void;
    clearTipoRecurso: () => void;
    clearTiposRecurso: () => void;

    // Estado de carga
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
    
    // Utilidades
    isRecursoComplete: () => boolean;
    isTipoRecursoComplete: () => boolean;
}

export const useRecursoBaseStore = create<RecursoBaseState & RecursoBaseActions>((set, get) => ({
  // ESTADO INICIAL
  recurso: null,
  recursos: [],
  tipoRecurso: null,
  tiposRecurso: [],
  loading: false,
  error: null,

  // ACCIONES DE RECURSOS
  getRecurso: () => get().recurso,
  getTipoRecurso: () => get().tipoRecurso,
  getRecursos: () => get().recursos,
  getTiposRecurso: () => get().tiposRecurso,

  setRecurso: (recurso) => set({ recurso, error: null }),
  setTipoRecurso: (tipoRecurso) => set({ tipoRecurso, error: null }),
  setRecursos: (rows) => set({ recursos: rows, error: null }),
  setTiposRecurso: (rows) => set({ tiposRecurso: rows, error: null }),
  
  clearRecursos: () => set({recursos: []}),
  clearTiposRecurso: () => set({tiposRecurso: []}),
  clearTipoRecurso: () => set({ tipoRecurso: null, loading: false, error: null }),
  clearRecurso: () => set({ 
    recurso: null, 
    loading: false, 
    error: null 
  }),


  // ESTADO DE CARGA
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  clearError: () => set({ error: null }),

  // UTILIDADES
  isRecursoComplete: () => {
    const recurso = get().recurso;
    return !!(recurso?.meses_operario);
  },
  isTipoRecursoComplete: () => {
    let isFull = true
    const recursos = get().recursos;
    const tipoRecurso = get().tipoRecurso
    const recursosFromTipo = recursos.filter((recurso)=> recurso.id_tipo_recurso == tipoRecurso?.id_tipo_recurso)
    recursosFromTipo.forEach(recurso => {
      if (!recurso.meses_operario) isFull = false
    });
    return isFull;
  }
}));

export default useRecursoBaseStore;


