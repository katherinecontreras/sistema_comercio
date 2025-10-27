import { create } from 'zustand';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

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
  planillas?: Planilla[];
  costos?: any[];
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
  costos?: any[];
  incrementos?: Incremento[];
  planillas?: Planilla[];
  completa?: boolean;
}

interface Planilla {
  id: number;
  nombre: string;
  recursos?: Recurso[];
}

interface Recurso {
  id: string;
  id_recurso: number;
  descripcion: string;
  unidad: string;
  cantidad: number;
  costo_unitario_predeterminado: number;
  costo_total: number;
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

interface CostoDetallado {
  id_partida: number;
  nombre_partida: string;
  total_costo_partida: number;
  total_costo_incremento_partida: number;
  total_costo_partida_sin_incremento: number;
  subpartidas: Array<{
    id_subpartida: number;
    nombre_subpartida: string;
    total_costo_subpartida: number;
    total_costo_incremento_subpartida: number;
    total_costo_subpartida_sin_incremento: number;
  }>;
}

interface ResumenObra {
  cantidad_incrementos: number;
  cantidad_incrementos_por_partida: number;
  cantidad_incrementos_por_subpartida: number;
  cantidad_incrementos_por_oferta: number;
  costo_total_incremento_por_partida: number;
  costo_total_incremento_por_subpartida: number;
  costo_total_incrementos: number;
  cantidad_partidas: number;
  cantidad_subpartidas: number;
  cantidad_planilla_por_partida: number;
  cantidad_planilla_por_subpartida: number;
  planillas_por_oferta: Array<{id: number, nombre: string}>;
  cantidad_planillas_total: number;
  cantidad_recursos_por_planilla: number;
  cantidad_recursos_por_partida: number;
  cantidad_recursos_por_subpartida: number;
  total_recursos_por_planilla: number;
  total_recursos_por_partida: number;
  total_recursos_por_subpartida: number;
  costo_total_por_planilla: number;
  costo_total_por_partida: number;
  costo_total_por_subpartida: number;
  costo_total_oferta_sin_incremento: number;
  costo_total_oferta_con_incremento: number;
  total_duracion_oferta: {
    años: number;
    meses: number;
    dias: number;
    horas: number;
  };
  costos_detallados: CostoDetallado[];
}

// ============================================================================
// ESTADO INICIAL
// ============================================================================

const RESUMEN_INICIAL: ResumenObra = {
  cantidad_incrementos: 0,
  cantidad_incrementos_por_partida: 0,
  cantidad_incrementos_por_subpartida: 0,
  cantidad_incrementos_por_oferta: 0,
  costo_total_incremento_por_partida: 0,
  costo_total_incremento_por_subpartida: 0,
  costo_total_incrementos: 0,
  cantidad_partidas: 0,
  cantidad_subpartidas: 0,
  cantidad_planilla_por_partida: 0,
  cantidad_planilla_por_subpartida: 0,
  planillas_por_oferta: [],
  cantidad_planillas_total: 0,
  cantidad_recursos_por_planilla: 0,
  cantidad_recursos_por_partida: 0,
  cantidad_recursos_por_subpartida: 0,
  total_recursos_por_planilla: 0,
  total_recursos_por_partida: 0,
  total_recursos_por_subpartida: 0,
  costo_total_por_planilla: 0,
  costo_total_por_partida: 0,
  costo_total_por_subpartida: 0,
  costo_total_oferta_sin_incremento: 0,
  costo_total_oferta_con_incremento: 0,
  total_duracion_oferta: { años: 0, meses: 0, dias: 0, horas: 0 },
  costos_detallados: []
};

// ============================================================================
// UTILIDADES DE CÁLCULO
// ============================================================================

class CalculadorResumen {
  private partidas: Partida[];
  private incrementos: Incremento[];

  constructor(partidas: Partida[], incrementos: Incremento[]) {
    this.partidas = partidas;
    this.incrementos = incrementos;
  }

  // Calcular métricas de recursos de una planilla
  private calcularMetricasPlanilla(planilla: Planilla) {
    if (!planilla.recursos?.length) return { cantidad: 0, total: 0, costo: 0 };

    let cantidad = 0;
    let total = 0;
    let costo = 0;

    for (const recurso of planilla.recursos) {
      cantidad++;
      total += recurso.cantidad || 0;
      const costoUnitario = recurso.costo_unitario_predeterminado || 0;
      costo += (recurso.cantidad || 0) * costoUnitario;
    }

    return { cantidad, total, costo };
  }

