import { create } from 'zustand';

//INTERFACES
export interface PersonalRecurso {
  id_personal: number;
  funcion: string;
  meses_operario: number; // Valor float que agrega el usuario
}

export interface EquipoRecurso {
  id_equipo: number;
  detalle: string;
  meses_operario: number; // Valor float que agrega el usuario
}

export interface Recurso {
  id_recurso: number;
  id_tipo_recurso: number;
  descripcion: string;
  unidad: string;
  cantidad: number;
  meses_operario?: number; // Cambiado de string a number para consistencia
  personal?: PersonalRecurso[]; // Array de personal asociado al recurso
  equipos?: EquipoRecurso[]; // Array de equipos asociado al recurso
}

export interface TipoRecurso {
  id_tipo_recurso: number;
  descripcion: string;
}

// Tipo para almacenar los tipos de recurso asociados a un item
interface TipoRecursoForItem {
  id_item_obra: number;
  id_tipo_recurso: number;
  descripcion: string;
}

// STORE DE RECURSO BASE
interface RecursoBaseState {
  // Recurso y TipoRecurso seleccionados actualmente (para UI)
  recurso: Recurso | null;
  tipoRecurso: TipoRecurso | null;

  // Mapa de id_item_obra -> TipoRecurso[] para mantener los tipos seleccionados por item
  tiposRecursoByItemObra: Record<number, TipoRecursoForItem[]>;

  // Mapa de id_tipo_recurso -> Recurso[] para mantener los recursos seleccionados por tipo
  recursosByTipoRecurso: Record<number, Recurso[]>;

  loading: boolean;
  error: string | null;
}

interface RecursoBaseActions {
  // ===== TIPOS DE RECURSO POR ITEM =====
  
  /**
   * Obtiene los tipos de recurso seleccionados para un item específico
   */
  getTiposRecursoByItemObra: (idItemObra: number) => TipoRecursoForItem[];
  
  /**
   * Agrega un tipo de recurso a un item específico (si no existe ya)
   */
  addTipoRecursoToItemObra: (idItemObra: number, tipoRecurso: TipoRecurso) => void;
  
  /**
   * Remueve un tipo de recurso de un item específico
   */
  removeTipoRecursoFromItemObra: (idItemObra: number, idTipoRecurso: number) => void;
  
  /**
   * Verifica si un tipo de recurso está asociado a un item
   */
  hasTipoRecursoInItemObra: (idItemObra: number, idTipoRecurso: number) => boolean;
  
  /**
   * Limpia todos los tipos de recurso de un item específico
   */
  clearTiposRecursoFromItemObra: (idItemObra: number) => void;

  // ===== RECURSOS POR TIPO DE RECURSO =====
  
  /**
   * Obtiene los recursos seleccionados para un tipo de recurso específico
   */
  getRecursosByTipoRecurso: (idTipoRecurso: number) => Recurso[];
  
  /**
   * Agrega un recurso a un tipo de recurso específico (si no existe ya)
   */
  addRecursoToTipoRecurso: (idTipoRecurso: number, recurso: Recurso) => void;
  
  /**
   * Remueve un recurso de un tipo de recurso específico
   */
  removeRecursoFromTipoRecurso: (idTipoRecurso: number, idRecurso: number) => void;
  
  /**
   * Actualiza un recurso existente en un tipo de recurso específico
   */
  updateRecursoInTipoRecurso: (idTipoRecurso: number, recurso: Recurso) => void;
  
  /**
   * Verifica si un recurso está asociado a un tipo de recurso
   */
  hasRecursoInTipoRecurso: (idTipoRecurso: number, idRecurso: number) => boolean;
  
  /**
   * Limpia todos los recursos de un tipo de recurso específico
   */
  clearRecursosFromTipoRecurso: (idTipoRecurso: number) => void;

  // ===== RECURSOS DE UN ITEM (obtiene todos los recursos de todos los tipos asociados al item) =====
  
  /**
   * Obtiene todos los recursos asociados a un item (a través de sus tipos de recurso)
   */
  getAllRecursosByItemObra: (idItemObra: number) => Recurso[];

  // ===== SELECCIÓN ACTUAL (para UI) =====
  
  /**
   * Obtiene el recurso actualmente seleccionado
   */
  getRecursoSelected: () => Recurso | null;
  
  /**
   * Obtiene el tipo de recurso actualmente seleccionado
   */
  getTipoRecursoSelected: () => TipoRecurso | null;
  
  /**
   * Establece el recurso actualmente seleccionado
   */
  setRecursoSelected: (recurso: Recurso | null) => void;
  
  /**
   * Establece el tipo de recurso actualmente seleccionado
   */
  setTipoRecursoSelected: (tipoRecurso: TipoRecurso | null) => void;

  // ===== LIMPIEZA =====
  
  /**
   * Limpia el recurso seleccionado
   */
  clearRecurso: () => void;
  
  /**
   * Limpia el tipo de recurso seleccionado
   */
  clearTipoRecurso: () => void;
  
