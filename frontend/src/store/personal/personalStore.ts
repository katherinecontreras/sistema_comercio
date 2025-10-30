import { create } from 'zustand';

export interface Personal {
  id_personal: number;
  funcion: string;
  sueldo_bruto: number;
  descuentos: number;
  porc_descuento: number;
  sueldo_no_remunerado: number;
  neto_mensual_con_vianda_xdia: number;
  cargas_sociales: number;
  porc_cargas_sociales_sobre_sueldo_bruto: number;
  costo_total_mensual: number;
  costo_mensual_sin_seguros: number;
  seguros_art_mas_vo: number;
  examen_medico_y_capacitacion: number;
  indumentaria_y_epp: number;
  pernoctes_y_viajes: number;
  costo_total_mensual_apertura: number;
}

interface PersonalBaseState {
  personal: Personal | null;
  personales: Personal[];
  loading: boolean;
  error: string | null;
}

interface PersonalBaseActions {
  // Personal CRUD
  setPersonal: (personal: Personal | null) => void;
  getPersonal: () => Personal | null;
  clearPersonal: () => void;
  setPersonales: (rows: Personal[]) => void;
  clearPersonales: () => void;
  
  // Estado de carga
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}


export const usePersonalBaseStore = create<PersonalBaseState & PersonalBaseActions>((set, get) => ({
  // ESTADO INICIAL
  personal: null,
  personales: [],
  loading: false,
  error: null,

  // ACCIONES DE OBRA
  setPersonal: (personal) => set({ personal, error: null }),
  getPersonal: () => get().personal,
  clearPersonal: () => set({ 
    personal: null, 
    loading: false, 
    error: null 
  }),

  setPersonales: (rows) => set({ personales: rows, error: null }),
  clearPersonales: () => set({ personales: [] }),

  // ESTADO DE CARGA
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  clearError: () => set({ error: null }),

}));

export default usePersonalBaseStore;