  // Calcular duración en formato normalizado
  private calcularDuracion(duracion: number, medida: string) {
    const resultado = { años: 0, meses: 0, dias: 0, horas: 0 };
    
    switch (medida) {
      case 'hrs': resultado.horas = duracion; break;
      case 'ds': resultado.dias = duracion; break;
      case 'ms': resultado.meses = duracion; break;
      case 'as': resultado.años = duracion; break;
    }
    
    return resultado;
  }

  // Procesar subpartida
  private procesarSubpartida(partida: Partida, subpartida: SubPartida) {
    let costoTotal = 0;
    let cantidadRecursos = 0;
    let totalRecursos = 0;
    let cantidadPlanillas = subpartida.planillas?.length || 0;
    
    let duracion = { años: 0, meses: 0, dias: 0, horas: 0 };

    // Procesar planillas
    if (subpartida.planillas) {
      for (const planilla of subpartida.planillas) {
        const metricas = this.calcularMetricasPlanilla(planilla);
        cantidadRecursos += metricas.cantidad;
        totalRecursos += metricas.total;
        costoTotal += metricas.costo;
      }
    }

    // Calcular duración
    if (subpartida.duracion && subpartida.tipo_de_tiempo) {
      duracion = this.calcularDuracion(
        subpartida.duracion, 
        subpartida.tipo_de_tiempo.medida
      );
    }

    return {
      cantidadPlanillas,
      cantidadRecursos,
      totalRecursos,
      costoTotal,
      duracion
    };
  }

  // Procesar partida
  private procesarPartida(partida: Partida) {
    let costoTotal = 0;
    let cantidadRecursos = 0;
    let totalRecursos = 0;
    let cantidadPlanillas = 0;
    let cantidadSubpartidas = 0;
    let duracion = { años: 0, meses: 0, dias: 0, horas: 0 };

    if (partida.tiene_subpartidas && partida.subpartidas) {
      // Procesar subpartidas
      cantidadSubpartidas = partida.subpartidas.length;
      
      for (const subpartida of partida.subpartidas) {
        const resultado = this.procesarSubpartida(partida, subpartida);
        cantidadPlanillas += resultado.cantidadPlanillas;
        cantidadRecursos += resultado.cantidadRecursos;
        totalRecursos += resultado.totalRecursos;
        costoTotal += resultado.costoTotal;
        
        // Sumar duraciones
        duracion.años += resultado.duracion.años;
        duracion.meses += resultado.duracion.meses;
        duracion.dias += resultado.duracion.dias;
        duracion.horas += resultado.duracion.horas;
      }
    } else {
      // Partida directa
      cantidadPlanillas = partida.planillas?.length || 0;
      
      if (partida.planillas) {
        for (const planilla of partida.planillas) {
          const metricas = this.calcularMetricasPlanilla(planilla);
          cantidadRecursos += metricas.cantidad;
          totalRecursos += metricas.total;
          costoTotal += metricas.costo;
        }
      }

      // Calcular duración
      if (partida.duracion && partida.tipo_de_tiempo) {
        duracion = this.calcularDuracion(
          partida.duracion, 
          partida.tipo_de_tiempo.medida
        );
      }
    }

    return {
      cantidadPlanillas,
      cantidadSubpartidas,
      cantidadRecursos,
      totalRecursos,
      costoTotal,
      duracion
    };
  }