  /**
   * Limpia todos los datos de un item específico (tipos y recursos)
   */
  clearAllDataFromItemObra: (idItemObra: number) => void;
  
  /**
   * Limpia todo el store
   */
  clearAll: () => void;

  // ===== ESTADO DE CARGA =====
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // ===== PERSONAL POR RECURSO =====
  
  /**
   * Agrega un personal a un recurso específico (si no existe ya)
   */
  addPersonalToRecurso: (idTipoRecurso: number, idRecurso: number, personal: PersonalRecurso) => void;
  
  /**
   * Remueve un personal de un recurso específico
   */
  removePersonalFromRecurso: (idTipoRecurso: number, idRecurso: number, idPersonal: number) => void;
  
  /**
   * Actualiza los meses_operario de un personal en un recurso específico
   */
  updatePersonalMesesOperario: (idTipoRecurso: number, idRecurso: number, idPersonal: number, mesesOperario: number) => void;
  
  /**
   * Obtiene el array de personal de un recurso específico
   */
  getPersonalFromRecurso: (idTipoRecurso: number, idRecurso: number) => PersonalRecurso[];
  
  /**
   * Verifica si un personal está asociado a un recurso
   */
  hasPersonalInRecurso: (idTipoRecurso: number, idRecurso: number, idPersonal: number) => boolean;

  // ===== EQUIPOS POR RECURSO =====
  
  /**
   * Agrega un equipo a un recurso específico (si no existe ya)
   */
  addEquipoToRecurso: (idTipoRecurso: number, idRecurso: number, equipo: EquipoRecurso) => void;
  
  /**
   * Remueve un equipo de un recurso específico
   */
  removeEquipoFromRecurso: (idTipoRecurso: number, idRecurso: number, idEquipo: number) => void;
  
  /**
   * Actualiza los meses_operario de un equipo en un recurso específico
   */
  updateEquipoMesesOperario: (idTipoRecurso: number, idRecurso: number, idEquipo: number, mesesOperario: number) => void;
  
  /**
   * Obtiene el array de equipos de un recurso específico
   */
  getEquiposFromRecurso: (idTipoRecurso: number, idRecurso: number) => EquipoRecurso[];
  
  /**
   * Verifica si un equipo está asociado a un recurso
   */
  hasEquipoInRecurso: (idTipoRecurso: number, idRecurso: number, idEquipo: number) => boolean;

  // ===== UTILIDADES =====
  
  /**
   * Verifica si un recurso está completo (tiene meses_operario)
   */
  isRecursoComplete: (recurso: Recurso) => boolean;
  
  /**
   * Verifica si todos los recursos de un tipo están completos
   */
  areAllRecursosCompleteByTipo: (idTipoRecurso: number) => boolean;
  
  /**
   * Verifica si todos los recursos de un item están completos
   */
  areAllRecursosCompleteByItem: (idItemObra: number) => boolean;
}

