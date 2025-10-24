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

interface ItemObra {
  id: string;
  id_obra: string;
  descripcion_tarea: string;
  id_especialidad: number;
  id_unidad: number;
  cantidad: number;
  precio_unitario: number;
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

interface ResumenObra {
  // Incrementos
  cantidad_incrementos: number;
  cantidad_incrementos_por_partida: number;
  cantidad_incrementos_por_subpartida: number;
  cantidad_incrementos_por_oferta: number;
  costo_total_incremento_por_partida: number;
  costo_total_incremento_por_subpartida: number;
  costo_total_incrementos: number;
  
  // Partidas y Subpartidas
  cantidad_partidas: number;
  cantidad_subpartidas: number;
  
  // Planillas
  cantidad_planilla_por_partida: number;
  cantidad_planilla_por_subpartida: number;
  planillas_por_oferta: Array<{id: number, nombre: string}>;
  cantidad_planillas_total: number;
  
  // Recursos
  cantidad_recursos_por_planilla: number;
  cantidad_recursos_por_partida: number;
  cantidad_recursos_por_subpartida: number;
  total_recursos_por_planilla: number;
  total_recursos_por_partida: number;
  total_recursos_por_subpartida: number;
  
  // Costos
  costo_total_por_planilla: number;
  costo_total_por_partida: number;
  costo_total_por_subpartida: number;
  costo_total_oferta_sin_incremento: number;
  costo_total_oferta_con_incremento: number;
  