  // Calcular resumen completo
  public calcular(): ResumenObra {
    const resumen: ResumenObra = { ...RESUMEN_INICIAL };

    // Contadores acumulados
    let planillasUnicas = new Set<number>();
    let totalDuracion = { años: 0, meses: 0, dias: 0, horas: 0 };

    // Procesar partidas
    resumen.cantidad_partidas = this.partidas.length;

    for (const partida of this.partidas) {
      const resultado = this.procesarPartida(partida);

      // Acumular métricas
      resumen.cantidad_subpartidas += resultado.cantidadSubpartidas;
      resumen.costo_total_oferta_sin_incremento += resultado.costoTotal;

      if (partida.tiene_subpartidas) {
        resumen.cantidad_planilla_por_subpartida += resultado.cantidadPlanillas;
        resumen.cantidad_recursos_por_subpartida += resultado.cantidadRecursos;
        resumen.total_recursos_por_subpartida += resultado.totalRecursos;
        resumen.costo_total_por_subpartida += resultado.costoTotal;
      } else {
        resumen.cantidad_planilla_por_partida += resultado.cantidadPlanillas;
        resumen.cantidad_recursos_por_partida += resultado.cantidadRecursos;
        resumen.total_recursos_por_partida += resultado.totalRecursos;
        resumen.costo_total_por_partida += resultado.costoTotal;
      }

      // Registrar planillas únicas
      const planillas = partida.tiene_subpartidas
        ? partida.subpartidas?.flatMap(sp => sp.planillas || [])
        : partida.planillas;

      planillas?.forEach(p => planillasUnicas.add(p.id));

      // Acumular duración
      totalDuracion.años += resultado.duracion.años;
      totalDuracion.meses += resultado.duracion.meses;
      totalDuracion.dias += resultado.duracion.dias;
      totalDuracion.horas += resultado.duracion.horas;
    }

    // Procesar incrementos
    resumen.cantidad_incrementos = this.incrementos.length;

    for (const inc of this.incrementos) {
      resumen.costo_total_incrementos += inc.monto_calculado || 0;

      if (inc.id_partida) {
        resumen.cantidad_incrementos_por_partida++;
        resumen.costo_total_incremento_por_partida += inc.monto_calculado || 0;
      } else if (inc.id_subpartida) {
        resumen.cantidad_incrementos_por_subpartida++;
        resumen.costo_total_incremento_por_subpartida += inc.monto_calculado || 0;
      }
    }

    // Calcular totales finales
    resumen.cantidad_incrementos_por_oferta = 
      resumen.cantidad_incrementos_por_partida + 
      resumen.cantidad_incrementos_por_subpartida;

    resumen.cantidad_planillas_total = 
      resumen.cantidad_planilla_por_partida + 
      resumen.cantidad_planilla_por_subpartida;

    resumen.cantidad_recursos_por_planilla = 
      resumen.cantidad_recursos_por_partida + 
      resumen.cantidad_recursos_por_subpartida;

    resumen.total_recursos_por_planilla = 
      resumen.total_recursos_por_partida + 
      resumen.total_recursos_por_subpartida;

    resumen.costo_total_por_planilla = 
      resumen.costo_total_por_partida + 
      resumen.costo_total_por_subpartida;

    resumen.costo_total_oferta_con_incremento = 
      resumen.costo_total_oferta_sin_incremento + 
      resumen.costo_total_incrementos;

    resumen.total_duracion_oferta = totalDuracion;

    // Planillas únicas
    resumen.planillas_por_oferta = Array.from(planillasUnicas).map(id => {
      // Buscar nombre de planilla
      for (const partida of this.partidas) {
        const planillas = partida.tiene_subpartidas
          ? partida.subpartidas?.flatMap(sp => sp.planillas || [])
          : partida.planillas;
        const planilla = planillas?.find(p => p.id === id);
        if (planilla) return { id, nombre: planilla.nombre };
      }
      return { id, nombre: `Planilla ${id}` };
    });

    // Calcular costos detallados por partida
    resumen.costos_detallados = this.partidas.map(partida => {
      const costoPartida = partida.costos?.reduce((sum, costo) => sum + (costo.costo_total || 0), 0) || 0;
      const incrementosPartida = this.incrementos.filter(inc => inc.id_partida === partida.id_partida);
      const costoIncrementosPartida = incrementosPartida.reduce((sum, inc) => sum + inc.monto_calculado, 0);
      
      const subpartidasDetalladas = partida.subpartidas?.map(subpartida => {
        const costoSubpartida = subpartida.costos?.reduce((sum, costo) => sum + (costo.costo_total || 0), 0) || 0;
        const incrementosSubpartida = this.incrementos.filter(inc => inc.id_subpartida === subpartida.id_subpartida);
        const costoIncrementosSubpartida = incrementosSubpartida.reduce((sum, inc) => sum + inc.monto_calculado, 0);
        
        return {
          id_subpartida: subpartida.id_subpartida || 0,
          nombre_subpartida: subpartida.descripcion_tarea,
          total_costo_subpartida: costoSubpartida + costoIncrementosSubpartida,
          total_costo_incremento_subpartida: costoIncrementosSubpartida,
          total_costo_subpartida_sin_incremento: costoSubpartida
        };
      }) || [];

      return {
        id_partida: partida.id_partida || 0,
        nombre_partida: partida.nombre_partida,
        total_costo_partida: costoPartida + costoIncrementosPartida,
        total_costo_incremento_partida: costoIncrementosPartida,
        total_costo_partida_sin_incremento: costoPartida,
        subpartidas: subpartidasDetalladas
      };
    });

    return resumen;
  }
}

// ============================================================================
// STORE
// ============================================================================

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
  // Obra
  setObra: (obra: Obra | null) => void;
  getObra: () => Obra | null;
  clearObra: () => void;

