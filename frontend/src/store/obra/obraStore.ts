import { create } from 'zustand';

//INTERFACES
export interface Obra {
  id_obra?: number;
  id_cliente: number;
  codigo_proyecto?: string;
  nombre_proyecto: string;
  descripcion_proyecto?: string;
  fecha_creacion: string;
  fecha_entrega?: string;
  fecha_recepcion?: string;
  moneda: string;
  estado: string;
}

// STORE DE OBRA BASE
interface ObraBaseState {
  obra: Obra | null;
  loading: boolean;
  error: string | null;
}

interface ObraBaseActions {
  // Obra CRUD
  setObra: (obra: Obra | null) => void;
  getObra: () => Obra | null;
  clearObra: () => void;
  
  // Estado de carga
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Utilidades
  isObraValid: () => boolean;
  getObraStatus: () => 'nueva' | 'borrador' | 'finalizada' | null;
}

export const useObraBaseStore = create<ObraBaseState & ObraBaseActions>((set, get) => ({
  // ESTADO INICIAL
  obra: null,
  loading: false,
  error: null,

  // ACCIONES DE OBRA
  setObra: (obra) => set({ obra, error: null }),
  getObra: () => get().obra,
  clearObra: () => set({ 
    obra: null, 
    loading: false, 
    error: null 
  }),

  // ESTADO DE CARGA
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  clearError: () => set({ error: null }),

  // UTILIDADES
  isObraValid: () => {
    const obra = get().obra;
    return !!(obra?.nombre_proyecto && obra?.id_cliente);
  },
  getObraStatus: () => {
    const obra = get().obra;
    if (!obra) return null;
    
    switch (obra.estado) {
      case 'nueva':
      case 'borrador':
      case 'finalizada':
        return obra.estado as 'nueva' | 'borrador' | 'finalizada';
      default:
        return 'borrador';
    }
  }
}));

export default useObraBaseStore;


