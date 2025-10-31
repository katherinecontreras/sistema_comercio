import { create } from 'zustand';

export interface Equipo {
    id_equipo: number
    detalle: string
    Amortizacion: number
    Seguro: number
    Patente: number
    Transporte: number
    Fee_alquiler: number
    Combustible: number
    Lubricantes: number
    Neumaticos: number
    Mantenim: number
    Operador: number
    Total_mes: number
}

interface EquipoBaseState {
  equipo: Equipo | null;
  equipos: Equipo[];
  loading: boolean;
  error: string | null;
}

interface EquipoBaseActions {
  // Equipo CRUD
  setEquipo: (equipo: Equipo | null) => void;
  getEquipo: () => Equipo | null;
  clearEquipo: () => void;
  setEquipos: (rows: Equipo[]) => void;
  clearEquipos: () => void;
  
  // Estado de carga
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}


export const useEquipoBaseStore = create<EquipoBaseState & EquipoBaseActions>((set, get) => ({
  // ESTADO INICIAL
  equipo: null,
  equipos: [],
  loading: false,
  error: null,

  // ACCIONES DE OBRA
  setEquipo: (equipo) => set({ equipo, error: null }),
  getEquipo: () => get().equipo,
  clearEquipo: () => set({ 
    equipo: null, 
    loading: false, 
    error: null 
  }),

  setEquipos: (rows) => set({ equipos: rows, error: null }),
  clearEquipos: () => set({ equipos: [] }),

  // ESTADO DE CARGA
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  clearError: () => set({ error: null }),

}));

export default useEquipoBaseStore;