  // Partidas
  setPartidas: (partidas: Partida[]) => void;
  addPartida: (partida: Partida) => void;
  addPartidaWithEffects: (partida: Partida) => void;
  updatePartida: (id: number, partida: Partial<Partida>) => void;

  // SubPartidas
  addSubPartida: (idPartida: number, subpartida: SubPartida) => void;
  updateSubPartida: (id: number, subpartida: Partial<SubPartida>) => void;

  // Selección
  setSelectedPartida: (id: number | null) => void;
  setSelectedSubPartida: (id: number | null) => void;
  setSelectedPlanilla: (id: number | null) => void;
  setShowResumen: (show: boolean) => void;
  clearSelection: () => void;

  // Planillas
  addPlanillasToPartida: (idPartida: number, planillas: Planilla[]) => void;
  addPlanillasToSubPartida: (idPartida: number, idSubPartida: number, planillas: Planilla[]) => void;

  // Recursos
  saveRecursosToPlanilla: (idPartida: number, idSubPartida: number | null, idPlanilla: number, recursos: any[]) => void;
  getRecursosFromPlanilla: (idPartida: number, idSubPartida: number | null, idPlanilla: number) => any[];

  // Incrementos
  getIncremento: (idPartida: number) => Incremento | undefined;
  addIncremento: (incremento: Incremento) => void;
  updateIncremento: (id: number, incremento: Partial<Incremento>) => void;
  removeIncremento: (id: number) => void;

  // Cálculos
  calcularResumenObra: () => void;

  // Storage
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  clearLocalStorage: () => void;

  // Backend sync
  finalizarObra: () => Promise<void>;
}

