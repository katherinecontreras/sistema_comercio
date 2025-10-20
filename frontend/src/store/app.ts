import { create } from 'zustand';

type WizardStep = 'cliente' | 'cotizacion' | 'datos' | 'obras' | 'items' | 'costos' | 'incrementos' | 'verificacion';

interface UserState {
  accessToken: string | null;
  dni: string | null;
}

interface ClientState {
  selectedClientId: number | null;
}

interface QuoteState {
  activeQuoteId: number | null;
}

interface Obra {
  id: string;
  nombre: string;
  descripcion: string;
  ubicacion?: string;
}

interface ItemObra {
  id: string;
  id_obra: string;
  id_item_padre: string | null;
  codigo: string;
  descripcion_tarea: string;
  especialidad: string;
  unidad: string;
  id_especialidad?: number;
  id_unidad?: number;
  cantidad: number;
  precio_unitario?: number;
  nivel: number;
  expanded: boolean;
}

interface ItemCosto {
  id: string;
  id_item_obra: string;
  id_recurso: number;
  cantidad: number;
  precio_unitario_aplicado: number;
  total_linea: number;
  recurso: {
    id_recurso: number;
    descripcion: string;
    unidad: string;
    costo_unitario_predeterminado: number;
  };
}

interface Incremento {
  id: string;
  id_item_obra: string;
  concepto: string;
  descripcion: string;
  tipo_incremento: 'porcentaje' | 'monto_fijo';
  valor: number;
  porcentaje: number;
  monto_calculado: number;
}

interface QuoteFormData {
  nombre_proyecto: string;
  descripcion_proyecto?: string;
  fecha_creacion: string;
  fecha_inicio?: string;
  fecha_vencimiento?: string;
  moneda?: string;
}

interface WizardState {
  step: WizardStep;
  quoteFormData: QuoteFormData;
  obras: Obra[];
  items: ItemObra[];
  costos: ItemCosto[];
  incrementos: Incremento[];
}

interface AppState {
  user: UserState;
  client: ClientState;
  quote: QuoteState;
  wizard: WizardState;
  // actions
  setToken: (token: string | null) => void;
  setDni: (dni: string | null) => void;
  selectClient: (id: number | null) => void;
  setActiveQuote: (id: number | null) => void;
  setStep: (step: WizardStep) => void;
  setQuoteFormData: (data: QuoteFormData) => void;
  setObras: (obras: Obra[]) => void;
  setItems: (items: ItemObra[]) => void;
  setCostos: (costos: ItemCosto[]) => void;
  setIncrementos: (incrementos: Incremento[]) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: {
    accessToken: typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null,
    dni: null,
  },
  client: { selectedClientId: null },
  quote: { activeQuoteId: null },
  wizard: { 
    step: 'cliente', 
    quoteFormData: { 
      nombre_proyecto: '', 
      descripcion_proyecto: '',
      fecha_creacion: new Date().toISOString().split('T')[0],
      fecha_inicio: '',
      fecha_vencimiento: '',
      moneda: 'USD'
    },
    obras: [], 
    items: [], 
    costos: [], 
    incrementos: [] 
  },
  setToken: (token) => {
    if (typeof localStorage !== 'undefined') {
      if (token) localStorage.setItem('access_token', token);
      else localStorage.removeItem('access_token');
    }
    set((s) => ({ ...s, user: { ...s.user, accessToken: token } }));
  },
  setDni: (dni) => set((s) => ({ ...s, user: { ...s.user, dni } })),
  selectClient: (id) => set((s) => ({ ...s, client: { selectedClientId: id } })),
  setActiveQuote: (id) => set((s) => ({ ...s, quote: { activeQuoteId: id } })),
  setStep: (step) => set((s) => ({ ...s, wizard: { ...s.wizard, step } })),
  setQuoteFormData: (data) => set((s) => ({ ...s, wizard: { ...s.wizard, quoteFormData: data } })),
  setObras: (obras) => set((s) => ({ ...s, wizard: { ...s.wizard, obras } })),
  setItems: (items) => set((s) => ({ ...s, wizard: { ...s.wizard, items } })),
  setCostos: (costos) => set((s) => ({ ...s, wizard: { ...s.wizard, costos } })),
  setIncrementos: (incrementos) => set((s) => ({ ...s, wizard: { ...s.wizard, incrementos } })),
  logout: () =>
    set(() => {
      if (typeof localStorage !== 'undefined') localStorage.removeItem('access_token');
      return {
        user: { accessToken: null, dni: null },
        client: { selectedClientId: null },
        quote: { activeQuoteId: null },
        wizard: { 
          step: 'cliente', 
          quoteFormData: { 
            nombre_proyecto: '', 
            descripcion_proyecto: '',
            fecha_creacion: new Date().toISOString().split('T')[0],
            fecha_inicio: '',
            fecha_vencimiento: '',
            moneda: 'USD'
          },
          obras: [], 
          items: [], 
          costos: [], 
          incrementos: [] 
        },
      };
    }),
}));