  // Duración
  total_duracion_oferta: {
    años: number;
    meses: number;
    dias: number;
    horas: number;
  };
}

interface ObraState {
  obra: Obra | null;
  partidas: Partida[];
  incrementos: Incremento[];
  resumen: ResumenObra;
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
  // Funciones para incrementos
  addIncremento: (incremento: Incremento) => void;
  updateIncremento: (id: number, incremento: Partial<Incremento>) => void;
  removeIncremento: (id: number) => void;
  // Funciones para cálculos automáticos
  calcularTotalesObra: () => any;
  calcularResumenObra: () => void;
  // Funciones para guardado local
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  clearLocalStorage: () => void;
  // Funciones para sincronización con backend
  syncIncrementosWithBackend: () => Promise<void>;
  finalizarObra: () => Promise<void>;
}

export type { Obra, ItemObra, Partida, SubPartida, Incremento };

export const useObraStore = create<ObraState & ObraActions>((set) => ({
  // State
  obra: null,
  partidas: [],
  incrementos: [],
  resumen: {
    // Incrementos
    cantidad_incrementos: 0,
    cantidad_incrementos_por_partida: 0,
    cantidad_incrementos_por_subpartida: 0,
    cantidad_incrementos_por_oferta: 0,
    costo_total_incremento_por_partida: 0,
    costo_total_incremento_por_subpartida: 0,
    costo_total_incrementos: 0,
    
    // Partidas y Subpartidas
    cantidad_partidas: 0,
    cantidad_subpartidas: 0,
    
    // Planillas
    cantidad_planilla_por_partida: 0,
    cantidad_planilla_por_subpartida: 0,
    planillas_por_oferta: [],
    cantidad_planillas_total: 0,
    
    // Recursos
    cantidad_recursos_por_planilla: 0,
    cantidad_recursos_por_partida: 0,
    cantidad_recursos_por_subpartida: 0,
    total_recursos_por_planilla: 0,
    total_recursos_por_partida: 0,
    total_recursos_por_subpartida: 0,
    
    // Costos
    costo_total_por_planilla: 0,
    costo_total_por_partida: 0,
    costo_total_por_subpartida: 0,
    costo_total_oferta_sin_incremento: 0,
    costo_total_oferta_con_incremento: 0,
    
    // Duración
    total_duracion_oferta: {
      años: 0,
      meses: 0,
      dias: 0,
      horas: 0,
    },
  },
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
  }, () => {
    // Recalcular resumen automáticamente
    setTimeout(() => {
      useObraStore.getState().calcularResumenObra();
    }, 0);
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
    // Recalcular resumen automáticamente
    setTimeout(() => {
      useObraStore.getState().calcularResumenObra();
    }, 0);
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
    // Recalcular resumen automáticamente
    setTimeout(() => {
      useObraStore.getState().calcularResumenObra();
    }, 0);
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
    // Recalcular resumen automáticamente
    setTimeout(() => {
      useObraStore.getState().calcularResumenObra();
    }, 0);
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
      incrementos: state.incrementos,
      resumen: state.resumen,
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
          incrementos: data.incrementos || [],
          resumen: data.resumen || {
            // Incrementos
            cantidad_incrementos: 0,
            cantidad_incrementos_por_partida: 0,
            cantidad_incrementos_por_subpartida: 0,
            cantidad_incrementos_por_oferta: 0,
            costo_total_incremento_por_partida: 0,
            costo_total_incremento_por_subpartida: 0,
            costo_total_incrementos: 0,
            
            // Partidas y Subpartidas
            cantidad_partidas: 0,
            cantidad_subpartidas: 0,
            
            // Planillas
            cantidad_planilla_por_partida: 0,
            cantidad_planilla_por_subpartida: 0,
            planillas_por_oferta: [],
            cantidad_planillas_total: 0,
            
            // Recursos
            cantidad_recursos_por_planilla: 0,
            cantidad_recursos_por_partida: 0,
            cantidad_recursos_por_subpartida: 0,
            total_recursos_por_planilla: 0,
            total_recursos_por_partida: 0,
            total_recursos_por_subpartida: 0,
            
            // Costos
            costo_total_por_planilla: 0,
            costo_total_por_partida: 0,
            costo_total_por_subpartida: 0,
            costo_total_oferta_sin_incremento: 0,
            costo_total_oferta_con_incremento: 0,
            
            // Duración
            total_duracion_oferta: {
              años: 0,
              meses: 0,
              dias: 0,
              horas: 0,
            },
          },
          selectedPartida: data.selectedPartida,
          selectedSubPartida: data.selectedSubPartida,
          selectedPlanilla: data.selectedPlanilla,
          showResumen: data.showResumen || false,
        });
        // Recalcular resumen después de cargar datos
        setTimeout(() => {
          useObraStore.getState().calcularResumenObra();
        }, 0);
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
      incrementos: [],
      resumen: {
        // Incrementos
        cantidad_incrementos: 0,
        cantidad_incrementos_por_partida: 0,
        cantidad_incrementos_por_subpartida: 0,
        cantidad_incrementos_por_oferta: 0,
        costo_total_incremento_por_partida: 0,
        costo_total_incremento_por_subpartida: 0,
        costo_total_incrementos: 0,
        
        // Partidas y Subpartidas
        cantidad_partidas: 0,
        cantidad_subpartidas: 0,
        
        // Planillas
        cantidad_planilla_por_partida: 0,
        cantidad_planilla_por_subpartida: 0,
        planillas_por_oferta: [],
        cantidad_planillas_total: 0,
        
        // Recursos
        cantidad_recursos_por_planilla: 0,
        cantidad_recursos_por_partida: 0,
        cantidad_recursos_por_subpartida: 0,
        total_recursos_por_planilla: 0,
        total_recursos_por_partida: 0,
        total_recursos_por_subpartida: 0,
        
        // Costos
        costo_total_por_planilla: 0,
        costo_total_por_partida: 0,
        costo_total_por_subpartida: 0,
        costo_total_oferta_sin_incremento: 0,
        costo_total_oferta_con_incremento: 0,
        
        // Duración
        total_duracion_oferta: {
          años: 0,
          meses: 0,
          dias: 0,
          horas: 0,
        },
      },
      selectedPartida: null,
      selectedSubPartida: null,
      selectedPlanilla: null,
      showResumen: false,
    });
  },

  // Funciones para incrementos
  addIncremento: (incremento) => {
    console.log('Store: Agregando incremento:', incremento);
    set((state) => ({
      incrementos: [...state.incrementos, incremento]
    }));
    // Recalcular resumen automáticamente
    setTimeout(() => {
      useObraStore.getState().calcularResumenObra();
    }, 0);
  },

  updateIncremento: (id, incremento) => {
    console.log('Store: Actualizando incremento:', id, incremento);
    set((state) => ({
      incrementos: state.incrementos.map(inc => 
        inc.id_incremento === id ? { ...inc, ...incremento } : inc
      )
    }));
    // Recalcular resumen automáticamente
    setTimeout(() => {
      useObraStore.getState().calcularResumenObra();
    }, 0);
  },

  removeIncremento: (id) => {
    console.log('Store: Eliminando incremento:', id);
    set((state) => ({
      incrementos: state.incrementos.filter(inc => inc.id_incremento !== id)
    }));
    // Recalcular resumen automáticamente
    setTimeout(() => {
      useObraStore.getState().calcularResumenObra();
    }, 0);
  },


  // Función para calcular todos los totales de la obra
  calcularTotalesObra: () => {
    const state = useObraStore.getState();
    const { partidas, incrementos } = state;
    
    let totalPartidas = partidas.length;
    let totalSubpartidas = 0;
    let totalIncrementos = incrementos.length;
    let totalCostoSinIncremento = 0;
    let totalCostoConIncremento = 0;
    let totalIncrementosMonto = 0;
    let totalPlanillas = 0;
    let totalRecursos = 0;
    let totalDuracion = { horas: 0, dias: 0, meses: 0, años: 0 };
    let planillasUnicas = new Set();
    let incrementosPorPartida = new Map();
    let incrementosPorSubpartida = new Map();
    let costosPorPartida = new Map();
    let costosPorSubpartida = new Map();

    // Calcular subpartidas, costos, planillas y recursos
    partidas.forEach(partida => {
      let costoPartida = 0;
      
      if (partida.subpartidas) {
        totalSubpartidas += partida.subpartidas.length;
        
        // Calcular costos de subpartidas
        partida.subpartidas.forEach((subpartida: any) => {
          let costoSubpartida = 0;
          
          if (subpartida.planillas) {
            totalPlanillas += subpartida.planillas.length;
            subpartida.planillas.forEach((planilla: any) => {
              planillasUnicas.add(planilla.id);
              if (planilla.recursos) {
                totalRecursos += planilla.recursos.length;
                planilla.recursos.forEach((recurso: any) => {
                  const cantidad = parseFloat(recurso.cantidad) || 0;
                  const costoUnitario = parseFloat(recurso.costo_unitario_predeterminado) || 0;
                  const subtotal = cantidad * costoUnitario;
                  costoSubpartida += subtotal;
                });
              }
            });
          }

          // Calcular duración de subpartidas
          if (subpartida.duracion && subpartida.tipo_de_tiempo) {
            const duracion = subpartida.duracion;
            const tipo = subpartida.tipo_de_tiempo.medida;
            switch (tipo) {
              case 'hrs':
                totalDuracion.horas += duracion;
                break;
              case 'ds':
                totalDuracion.dias += duracion;
                break;
              case 'ms':
                totalDuracion.meses += duracion;
                break;
              case 'as':
                totalDuracion.años += duracion;
                break;
            }
          }
          
          costosPorSubpartida.set(subpartida.id_subpartida, costoSubpartida);
          costoPartida += costoSubpartida;
        });
      } else {
        // Calcular costos de partida directa
        if (partida.planillas) {
          totalPlanillas += partida.planillas.length;
          partida.planillas.forEach((planilla: any) => {
            planillasUnicas.add(planilla.id);
            if (planilla.recursos) {
              totalRecursos += planilla.recursos.length;
              planilla.recursos.forEach((recurso: any) => {
                const cantidad = parseFloat(recurso.cantidad) || 0;
                const costoUnitario = parseFloat(recurso.costo_unitario_predeterminado) || 0;
                const subtotal = cantidad * costoUnitario;
                costoPartida += subtotal;
              });
            }
          });
        }

        // Calcular duración de partida directa
        if (partida.duracion && partida.tipo_de_tiempo) {
          const duracion = partida.duracion;
          const tipo = partida.tipo_de_tiempo.medida;
          switch (tipo) {
            case 'hrs':
              totalDuracion.horas += duracion;
              break;
            case 'ds':
              totalDuracion.dias += duracion;
              break;
            case 'ms':
              totalDuracion.meses += duracion;
              break;
            case 'as':
              totalDuracion.años += duracion;
              break;
          }
        }
      }
      
      costosPorPartida.set(partida.id_partida, costoPartida);
      totalCostoSinIncremento += costoPartida;
    });

    // Calcular incrementos por partida y subpartida
    incrementos.forEach(incremento => {
      if (incremento.id_partida) {
        const actual = incrementosPorPartida.get(incremento.id_partida) || 0;
        incrementosPorPartida.set(incremento.id_partida, actual + 1);
      } else if (incremento.id_subpartida) {
        const actual = incrementosPorSubpartida.get(incremento.id_subpartida) || 0;
        incrementosPorSubpartida.set(incremento.id_subpartida, actual + 1);
      }
    });

    // Calcular total de incrementos
    totalIncrementosMonto = incrementos.reduce((sum, inc) => sum + (inc.monto_calculado || 0), 0);
    totalCostoConIncremento = totalCostoSinIncremento + totalIncrementosMonto;

    return {
      // Cantidades
      totalPartidas,
      totalSubpartidas,
      totalIncrementos,
      totalPlanillas,
      totalRecursos,
      totalPlanillasUnicas: planillasUnicas.size,
      
      // Costos
      totalCostoSinIncremento,
      totalCostoConIncremento,
      totalIncrementosMonto,
      
      // Duración
      totalDuracion,
      
      // Detalles por item
      incrementosPorPartida: Object.fromEntries(incrementosPorPartida),
      incrementosPorSubpartida: Object.fromEntries(incrementosPorSubpartida),
      costosPorPartida: Object.fromEntries(costosPorPartida),
      costosPorSubpartida: Object.fromEntries(costosPorSubpartida),
      
      // Planillas únicas
      planillasUnicas: Array.from(planillasUnicas)
    };
  },

  // Función para calcular el resumen completo de la obra
  calcularResumenObra: () => {
    const state = useObraStore.getState();
    const { partidas, incrementos } = state;
    
    // Inicializar contadores
    let cantidad_incrementos = incrementos.length;
    let cantidad_incrementos_por_partida = 0;
    let cantidad_incrementos_por_subpartida = 0;
    let costo_total_incremento_por_partida = 0;
    let costo_total_incremento_por_subpartida = 0;
    
    let cantidad_partidas = partidas.length;
    let cantidad_subpartidas = 0;
    
    let cantidad_planilla_por_partida = 0;
    let cantidad_planilla_por_subpartida = 0;
    let planillas_por_oferta: Array<{id: number, nombre: string}> = [];
    let planillasUnicas = new Set<number>();
    
    let cantidad_recursos_por_planilla = 0;
    let cantidad_recursos_por_partida = 0;
    let cantidad_recursos_por_subpartida = 0;
    let total_recursos_por_planilla = 0;
    let total_recursos_por_partida = 0;
    let total_recursos_por_subpartida = 0;
    
    let costo_total_por_planilla = 0;
    let costo_total_por_partida = 0;
    let costo_total_por_subpartida = 0;
    
    let total_duracion_oferta = { años: 0, meses: 0, dias: 0, horas: 0 };
    
    // Calcular incrementos por partida y subpartida
    incrementos.forEach(incremento => {
      if (incremento.id_partida) {
        cantidad_incrementos_por_partida++;
        costo_total_incremento_por_partida += incremento.monto_calculado || 0;
      } else if (incremento.id_subpartida) {
        cantidad_incrementos_por_subpartida++;
        costo_total_incremento_por_subpartida += incremento.monto_calculado || 0;
      }
    });
    
    let cantidad_incrementos_por_oferta = cantidad_incrementos_por_partida + cantidad_incrementos_por_subpartida;
    let costo_total_incrementos = costo_total_incremento_por_partida + costo_total_incremento_por_subpartida;
    
    // Calcular partidas y subpartidas
    partidas.forEach(partida => {
      if (partida.subpartidas && partida.subpartidas.length > 0) {
        cantidad_subpartidas += partida.subpartidas.length;
        
        // Calcular subpartidas
        partida.subpartidas.forEach((subpartida: any) => {
          let costoSubpartida = 0;
          let recursosSubpartida = 0;
          let totalRecursosSubpartida = 0;
          
          if (subpartida.planillas) {
            cantidad_planilla_por_subpartida += subpartida.planillas.length;
            
            subpartida.planillas.forEach((planilla: any) => {
              planillasUnicas.add(planilla.id);
              planillas_por_oferta.push({ id: planilla.id, nombre: planilla.nombre });
              
              let costoPlanilla = 0;
              let recursosPlanilla = 0;
              let totalRecursosPlanilla = 0;
              
              if (planilla.recursos) {
                recursosPlanilla = planilla.recursos.length;
                cantidad_recursos_por_planilla += recursosPlanilla;
                
                planilla.recursos.forEach((recurso: any) => {
                  const cantidad = parseFloat(recurso.cantidad) || 0;
                  const costoUnitario = parseFloat(recurso.costo_unitario_predeterminado) || 0;
                  const subtotal = cantidad * costoUnitario;
                  
                  totalRecursosPlanilla += cantidad;
                  costoPlanilla += subtotal;
                });
              }
              
              total_recursos_por_planilla += totalRecursosPlanilla;
              costo_total_por_planilla += costoPlanilla;
              recursosSubpartida += recursosPlanilla;
              totalRecursosSubpartida += totalRecursosPlanilla;
              costoSubpartida += costoPlanilla;
            });
          }
          
          cantidad_recursos_por_subpartida += recursosSubpartida;
          total_recursos_por_subpartida += totalRecursosSubpartida;
          costo_total_por_subpartida += costoSubpartida;
          
          // Calcular duración de subpartida
          if (subpartida.duracion && subpartida.tipo_de_tiempo) {
            const duracion = subpartida.duracion;
            const tipo = subpartida.tipo_de_tiempo.medida;
            switch (tipo) {
              case 'hrs':
                total_duracion_oferta.horas += duracion;
                break;
              case 'ds':
                total_duracion_oferta.dias += duracion;
                break;
              case 'ms':
                total_duracion_oferta.meses += duracion;
                break;
              case 'as':
                total_duracion_oferta.años += duracion;
                break;
            }
          }
        });
      } else {
        // Calcular partida directa
        let costoPartida = 0;
        let recursosPartida = 0;
        let totalRecursosPartida = 0;
        
        if (partida.planillas) {
          cantidad_planilla_por_partida += partida.planillas.length;
          
          partida.planillas.forEach((planilla: any) => {
            planillasUnicas.add(planilla.id);
            planillas_por_oferta.push({ id: planilla.id, nombre: planilla.nombre });
            
            let costoPlanilla = 0;
            let recursosPlanilla = 0;
            let totalRecursosPlanilla = 0;
            
            if (planilla.recursos) {
              recursosPlanilla = planilla.recursos.length;
              cantidad_recursos_por_planilla += recursosPlanilla;
              
              planilla.recursos.forEach((recurso: any) => {
                const cantidad = parseFloat(recurso.cantidad) || 0;
                const costoUnitario = parseFloat(recurso.costo_unitario_predeterminado) || 0;
                const subtotal = cantidad * costoUnitario;
                
                totalRecursosPlanilla += cantidad;
                costoPlanilla += subtotal;
              });
            }
            
            total_recursos_por_planilla += totalRecursosPlanilla;
            costo_total_por_planilla += costoPlanilla;
            recursosPartida += recursosPlanilla;
            totalRecursosPartida += totalRecursosPlanilla;
            costoPartida += costoPlanilla;
          });
        }
        
        cantidad_recursos_por_partida += recursosPartida;
        total_recursos_por_partida += totalRecursosPartida;
        costo_total_por_partida += costoPartida;
        
        // Calcular duración de partida directa
        if (partida.duracion && partida.tipo_de_tiempo) {
          const duracion = partida.duracion;
          const tipo = partida.tipo_de_tiempo.medida;
          switch (tipo) {
            case 'hrs':
              total_duracion_oferta.horas += duracion;
              break;
            case 'ds':
              total_duracion_oferta.dias += duracion;
              break;
            case 'ms':
              total_duracion_oferta.meses += duracion;
              break;
            case 'as':
              total_duracion_oferta.años += duracion;
              break;
          }
        }
      }
    });
    
    // Eliminar planillas duplicadas
    const planillasUnicasArray = Array.from(planillasUnicas);
    const planillasSinDuplicados = planillas_por_oferta.filter((planilla, index, self) => 
      index === self.findIndex(p => p.id === planilla.id)
    );
    
    let cantidad_planillas_total = cantidad_planilla_por_partida + cantidad_planilla_por_subpartida;
    let costo_total_oferta_sin_incremento = costo_total_por_partida + costo_total_por_subpartida;
    let costo_total_oferta_con_incremento = costo_total_oferta_sin_incremento + costo_total_incrementos;
    
    // Actualizar el estado del resumen
    set((state) => ({
      resumen: {
        // Incrementos
        cantidad_incrementos,
        cantidad_incrementos_por_partida,
        cantidad_incrementos_por_subpartida,
        cantidad_incrementos_por_oferta,
        costo_total_incremento_por_partida,
        costo_total_incremento_por_subpartida,
        costo_total_incrementos,
        
        // Partidas y Subpartidas
        cantidad_partidas,
        cantidad_subpartidas,
        
        // Planillas
        cantidad_planilla_por_partida,
        cantidad_planilla_por_subpartida,
        planillas_por_oferta: planillasSinDuplicados,
        cantidad_planillas_total,
        
        // Recursos
        cantidad_recursos_por_planilla,
        cantidad_recursos_por_partida,
        cantidad_recursos_por_subpartida,
        total_recursos_por_planilla,
        total_recursos_por_partida,
        total_recursos_por_subpartida,
        
        // Costos
        costo_total_por_planilla,
        costo_total_por_partida,
        costo_total_por_subpartida,
        costo_total_oferta_sin_incremento,
        costo_total_oferta_con_incremento,
        
        // Duración
        total_duracion_oferta,
      }
    }));
  },

  // Funciones para sincronización con backend
  syncIncrementosWithBackend: async () => {
    try {
      const { createIncremento, updateIncremento, deleteIncremento } = await import('@/actions/obras');
      const state = useObraStore.getState();
      
      // Sincronizar incrementos locales con el backend
      for (const incremento of state.incrementos) {
        if (incremento.id_incremento < 0) {
          // Es un incremento nuevo (ID negativo = temporal)
          const nuevoIncremento = await createIncremento(incremento);
          // Actualizar el ID en el store
          set((state) => ({
            incrementos: state.incrementos.map(inc => 
              inc.id_incremento === incremento.id_incremento 
                ? { ...inc, id_incremento: nuevoIncremento.id_incremento }
                : inc
            )
          }));
        }
      }
      
      console.log('Store: Incrementos sincronizados con backend');
    } catch (error) {
      console.error('Error sincronizando incrementos:', error);
      throw error;
    }
  },

  finalizarObra: async () => {
    try {
      const { finalizarObra } = await import('@/actions/obras');
      const state = useObraStore.getState();
      
      if (!state.obra?.id_obra) {
        throw new Error('No hay obra para finalizar');
      }
      
      // Primero sincronizar incrementos
      await state.syncIncrementosWithBackend();
      
      // Luego finalizar la obra
      const obraFinalizada = await finalizarObra(state.obra.id_obra);
      
      // Actualizar el store con los datos finalizados
      set({ obra: obraFinalizada });
      
      // Limpiar localStorage
      state.clearLocalStorage();
      
      console.log('Store: Obra finalizada exitosamente');
      return obraFinalizada;
    } catch (error) {
      console.error('Error finalizando obra:', error);
      throw error;
    }
  },
}));