export const useObraStore = create<ObraState & ObraActions>((set, get) => ({
  // ============================================================================
  // ESTADO INICIAL
  // ============================================================================
  obra: null,
  partidas: [],
  incrementos: [],
  resumen: RESUMEN_INICIAL,
  selectedPartida: null,
  selectedSubPartida: null,
  selectedPlanilla: null,
  showResumen: false,

  // ============================================================================
  // OBRA
  // ============================================================================
  setObra: (obra) => set({ obra }),
  
  getObra: () => get().obra,
  
  clearObra: () => set({
    obra: null,
    partidas: [],
    incrementos: [],
    resumen: RESUMEN_INICIAL,
    selectedPartida: null,
    selectedSubPartida: null,
    selectedPlanilla: null,
    showResumen: false
  }),

  // ============================================================================
  // PARTIDAS
  // ============================================================================
  setPartidas: (partidas) => {
    set({ partidas });
    get().calcularResumenObra();
  },

  addPartida: (partida) => {
    set((state) => ({ partidas: [...state.partidas, partida] }));
    get().calcularResumenObra();
    get().saveToLocalStorage();
  },

  addPartidaWithEffects: (partida) => {
    set((state) => ({ partidas: [...state.partidas, partida] }));
    get().calcularResumenObra();
    get().saveToLocalStorage();
  },

  updatePartida: (id, updates) => {
    set((state) => ({
      partidas: state.partidas.map(p => 
        p.id_partida === id ? { ...p, ...updates } : p
      )
    }));
    get().calcularResumenObra();
  },

  // ============================================================================
  // SUBPARTIDAS
  // ============================================================================
  addSubPartida: (idPartida, subpartida) => {
    set((state) => ({
      partidas: state.partidas.map(p => 
        p.id_partida === idPartida 
          ? { 
              ...p, 
              tiene_subpartidas: true,
              subpartidas: [...(p.subpartidas || []), subpartida]
            }
          : p
      )
    }));
    get().saveToLocalStorage();
  },

  updateSubPartida: (id, updates) => {
    set((state) => ({
      partidas: state.partidas.map(p => ({
        ...p,
        subpartidas: p.subpartidas?.map(s => 
          s.id_subpartida === id ? { ...s, ...updates } : s
        )
      }))
    }));
  },

  // ============================================================================
  // SELECCIÓN
  // ============================================================================
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

  // ============================================================================
  // PLANILLAS
  // ============================================================================
  addPlanillasToPartida: (idPartida, planillas) => {
    set((state) => ({
      partidas: state.partidas.map(p => 
        p.id_partida === idPartida ? { ...p, planillas } : p
      )
    }));
    get().calcularResumenObra();
  },

  addPlanillasToSubPartida: (idPartida, idSubPartida, planillas) => {
    set((state) => ({
      partidas: state.partidas.map(p => 
        p.id_partida === idPartida 
          ? {
              ...p,
              subpartidas: p.subpartidas?.map(sp =>
                sp.id_subpartida === idSubPartida
                  ? { ...sp, planillas }
                  : sp
              ) || []
            }
          : p
      )
    }));
    get().calcularResumenObra();
  },

  // ============================================================================
  // RECURSOS
  // ============================================================================
  saveRecursosToPlanilla: (idPartida, idSubPartida, idPlanilla, recursos) => {
    set((state) => ({
      partidas: state.partidas.map(p => {
        if (p.id_partida !== idPartida) return p;

        if (idSubPartida) {
          // Subpartida
          return {
            ...p,
            subpartidas: p.subpartidas?.map(sp =>
              sp.id_subpartida === idSubPartida
                ? {
                    ...sp,
                    planillas: sp.planillas?.map(pl =>
                      pl.id === idPlanilla ? { ...pl, recursos } : pl
                    ) || []
                  }
                : sp
            ) || []
          };
        } else {
          // Partida directa
          return {
            ...p,
            planillas: p.planillas?.map(pl =>
              pl.id === idPlanilla ? { ...pl, recursos } : pl
            ) || []
          };
        }
      })
    }));
    get().calcularResumenObra();
  },

  getRecursosFromPlanilla: (idPartida, idSubPartida, idPlanilla) => {
    const state = get();
    const partida = state.partidas.find(p => p.id_partida === idPartida);
    if (!partida) return [];

    if (idSubPartida) {
      const subpartida = partida.subpartidas?.find(sp => sp.id_subpartida === idSubPartida);
      const planilla = subpartida?.planillas?.find(p => p.id === idPlanilla);
      return planilla?.recursos || [];
    } else {
      const planilla = partida.planillas?.find(p => p.id === idPlanilla);
      return planilla?.recursos || [];
    }
  },

  // ============================================================================
  // INCREMENTOS
  // ============================================================================

  getIncremento: (idPartida: number) => {
    const state = get();
    const incremento = state.incrementos.find(i => i.id_partida === idPartida);
    return incremento;
  },
  
  addIncremento: (incremento) => {
    set((state) => ({ incrementos: [...state.incrementos, incremento] }));
    get().calcularResumenObra();
  },

  updateIncremento: (id, incremento) => {
    set((state) => ({
      incrementos: state.incrementos.map(inc => 
        inc.id_incremento === id ? { ...inc, ...incremento } : inc
      )
    }));
    get().calcularResumenObra();
  },

  removeIncremento: (id) => {
    set((state) => ({
      incrementos: state.incrementos.filter(inc => inc.id_incremento !== id)
    }));
    get().calcularResumenObra();
  },

  // ============================================================================
  // CÁLCULOS
  // ============================================================================
  calcularResumenObra: () => {
    const state = get();
    const calculador = new CalculadorResumen(state.partidas, state.incrementos);
    const resumen = calculador.calcular();
    set({ resumen });
  },

  // ============================================================================
  // STORAGE
  // ============================================================================
  saveToLocalStorage: () => {
    const state = get();
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
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      set({
        obra: data.obra,
        partidas: data.partidas || [],
        incrementos: data.incrementos || [],
        resumen: data.resumen || RESUMEN_INICIAL,
        selectedPartida: data.selectedPartida,
        selectedSubPartida: data.selectedSubPartida,
        selectedPlanilla: data.selectedPlanilla,
        showResumen: data.showResumen || false,
      });
      get().calcularResumenObra();
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  },

  clearLocalStorage: () => {
    localStorage.removeItem('obra_draft');
    set({
      obra: null,
      partidas: [],
      incrementos: [],
      resumen: RESUMEN_INICIAL,
      selectedPartida: null,
      selectedSubPartida: null,
      selectedPlanilla: null,
      showResumen: false,
    });
  },

  // ============================================================================
  // BACKEND SYNC
  // ============================================================================
  finalizarObra: async () => {
    const state = get();
    if (!state.obra?.id_obra) {
      throw new Error('No hay obra para finalizar');
    }

    try {
      const { finalizarObra } = await import('@/actions/obras');
      const obraFinalizada = await finalizarObra(state.obra.id_obra);
      set({ obra: obraFinalizada });
      get().clearLocalStorage();
      return obraFinalizada;
    } catch (error) {
      console.error('Error finalizando obra:', error);
      throw error;
    }
  },
}));