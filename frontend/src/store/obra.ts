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
  tipo_de_tiempo?: {
    id: number;
    nombre: string;
    medida: string;
  };
  especialidad?: any[];
  subpartidas?: SubPartida[];
  planillas?: Array<{id: number, nombre: string, recursos?: any[]}>; // Planillas con recursos
  costos?: any[]; // Costos de la partida
  completa?: boolean;
}

interface SubPartida {
  id_subpartida?: number;
  id_partida?: number;
  codigo?: string;
  descripcion_tarea: string;
  id_especialidad?: number;
  duracion?: number;
  id_tipo_tiempo?: number;
  tipo_de_tiempo?: {
    id: number;
    nombre: string;
    medida: string;
  };
  costos?: SubPartidaCosto[];
  incrementos?: Incremento[];
  planillas?: Array<{id: number, nombre: string, recursos?: any[]}>; // Planillas con recursos
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
  clearSelection: () => void;
  clearObra: () => void;
  // Funciones para costos
  addCostoPartida: (costo: any) => void;
  addCostoSubPartida: (costo: any) => void;
  updateCostoPartida: (id: number, costo: any) => void;
  updateCostoSubPartida: (id: number, costo: any) => void;
  // Funciones para planillas
  addPlanillasToPartida: (idPartida: number, planillas: Array<{id: number, nombre: string}>) => void;
  addPlanillasToSubPartida: (idPartida: number, idSubPartida: number, planillas: Array<{id: number, nombre: string}>) => void;
  // Funciones para recursos de planillas
  saveRecursosToPlanilla: (idPartida: number, idSubPartida: number | null, idPlanilla: number, recursos: any[]) => void;
  getRecursosFromPlanilla: (idPartida: number, idSubPartida: number | null, idPlanilla: number) => any[];
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
  
  addPartida: (partida) => set((state) => {
    console.log('Store: Agregando partida:', partida);
    const newPartidas = [...state.partidas, partida];
    console.log('Store: Total partidas después de agregar:', newPartidas.length);
    return { partidas: newPartidas };
  }),
  
  updatePartida: (id, updates) => set((state) => ({
    partidas: state.partidas.map(p => 
      p.id_partida === id ? { ...p, ...updates } : p
    )
  })),
  
