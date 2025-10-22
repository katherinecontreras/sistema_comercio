import { create } from 'zustand';

interface Obra {
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
  // Campos de resumen calculados
  total_partidas?: number;
  total_subpartidas?: number;
  total_costo_obra_sin_incremento?: number;
  total_costo_obra_con_incrementos?: number;
  total_duracion_obra?: number;
  total_incrementos?: number;
  costos_partidas?: any;
}

interface Partida {
  id_partida?: number;
  id_obra?: number;
  nombre_partida: string;
  descripcion?: string;
  codigo?: string;
  tiene_subpartidas: boolean;
  duracion: number;
  id_tipo_tiempo?: number;
  especialidad?: any[];
  subpartidas?: SubPartida[];
  completa?: boolean;
}

interface SubPartida {
  id_subpartida?: number;
  id_partida?: number;
  codigo?: string;
  descripcion_tarea: string;
  id_especialidad?: number;
  costos?: SubPartidaCosto[];
  incrementos?: Incremento[];
  completa?: boolean;
}

interface SubPartidaCosto {
  id_costo?: number;
  id_subpartida?: number;
  id_recurso: number;
  cantidad: number;
  precio_unitario_aplicado: number;
  total_linea: number;
  porcentaje_de_uso: number;
  tiempo_de_uso: number;
  recurso?: {
    id_recurso: number;
    descripcion: string;
    unidad: string;
    costo_unitario_predeterminado: number;
  };
}

interface Incremento {
  id_incremento: number;
  id_partida?: number;
  id_subpartida?: number;
  concepto: string;
  descripcion?: string;
  tipo_incremento: string;
  valor: number;
  porcentaje: number;
  monto_calculado: number;
}

interface ObraState {
  obra: Obra | null;
  partidas: Partida[];
  selectedPartida: number | null;
  selectedSubPartida: number | null;
  selectedPlanilla: number | null;
  showResumen: boolean;
}

interface ObraActions {
  setObra: (obra: Obra | null) => void;
  setPartidas: (partidas: Partida[]) => void;
  addPartida: (partida: Partida) => void;
  updatePartida: (id: number, partida: Partial<Partida>) => void;
  addSubPartida: (idPartida: number, subpartida: SubPartida) => void;
  updateSubPartida: (id: number, subpartida: Partial<SubPartida>) => void;
  setSelectedPartida: (id: number | null) => void;
  setSelectedSubPartida: (id: number | null) => void;
  setSelectedPlanilla: (id: number | null) => void;
  setShowResumen: (show: boolean) => void;
  clearObra: () => void;
  // Funciones para guardado local
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  clearLocalStorage: () => void;
}

export const useObraStore = create<ObraState & ObraActions>((set) => ({
  // State
  obra: null,
  partidas: [],
  selectedPartida: null,
  selectedSubPartida: null,
  selectedPlanilla: null,
  showResumen: false,

  // Actions
  setObra: (obra) => set({ obra }),
  
  setPartidas: (partidas) => set({ partidas }),
  
  addPartida: (partida) => set((state) => ({
    partidas: [...state.partidas, partida]
  })),
  
  updatePartida: (id, updates) => set((state) => ({
    partidas: state.partidas.map(p => 
      p.id_partida === id ? { ...p, ...updates } : p
    )
  })),
  
  addSubPartida: (idPartida, subpartida) => set((state) => ({
    partidas: state.partidas.map(p => 
      p.id_partida === idPartida 
        ? { 
            ...p, 
            tiene_subpartidas: true,
            subpartidas: [...(p.subpartidas || []), subpartida]
          }
        : p
    )
  })),
  
  updateSubPartida: (id, updates) => set((state) => ({
    partidas: state.partidas.map(p => ({
      ...p,
      subpartidas: p.subpartidas?.map(s => 
        s.id_subpartida === id ? { ...s, ...updates } : s
      )
    }))
  })),
  
  setSelectedPartida: (id) => set({ 
    selectedPartida: id, 
    selectedSubPartida: null,
    selectedPlanilla: null 
  }),
  
  setSelectedSubPartida: (id) => set({ 
    selectedSubPartida: id, 
    selectedPartida: null,
    selectedPlanilla: null 
  }),
  
  setSelectedPlanilla: (id) => set({ selectedPlanilla: id }),
  
  setShowResumen: (show) => set({ showResumen: show }),
  
  clearObra: () => set({
    obra: null,
    partidas: [],
    selectedPartida: null,
    selectedSubPartida: null,
    selectedPlanilla: null,
    showResumen: false
  }),
  
  // Funciones para guardado local
  saveToLocalStorage: () => {
    const state = useObraStore.getState();
    const dataToSave = {
      obra: state.obra,
      partidas: state.partidas,
      selectedPartida: state.selectedPartida,
      selectedSubPartida: state.selectedSubPartida,
      selectedPlanilla: state.selectedPlanilla,
      showResumen: state.showResumen,
    };
    localStorage.setItem('obra_draft', JSON.stringify(dataToSave));
  },
  
  loadFromLocalStorage: () => {
    const saved = localStorage.getItem('obra_draft');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        set({
          obra: data.obra,
          partidas: data.partidas || [],
          selectedPartida: data.selectedPartida,
          selectedSubPartida: data.selectedSubPartida,
          selectedPlanilla: data.selectedPlanilla,
          showResumen: data.showResumen || false,
        });
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    }
  },
  
  clearLocalStorage: () => {
    localStorage.removeItem('obra_draft');
    set({
      obra: null,
      partidas: [],
      selectedPartida: null,
      selectedSubPartida: null,
      selectedPlanilla: null,
      showResumen: false,
    });
  },
}));