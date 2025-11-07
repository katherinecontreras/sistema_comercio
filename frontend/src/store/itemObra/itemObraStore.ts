import { create } from 'zustand';
import useRecursoBaseStore, { Recurso, PersonalRecurso, EquipoRecurso } from '@/store/recurso/recursoStore';

//INTERFACES
export interface PersonalItemObra {
  id_personal: number;
  funcion: string;
  meses_operario: number;
}

export interface EquipoItemObra {
  id_equipo: number;
  detalle: string;
  meses_operario: number;
}

export interface ItemObra {
    id_item_Obra: number;
    id_obra: number;
    descripcion: string;
    meses_operario?: number;
    capataz?: number;
    costo_total?: number;
    manoObra?: PersonalItemObra[]; // Array de personal (mano de obra)
    equipos?: EquipoItemObra[]; // Array de equipos
}

// STORE DE OBRA BASE
interface ItemObraBaseState {
    itemObra: ItemObra | null;
    itemsObra: ItemObra[];
    itemCreate: boolean;
    itemEdit: boolean;
    loading: boolean;
    error: string | null;
}

interface ItemObraBaseActions {
  // ItemObra CRUD
  getItemSelected: () => ItemObra | null;
  getItemsObra: () => ItemObra[] | null;

  setItemSelected: (itemObras:ItemObra | null) => void
  setItemsObra: (rows: ItemObra[]) => void;
  
  clearItemSelected: () => void;
  clearItemsObra: () => void;
  
  // Estado de 
  setItemCreate: (itemCreate: boolean) => void
  setItemEdit: (itemEdit: boolean) => void
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Utilidades
  isItemObraComplete: () => boolean;
  areAllItemsObraComplete: () => boolean;
  
  // Actualización de meses operario y capataz
  /**
   * Calcula y actualiza los meses_operario de un item basado en la suma de todos los meses operarios
   * de todos los recursos seleccionados para ese item
   */
  updateMesesOperarioFromRecursos: (idItemObra: number) => void;
  
  /**
   * Calcula y actualiza el capataz de un item (meses_operario / 8)
   */
  updateCapatazFromMesesOperario: (idItemObra: number) => void;
  
  /**
   * Calcula y actualiza tanto meses_operario como capataz de un item
   */
  updateMesesOperarioAndCapataz: (idItemObra: number) => void;
  
  /**
   * Actualiza manualmente los meses_operario de un item
   */
  updateMesesOperario: (idItemObra: number, mesesOperario: number) => void;
  
  /**
   * Actualiza manualmente el capataz de un item
   */
  updateCapataz: (idItemObra: number, capataz: number) => void;
  
  // Acumulación de personal y equipos desde recursos
  /**
   * Acumula todos los personal y equipos de todos los recursos del item
   * Si un personal/equipo ya existe (mismo id), suma los meses operarios
   * Si no existe, agrega un nuevo objeto
   */
  accumulatePersonalAndEquiposFromRecursos: (idItemObra: number) => void;
  
  /**
   * Agrega o actualiza un personal en el item (suma meses operarios si ya existe)
   */
  addOrUpdatePersonalInItem: (idItemObra: number, personal: PersonalRecurso) => void;
  
  /**
   * Agrega o actualiza un equipo en el item (suma meses operarios si ya existe)
   */
  addOrUpdateEquipoInItem: (idItemObra: number, equipo: EquipoRecurso) => void;
}

