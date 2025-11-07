import { create } from 'zustand';

export const TIPOS_COSTO_STORAGE_KEY = 'oferta_tipos_costo';
export const COSTOS_STORAGE_KEY = 'oferta_costos';
export const ITEMS_COSTOS_STORAGE_KEY = 'oferta_items_costos';
export const COSTOS_READY_STORAGE_KEY = 'oferta_costos_ready';

export interface TipoCostoItem {
  id: number;
  tipo?: string;
  desc: string;
  costo_total: number;
}

export interface TipoCosto {
  id_tipo_costo: number;
  tipo: string;
  costo_total: number;
  items: TipoCostoItem[];
}

export interface CostoValue {
  name: string;
  value: number;
}

export interface CostoItemObra {
  idItem: number;
  cantidad: number;
  total: number;
  porcentaje: number;
}

export interface Costo {
  id_costo: number;
  id_tipo_costo: number;
  detalle: string;
  values: CostoValue[];
  afectacion: Record<string, number | string | null> | null;
  unidad: string;
  costo_unitario: number;
  cantidad: number;
  costo_total: number;
  itemsObra: CostoItemObra[];
}

interface CostoState {
  tiposCosto: TipoCosto[];
  costos: Costo[];
  loading: boolean;
  error: string | null;
  ready: boolean;
}

interface CostoActions {
  loadFromStorage: () => void;
  setCostData: (tipos: TipoCosto[], costos: Costo[]) => void;
  clearCostData: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markReady: (ready: boolean) => void;
  updateCosto: (id_costo: number, updater: (costo: Costo) => Costo) => void;
}

const readJSON = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`No se pudo leer el almacenamiento local para ${key}`, error);
    return fallback;
  }
};

const writeJSON = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const removeKey = (key: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
};

const recomputeTiposCosto = (costos: Costo[], tipos: TipoCosto[]): TipoCosto[] => {
  const totalsByTipo = costos.reduce<Record<number, number>>((acc, costo) => {
    acc[costo.id_tipo_costo] = (acc[costo.id_tipo_costo] || 0) + (costo.costo_total || 0);
    return acc;
  }, {});

  return tipos.map((tipo) => ({
    ...tipo,
    costo_total: Number((totalsByTipo[tipo.id_tipo_costo] || 0).toFixed(2)),
  }));
};

export const useCostoStore = create<CostoState & CostoActions>((set, _get) => ({
  tiposCosto: [],
  costos: [],
  loading: false,
  error: null,
  ready: typeof window !== 'undefined' ? window.localStorage.getItem(COSTOS_READY_STORAGE_KEY) === 'true' : false,

  loadFromStorage: () => {
    const tipos = readJSON<TipoCosto[]>(TIPOS_COSTO_STORAGE_KEY, []);
    const costos = readJSON<Costo[]>(COSTOS_STORAGE_KEY, []);
    const ready = typeof window !== 'undefined' ? window.localStorage.getItem(COSTOS_READY_STORAGE_KEY) === 'true' : false;
    set({ tiposCosto: tipos, costos, ready });
  },

  setCostData: (tipos, costos) => {
    const recalculatedTipos = recomputeTiposCosto(costos, tipos);
    writeJSON(COSTOS_STORAGE_KEY, costos);
    writeJSON(TIPOS_COSTO_STORAGE_KEY, recalculatedTipos);
    set({ tiposCosto: recalculatedTipos, costos });
  },

  clearCostData: () => {
    removeKey(TIPOS_COSTO_STORAGE_KEY);
    removeKey(COSTOS_STORAGE_KEY);
    removeKey(ITEMS_COSTOS_STORAGE_KEY);
    removeKey(COSTOS_READY_STORAGE_KEY);
    set({ tiposCosto: [], costos: [], ready: false });
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  markReady: (ready) => {
    if (typeof window !== 'undefined') {
      if (ready) {
        window.localStorage.setItem(COSTOS_READY_STORAGE_KEY, 'true');
      } else {
        window.localStorage.removeItem(COSTOS_READY_STORAGE_KEY);
      }
    }
    set({ ready });
  },

  updateCosto: (id_costo, updater) => {
    set((state) => {
      const costos = state.costos.map((costo) =>
        costo.id_costo === id_costo ? updater(costo) : costo
      );

      const tiposCosto = recomputeTiposCosto(costos, state.tiposCosto);

      writeJSON(COSTOS_STORAGE_KEY, costos);
      writeJSON(TIPOS_COSTO_STORAGE_KEY, tiposCosto);

      return {
        costos,
        tiposCosto,
      };
    });
  },
}));

export default useCostoStore;