export const useRecursoBaseStore = create<RecursoBaseState & RecursoBaseActions>((set, get) => ({
  // ESTADO INICIAL
  recurso: null,
  tipoRecurso: null,
  tiposRecursoByItemObra: {},
  recursosByTipoRecurso: {},
  loading: false,
  error: null,

  // ===== TIPOS DE RECURSO POR ITEM =====
  
  getTiposRecursoByItemObra: (idItemObra: number) => {
    return get().tiposRecursoByItemObra[idItemObra] || [];
  },

  addTipoRecursoToItemObra: (idItemObra: number, tipoRecurso: TipoRecurso) => {
    const current = get().tiposRecursoByItemObra[idItemObra] || [];
    
    // Verificar si ya existe
    const exists = current.some(t => t.id_tipo_recurso === tipoRecurso.id_tipo_recurso);
    if (exists) return;
    
    const newTipo: TipoRecursoForItem = {
      id_item_obra: idItemObra,
      id_tipo_recurso: tipoRecurso.id_tipo_recurso,
      descripcion: tipoRecurso.descripcion,
    };
    
    set({
      tiposRecursoByItemObra: {
        ...get().tiposRecursoByItemObra,
        [idItemObra]: [...current, newTipo],
      },
      error: null,
    });
  },

  removeTipoRecursoFromItemObra: (idItemObra: number, idTipoRecurso: number) => {
    const current = get().tiposRecursoByItemObra[idItemObra] || [];
    const filtered = current.filter(t => t.id_tipo_recurso !== idTipoRecurso);
    
    set({
      tiposRecursoByItemObra: {
        ...get().tiposRecursoByItemObra,
        [idItemObra]: filtered,
      },
      error: null,
    });
    
    // También limpiar los recursos asociados a este tipo cuando se remueve del item
    get().clearRecursosFromTipoRecurso(idTipoRecurso);
  },

  hasTipoRecursoInItemObra: (idItemObra: number, idTipoRecurso: number) => {
    const current = get().tiposRecursoByItemObra[idItemObra] || [];
    return current.some(t => t.id_tipo_recurso === idTipoRecurso);
  },

  clearTiposRecursoFromItemObra: (idItemObra: number) => {
    const tipos = get().tiposRecursoByItemObra[idItemObra] || [];
    
    // Limpiar también los recursos asociados a cada tipo
    tipos.forEach(tipo => {
      get().clearRecursosFromTipoRecurso(tipo.id_tipo_recurso);
    });
    
    const { [idItemObra]: _, ...rest } = get().tiposRecursoByItemObra;
    set({
      tiposRecursoByItemObra: rest,
      error: null,
    });
  },

  // ===== RECURSOS POR TIPO DE RECURSO =====
  
  getRecursosByTipoRecurso: (idTipoRecurso: number) => {
    return get().recursosByTipoRecurso[idTipoRecurso] || [];
  },

  addRecursoToTipoRecurso: (idTipoRecurso: number, recurso: Recurso) => {
    const current = get().recursosByTipoRecurso[idTipoRecurso] || [];
    
    // Verificar si ya existe
    const exists = current.some(r => r.id_recurso === recurso.id_recurso);
    if (exists) return;
    
    set({
      recursosByTipoRecurso: {
        ...get().recursosByTipoRecurso,
        [idTipoRecurso]: [...current, recurso],
      },
      error: null,
    });
  },

  removeRecursoFromTipoRecurso: (idTipoRecurso: number, idRecurso: number) => {
    const current = get().recursosByTipoRecurso[idTipoRecurso] || [];
    const filtered = current.filter(r => r.id_recurso !== idRecurso);
    
    set({
      recursosByTipoRecurso: {
        ...get().recursosByTipoRecurso,
        [idTipoRecurso]: filtered,
      },
      error: null,
    });
  },

  updateRecursoInTipoRecurso: (idTipoRecurso: number, recurso: Recurso) => {
    const current = get().recursosByTipoRecurso[idTipoRecurso] || [];
    const updated = current.map(r => 
      r.id_recurso === recurso.id_recurso ? recurso : r
    );
    
    set({
      recursosByTipoRecurso: {
        ...get().recursosByTipoRecurso,
        [idTipoRecurso]: updated,
      },
      error: null,
    });
  },

  hasRecursoInTipoRecurso: (idTipoRecurso: number, idRecurso: number) => {
    const current = get().recursosByTipoRecurso[idTipoRecurso] || [];
    return current.some(r => r.id_recurso === idRecurso);
  },

  clearRecursosFromTipoRecurso: (idTipoRecurso: number) => {
    const { [idTipoRecurso]: _, ...rest } = get().recursosByTipoRecurso;
    set({
      recursosByTipoRecurso: rest,
      error: null,
    });
  },

  // ===== RECURSOS DE UN ITEM =====
  
  getAllRecursosByItemObra: (idItemObra: number) => {
    const tipos = get().tiposRecursoByItemObra[idItemObra] || [];
    const allRecursos: Recurso[] = [];
    
    tipos.forEach(tipo => {
      const recursos = get().recursosByTipoRecurso[tipo.id_tipo_recurso] || [];
      allRecursos.push(...recursos);
    });
    
    return allRecursos;
  },

  // ===== SELECCIÓN ACTUAL (para UI) =====
  
  getRecursoSelected: () => get().recurso,
  
  getTipoRecursoSelected: () => get().tipoRecurso,
  
  setRecursoSelected: (recurso) => set({ recurso, error: null }),
  
  setTipoRecursoSelected: (tipoRecurso) => set({ tipoRecurso, error: null }),

  // ===== LIMPIEZA =====
  
  clearRecurso: () => set({ 
    recurso: null, 
    loading: false, 
    error: null 
  }),
  
  clearTipoRecurso: () => set({ 
    tipoRecurso: null, 
    loading: false, 
    error: null 
  }),
  
  clearAllDataFromItemObra: (idItemObra: number) => {
    get().clearTiposRecursoFromItemObra(idItemObra);
    set({ error: null });
  },
  
  clearAll: () => set({
    recurso: null,
    tipoRecurso: null,
    tiposRecursoByItemObra: {},
    recursosByTipoRecurso: {},
    loading: false,
    error: null,
  }),

  // ===== ESTADO DE CARGA =====
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  clearError: () => set({ error: null }),

  // ===== UTILIDADES =====
  
  isRecursoComplete: (recurso: Recurso) => {
    return !!(recurso?.meses_operario);
  },
  
  areAllRecursosCompleteByTipo: (idTipoRecurso: number) => {
    const recursos = get().recursosByTipoRecurso[idTipoRecurso] || [];
    return recursos.every(r => get().isRecursoComplete(r));
  },
  
  areAllRecursosCompleteByItem: (idItemObra: number) => {
    const recursos = get().getAllRecursosByItemObra(idItemObra);
    return recursos.every(r => get().isRecursoComplete(r));
  },
}));

export default useRecursoBaseStore;