export const useItemObraBaseStore = create<ItemObraBaseState & ItemObraBaseActions>((set, get) => ({
  // ESTADO INICIAL
  itemObra: null,
  itemsObra: [],
  itemCreate: false,
  itemEdit: false,
  loading: false,
  error: null,

  // ACCIONES DE ITEMOBRA
  getItemSelected: () => get().itemObra,
  getItemsObra: () => get().itemsObra,

  setItemSelected: (itemObra) => set({ itemObra, error: null }),
  setItemsObra: (rows) => set({ itemsObra: rows, error: null }),
  
  clearItemsObra: () => set({itemsObra: []}),
  clearItemSelected: () => set({ 
    itemObra: null, 
    loading: false, 
    error: null 
  }),

  // ESTADO DE CARGA
  setItemCreate: (itemCreate) => set({ itemCreate }),
  setItemEdit: (itemEdit) => set({ itemEdit }),
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
  },
  
  // ACTUALIZACIÓN DE MESES OPERARIO Y CAPATAZ
  updateMesesOperarioFromRecursos: (idItemObra: number) => {
    const { getAllRecursosByItemObra } = useRecursoBaseStore.getState();
    const recursos = getAllRecursosByItemObra(idItemObra);
    
    // Calcular la suma de todos los meses operarios SOLO de personal (mano de obra)
    // NO se incluyen los meses operarios de equipos
    let totalMesesOperario = 0;
    
    recursos.forEach((recurso: Recurso) => {
      // Sumar SOLO meses operarios de personal (mano de obra)
      if (recurso.personal && recurso.personal.length > 0) {
        const mesesPersonal = recurso.personal.reduce((sum, p) => sum + (p.meses_operario || 0), 0);
        totalMesesOperario += mesesPersonal;
      }
      // Los equipos NO se incluyen en el cálculo
    });
    
    // Actualizar el item con el total calculado
    get().updateMesesOperario(idItemObra, totalMesesOperario);
  },
  
  updateCapatazFromMesesOperario: (idItemObra: number) => {
    const itemsObra = get().itemsObra;
    const item = itemsObra.find(i => i.id_item_Obra === idItemObra);
    
    if (item && item.meses_operario !== undefined) {
      const capataz = item.meses_operario / 8;
      get().updateCapataz(idItemObra, capataz);
    }
  },
  
  updateMesesOperarioAndCapataz: (idItemObra: number) => {
    // Primero actualizar meses_operario desde recursos
    get().updateMesesOperarioFromRecursos(idItemObra);
    // Luego actualizar capataz basado en meses_operario
    get().updateCapatazFromMesesOperario(idItemObra);
  },
  
  updateMesesOperario: (idItemObra: number, mesesOperario: number) => {
    const itemsObra = get().itemsObra;
    const updatedItems = itemsObra.map(item => 
      item.id_item_Obra === idItemObra
        ? { ...item, meses_operario: mesesOperario }
        : item
    );
    
    // También actualizar el item seleccionado si es el mismo
    const itemObra = get().itemObra;
    const updatedItemObra = itemObra && itemObra.id_item_Obra === idItemObra
      ? { ...itemObra, meses_operario: mesesOperario }
      : itemObra;
    
    set({ 
      itemsObra: updatedItems,
      itemObra: updatedItemObra,
      error: null 
    });
  },
  
  updateCapataz: (idItemObra: number, capataz: number) => {
    const itemsObra = get().itemsObra;
    const updatedItems = itemsObra.map(item => 
      item.id_item_Obra === idItemObra
        ? { ...item, capataz }
        : item
    );
    
    // También actualizar el item seleccionado si es el mismo
    const itemObra = get().itemObra;
    const updatedItemObra = itemObra && itemObra.id_item_Obra === idItemObra
      ? { ...itemObra, capataz }
      : itemObra;
    
    set({ 
      itemsObra: updatedItems,
      itemObra: updatedItemObra,
      error: null 
    });
  },
  
  // ACUMULACIÓN DE PERSONAL Y EQUIPOS
  accumulatePersonalAndEquiposFromRecursos: (idItemObra: number) => {
    const { getAllRecursosByItemObra } = useRecursoBaseStore.getState();
    const recursos = getAllRecursosByItemObra(idItemObra);
    
    // Mapa para acumular personal (por id_personal)
    const personalMap = new Map<number, PersonalItemObra>();
    
    // Mapa para acumular equipos (por id_equipo)
    const equiposMap = new Map<number, EquipoItemObra>();
    
    // Procesar cada recurso y acumular personal y equipos
    recursos.forEach((recurso: Recurso) => {
      // Acumular personal
      if (recurso.personal && recurso.personal.length > 0) {
        recurso.personal.forEach((p: PersonalRecurso) => {
          const existente = personalMap.get(p.id_personal);
          if (existente) {
            // Si ya existe, sumar los meses operarios
            personalMap.set(p.id_personal, {
              ...existente,
              meses_operario: existente.meses_operario + (p.meses_operario || 0)
            });
          } else {
            // Si no existe, agregar nuevo
            personalMap.set(p.id_personal, {
              id_personal: p.id_personal,
              funcion: p.funcion,
              meses_operario: p.meses_operario || 0,
            });
          }
        });
      }
      
      // Acumular equipos
      if (recurso.equipos && recurso.equipos.length > 0) {
        recurso.equipos.forEach((e: EquipoRecurso) => {
          const existente = equiposMap.get(e.id_equipo);
          if (existente) {
            // Si ya existe, sumar los meses operarios
            equiposMap.set(e.id_equipo, {
              ...existente,
              meses_operario: existente.meses_operario + (e.meses_operario || 0)
            });
          } else {
            // Si no existe, agregar nuevo
            equiposMap.set(e.id_equipo, {
              id_equipo: e.id_equipo,
              detalle: e.detalle,
              meses_operario: e.meses_operario || 0,
            });
          }
        });
      }
    });
    
    // Convertir los mapas a arrays y actualizar el item
    const itemsObra = get().itemsObra;
    const updatedItems = itemsObra.map(item => 
      item.id_item_Obra === idItemObra
        ? {
            ...item,
            manoObra: Array.from(personalMap.values()),
            equipos: Array.from(equiposMap.values()),
          }
        : item
    );
    
    // También actualizar el item seleccionado si es el mismo
    const itemObra = get().itemObra;
    const updatedItemObra = itemObra && itemObra.id_item_Obra === idItemObra
      ? {
          ...itemObra,
          manoObra: Array.from(personalMap.values()),
          equipos: Array.from(equiposMap.values()),
        }
      : itemObra;
    
    set({
      itemsObra: updatedItems,
      itemObra: updatedItemObra,
      error: null
    });
  },
  
  addOrUpdatePersonalInItem: (idItemObra: number, personal: PersonalRecurso) => {
    const itemsObra = get().itemsObra;
    const item = itemsObra.find(i => i.id_item_Obra === idItemObra);
    
    if (!item) return;
    
    const manoObraActual = item.manoObra || [];
    const personalExistente = manoObraActual.find(p => p.id_personal === personal.id_personal);
    
    let nuevaManoObra: PersonalItemObra[];
    
    if (personalExistente) {
      // Si ya existe, sumar los meses operarios
      nuevaManoObra = manoObraActual.map(p =>
        p.id_personal === personal.id_personal
          ? { ...p, meses_operario: p.meses_operario + (personal.meses_operario || 0) }
          : p
      );
    } else {
      // Si no existe, agregar nuevo
      nuevaManoObra = [
        ...manoObraActual,
        {
          id_personal: personal.id_personal,
          funcion: personal.funcion,
          meses_operario: personal.meses_operario || 0,
        }
      ];
    }
    
    const updatedItems = itemsObra.map(i =>
      i.id_item_Obra === idItemObra
        ? { ...i, manoObra: nuevaManoObra }
        : i
    );
    
    // También actualizar el item seleccionado si es el mismo
    const itemObra = get().itemObra;
    const updatedItemObra = itemObra && itemObra.id_item_Obra === idItemObra
      ? { ...itemObra, manoObra: nuevaManoObra }
      : itemObra;
    
    set({
      itemsObra: updatedItems,
      itemObra: updatedItemObra,
      error: null
    });
  },
  
  addOrUpdateEquipoInItem: (idItemObra: number, equipo: EquipoRecurso) => {
    const itemsObra = get().itemsObra;
    const item = itemsObra.find(i => i.id_item_Obra === idItemObra);
    
    if (!item) return;
    
    const equiposActuales = item.equipos || [];
    const equipoExistente = equiposActuales.find(e => e.id_equipo === equipo.id_equipo);
    
    let nuevosEquipos: EquipoItemObra[];
    
    if (equipoExistente) {
      // Si ya existe, sumar los meses operarios
      nuevosEquipos = equiposActuales.map(e =>
        e.id_equipo === equipo.id_equipo
          ? { ...e, meses_operario: e.meses_operario + (equipo.meses_operario || 0) }
          : e
      );
    } else {
      // Si no existe, agregar nuevo
      nuevosEquipos = [
        ...equiposActuales,
        {
          id_equipo: equipo.id_equipo,
          detalle: equipo.detalle,
          meses_operario: equipo.meses_operario || 0,
        }
      ];
    }
    
    const updatedItems = itemsObra.map(i =>
      i.id_item_Obra === idItemObra
        ? { ...i, equipos: nuevosEquipos }
        : i
    );
    
    // También actualizar el item seleccionado si es el mismo
    const itemObra = get().itemObra;
    const updatedItemObra = itemObra && itemObra.id_item_Obra === idItemObra
      ? { ...itemObra, equipos: nuevosEquipos }
      : itemObra;
    
    set({
      itemsObra: updatedItems,
      itemObra: updatedItemObra,
      error: null
    });
  },
}));

export default useItemObraBaseStore;


