import { create } from 'zustand';

//INTERFACES
export interface ItemObra {
    id_item_Obra: number;
    descripcion: string;
    meses_operario?: number;
    capataz?: number;
}

// STORE DE OBRA BASE
interface ItemObraBaseState {
    itemObra: ItemObra | null;
    itemsObra: ItemObra[];
    loading: boolean;
    error: string | null;
}

interface ItemObraBaseActions {
  // ItemObra CRUD
  getItemObra: () => ItemObra | null;
  getItemsObra: () => ItemObra[] | null;

  setItemObra: (itemObra: ItemObra | null) => void;
  setItemsObra: (rows: ItemObra[]) => void;
  
  clearItemObra: () => void;
  clearItemsObra: () => void;
  
  // Estado de carga
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Utilidades
  isItemObraComplete: () => boolean;
  areAllItemsObraComplete: () => boolean;
}

export const useItemObraBaseStore = create<ItemObraBaseState & ItemObraBaseActions>((set, get) => ({
  // ESTADO INICIAL
  itemObra: null,
  itemsObra: [],
  loading: false,
  error: null,

  // ACCIONES DE ITEMOBRA
  getItemObra: () => get().itemObra,
  getItemsObra: () => get().itemsObra,

  setItemObra: (itemObra) => set({ itemObra, error: null }),
  setItemsObra: (rows) => set({ itemsObra: rows, error: null }),
  
  clearItemsObra: () => set({itemsObra: []}),
  clearItemObra: () => set({ 
    itemObra: null, 
    loading: false, 
    error: null 
  }),

  // ESTADO DE CARGA
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  clearError: () => set({ error: null }),

  // UTILIDADES
  isItemObraComplete: () => {
    const itemObra = get().itemObra;
    return !!(itemObra?.meses_operario);
  },
  areAllItemsObraComplete: () => {
    const itemsObra = get().itemsObra;
    let isFull = true
    itemsObra.forEach(item => {
        if (!item?.meses_operario) isFull = false 
    });
    return isFull;
  }
}));

export default useItemObraBaseStore;


