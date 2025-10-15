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
}

interface ItemObra {
  id: string;
  id_obra: string;
  id_item_padre: string | null;
  codigo: string;
  descripcion_tarea: string;
  especialidad: string;
  unidad: string;
  cantidad: number;
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
  descripcion: string;
  porcentaje: number;
}

interface WizardState {
  step: WizardStep;
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
  wizard: { step: 'cliente', obras: [], items: [], costos: [], incrementos: [] },
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
        wizard: { step: 'cliente', obras: [], items: [], costos: [], incrementos: [] },
      };
    }),
}));