  addSubPartida: (idPartida, subpartida) => set((state) => {
    console.log('Store: Agregando subpartida:', subpartida, 'a partida:', idPartida);
    const newPartidas = state.partidas.map(p => 
      p.id_partida === idPartida 
        ? { 
            ...p, 
            tiene_subpartidas: true,
            subpartidas: [...(p.subpartidas || []), subpartida]
          }
        : p
    );
    console.log('Store: Partidas después de agregar subpartida:', newPartidas);
    return { partidas: newPartidas };
  }),
  
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
    selectedPlanilla: null 
  }),
  
  setSelectedPlanilla: (id) => set({ selectedPlanilla: id }),
  
  setShowResumen: (show) => set({ showResumen: show }),
  
  clearSelection: () => set({ 
    selectedPartida: null, 
    selectedSubPartida: null, 
    selectedPlanilla: null 
  }),
  
  clearObra: () => set({
    obra: null,
    partidas: [],
    selectedPartida: null,
    selectedSubPartida: null,
    selectedPlanilla: null,
    showResumen: false
  }),
  
  // Funciones para costos
  addCostoPartida: (costo) => {
    set((state) => ({
      partidas: state.partidas.map(p => 
        p.id_partida === costo.id_partida 
          ? { ...p, costos: [...(p.costos || []), costo] }
          : p
      )
    }));
  },
  
  addCostoSubPartida: (costo) => {
    set((state) => ({
      partidas: state.partidas.map(p => ({
        ...p,
        subpartidas: p.subpartidas?.map(sp =>
          sp.id_subpartida === costo.id_subpartida
            ? { ...sp, costos: [...(sp.costos || []), costo] }
            : sp
        ) || []
      }))
    }));
  },
  
  updateCostoPartida: (id, costo) => {
    set((state) => ({
      partidas: state.partidas.map(p => ({
        ...p,
        costos: p.costos?.map(c => c.id_costo === id ? { ...c, ...costo } : c) || []
      }))
    }));
  },
  
  updateCostoSubPartida: (id, costo) => {
    set((state) => ({
      partidas: state.partidas.map(p => ({
        ...p,
        subpartidas: p.subpartidas?.map(sp => ({
          ...sp,
          costos: sp.costos?.map(c => c.id_costo === id ? { ...c, ...costo } : c) || []
        })) || []
      }))
    }));
  },

  // Funciones para manejar planillas
  addPlanillasToPartida: (idPartida, planillas) => {
    console.log('Store: addPlanillasToPartida llamada con:', { idPartida, planillas });
    set((state) => {
      const newState = {
        partidas: state.partidas.map(p => 
          p.id_partida === idPartida 
            ? { ...p, planillas: planillas }
            : p
        )
      };
      console.log('Store: Estado después de agregar planillas a partida:', newState);
      return newState;
    });
  },

  addPlanillasToSubPartida: (idPartida, idSubPartida, planillas) => {
    console.log('Store: addPlanillasToSubPartida llamada con:', { idPartida, idSubPartida, planillas });
    set((state) => {
      const newState = {
        partidas: state.partidas.map(p => 
          p.id_partida === idPartida 
            ? {
                ...p,
                subpartidas: p.subpartidas?.map(sp =>
                  sp.id_subpartida === idSubPartida
                    ? { ...sp, planillas: planillas }
                    : sp
                ) || []
              }
            : p
        )
      };
      console.log('Store: Estado después de agregar planillas a subpartida:', newState);
      return newState;
    });
  },

  // Funciones para manejar recursos de planillas
  saveRecursosToPlanilla: (idPartida, idSubPartida, idPlanilla, recursos) => {
    console.log('Store: saveRecursosToPlanilla llamada con:', { idPartida, idSubPartida, idPlanilla, recursos: recursos.length });
    set((state) => {
      const newState = {
        partidas: state.partidas.map(p => {
          if (p.id_partida === idPartida) {
            if (idSubPartida) {
              // Es una subpartida
              console.log('Store: Guardando recursos en subpartida:', idSubPartida, 'planilla:', idPlanilla);
              return {
                ...p,
                subpartidas: p.subpartidas?.map(sp =>
                  sp.id_subpartida === idSubPartida
                    ? {
                        ...sp,
                        planillas: sp.planillas?.map(planilla =>
                          planilla.id === idPlanilla
                            ? { ...planilla, recursos: recursos }
                            : planilla
                        ) || []
                      }
                    : sp
                ) || []
              };
            } else {
              // Es una partida directa
              console.log('Store: Guardando recursos en partida directa:', idPartida, 'planilla:', idPlanilla);
              return {
                ...p,
                planillas: p.planillas?.map(planilla =>
                  planilla.id === idPlanilla
                    ? { ...planilla, recursos: recursos }
                    : planilla
                ) || []
              };
            }
          }
          return p;
        })
      };
      console.log('Store: Estado después de guardar recursos:', newState);
      return newState;
    });
  },

  getRecursosFromPlanilla: (idPartida: number, idSubPartida: number | null, idPlanilla: number): any[] => {
    const state = useObraStore.getState();
    const partida = state.partidas.find((p: Partida) => p.id_partida === idPartida);
    // console.log('Store: getRecursosFromPlanilla llamada con:', { idPartida, idSubPartida, idPlanilla });
    // console.log('Store: Partida encontrada:', partida);
    
    if (idSubPartida) {
      // Es una subpartida
      const subpartida = partida?.subpartidas?.find((sp: SubPartida) => sp.id_subpartida === idSubPartida);
      // console.log('Store: Subpartida encontrada:', subpartida);
      const planilla = subpartida?.planillas?.find((p: any) => p.id === idPlanilla);
      // console.log('Store: Planilla encontrada:', planilla);
      const recursos = planilla?.recursos || [];
      // console.log('Store: Recursos encontrados:', recursos.length);
      return recursos;
    } else {
      // Es una partida directa
      const planilla = partida?.planillas?.find((p: any) => p.id === idPlanilla);
      // console.log('Store: Planilla directa encontrada:', planilla);
      const recursos = planilla?.recursos || [];
      // console.log('Store: Recursos directos encontrados:', recursos.length);
      return recursos;
    }
  },
  
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