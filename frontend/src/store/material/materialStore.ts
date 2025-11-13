import { create } from 'zustand';

export interface CalculoOperacion {
  tipo: 'multiplicacion' | 'division';
  headers_base?: number[] | null;
  headers_atributes?: number[] | null;
}

export interface Calculo {
  activo: boolean;
  isMultiple: boolean;
  operaciones: CalculoOperacion[];
}

export interface HeaderBase {
  id_header_base: number;
  titulo: string;
  active: boolean;
  calculo: Calculo;
}

export interface HeaderAtributo {
  id_header_atribute: number;
  titulo: string;
  isCantidad: boolean;
  calculo: Calculo;
  total_costo_header: number;
}

export interface TotalCantidad {
  typeOfHeader: 'base' | 'atribute';
  idHeader: number;
  total: number;
}

export interface TipoMaterial {
  id_tipo_material: number;
  titulo: string;
  total_costo_unitario: number;
  total_costo_total: number;
  total_cantidad: TotalCantidad[];
  headers_base: HeaderBase[];
  headers_atributes: HeaderAtributo[] | null;
}

export interface MaterialAtributo {
  id_header_atribute: number;
  value: string;
}

export interface Material {
  id_material: number;
  id_tipo_material: number;
  detalle: string;
  unidad: string | null;
  cantidad: string | null;
  costo_unitario: number;
  costo_total: number;
  atributos: MaterialAtributo[] | null;
}

type DraftFieldKey = 'detalle' | 'cantidad' | 'unidad' | 'costo_unitario' | 'costo_total';

export interface MaterialDraft {
  detalle: string;
  cantidad: string;
  unidad: string;
  costo_unitario: string;
  costo_total: string;
  atributos: Record<number, string>;
}

const BASE_TITLE_FIELD_MAP: Record<string, DraftFieldKey | null> = {
  detalle: 'detalle',
  cantidad: 'cantidad',
  unidad: 'unidad',
  '$unitario': 'costo_unitario',
  '$total': 'costo_total',
};

const parseNumeric = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const normalized = trimmed.replace(',', '.');
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) return '0';
  return value.toString();
};

const createEmptyDraft = (tipo?: TipoMaterial | null): MaterialDraft => {
  const atributos: Record<number, string> = {};
  (tipo?.headers_atributes || []).forEach((header) => {
    atributos[header.id_header_atribute] = '';
  });

  return {
    detalle: '',
    cantidad: '',
    unidad: '',
    costo_unitario: '',
    costo_total: '',
    atributos,
  };
};

const recalculateDraftForTipo = (draft: MaterialDraft, tipo?: TipoMaterial | null): MaterialDraft => {
  if (!tipo) return draft;

  const updated: MaterialDraft = {
    ...draft,
    atributos: { ...draft.atributos },
  };

  const baseMap = new Map(tipo.headers_base.map((header) => [header.id_header_base, header]));
  const attrMap = new Map((tipo.headers_atributes || []).map((header) => [header.id_header_atribute, header]));

  const resolveBaseValue = (baseId: number): number | null => {
    const header = baseMap.get(baseId);
    if (!header) return null;
    const titulo = header.titulo.trim().toLowerCase();
    const field = BASE_TITLE_FIELD_MAP[titulo];
    if (!field) return null;
    const rawValue = updated[field];
    return parseNumeric(rawValue);
  };

  const resolveAttributeValue = (attrId: number): number | null => {
    if (!(attrId in updated.atributos)) return null;
    return parseNumeric(updated.atributos[attrId]);
  };

  const computeOperacion = (operacion: CalculoOperacion): number | null => {
    const baseIds = operacion.headers_base || [];
    const attrIds = operacion.headers_atributes || [];

    const values: number[] = [];

    baseIds.forEach((baseId) => {
      const value = resolveBaseValue(baseId);
      if (value !== null) values.push(value);
    });

    attrIds.forEach((attrId) => {
      const value = resolveAttributeValue(attrId);
      if (value !== null) values.push(value);
    });

    if (values.length === 0) return null;

    return values.reduce((acc, val) => acc * val, 1);
  };

  const computeCalculo = (calculo: Calculo): number | null => {
    if (!calculo?.activo) return null;
    const operaciones = calculo.isMultiple ? calculo.operaciones : calculo.operaciones.slice(0, 1);
    if (!operaciones.length) return null;

    let resultado: number | null = null;
    for (const operacion of operaciones) {
      const valor = computeOperacion(operacion);
      if (valor === null) {
        continue;
      }

      if (resultado === null) {
        if (operacion.tipo === 'division') {
          if (valor === 0) {
            return null;
          }
          resultado = 1 / valor;
        } else {
          resultado = valor;
        }
        continue;
      }

      if (operacion.tipo === 'division') {
        if (valor === 0) {
          return null;
        }
        resultado /= valor;
      } else {
        resultado *= valor;
      }
    }

    return resultado;
  };

  // Primero recalcular atributos
  attrMap.forEach((header, attrId) => {
    const resultado = computeCalculo(header.calculo);
    if (resultado !== null && Number.isFinite(resultado)) {
      updated.atributos[attrId] = formatNumber(resultado);
    }
  });

  baseMap.forEach((header) => {
    const resultado = computeCalculo(header.calculo);
    if (resultado === null || !Number.isFinite(resultado)) return;
    const titulo = header.titulo.trim().toLowerCase();
    const field = BASE_TITLE_FIELD_MAP[titulo];
    if (!field) return;
    updated[field] = formatNumber(resultado);
  });

  return updated;
};

interface MaterialStoreState {
  tipos: TipoMaterial[];
  materiales: Material[];
  selectedTipoId: number | null;
  draft: MaterialDraft;
  loading: boolean;
  error: string | null;

  setTipos: (tipos: TipoMaterial[]) => void;
  setMateriales: (materiales: Material[]) => void;
  addMaterial: (material: Material) => void;
  updateMaterial: (material: Material) => void;
  removeMaterial: (id_material: number) => void;
  selectTipo: (id_tipo_material: number | null) => void;
  resetDraft: () => void;
  updateDraftField: (field: DraftFieldKey, value: string) => void;
  updateDraftAtributo: (id_header_atribute: number, value: string) => void;
  recalculateDraft: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMaterialStore = create<MaterialStoreState>((set) => ({
  tipos: [],
  materiales: [],
  selectedTipoId: null,
  draft: createEmptyDraft(null),
  loading: false,
  error: null,

  setTipos: (tipos) =>
    set((state) => {
      const nextSelected =
        state.selectedTipoId !== null && tipos.some((t) => t.id_tipo_material === state.selectedTipoId)
          ? state.selectedTipoId
          : tipos[0]?.id_tipo_material ?? null;

      const selectedTipo = tipos.find((t) => t.id_tipo_material === nextSelected) ?? null;

      return {
        tipos,
        selectedTipoId: nextSelected,
        draft: recalculateDraftForTipo(createEmptyDraft(selectedTipo), selectedTipo),
      };
    }),

  setMateriales: (materiales) => set({ materiales }),

  addMaterial: (material) =>
    set((state) => ({
      materiales: [material, ...state.materiales.filter((item) => item.id_material !== material.id_material)],
    })),

  updateMaterial: (material) =>
    set((state) => ({
      materiales: state.materiales.map((item) => (item.id_material === material.id_material ? material : item)),
    })),

  removeMaterial: (id_material) =>
    set((state) => ({
      materiales: state.materiales.filter((item) => item.id_material !== id_material),
    })),

  selectTipo: (id_tipo_material) =>
    set((state) => {
      const selectedTipo = state.tipos.find((t) => t.id_tipo_material === id_tipo_material) ?? null;
      return {
        selectedTipoId: id_tipo_material,
        draft: recalculateDraftForTipo(createEmptyDraft(selectedTipo), selectedTipo),
      };
    }),

  resetDraft: () =>
    set((state) => {
      const selectedTipo = state.tipos.find((t) => t.id_tipo_material === state.selectedTipoId) ?? null;
      return {
        draft: recalculateDraftForTipo(createEmptyDraft(selectedTipo), selectedTipo),
      };
    }),

  updateDraftField: (field, value) =>
    set((state) => {
      const selectedTipo = state.tipos.find((t) => t.id_tipo_material === state.selectedTipoId) ?? null;
      const nextDraft = recalculateDraftForTipo(
        {
          ...state.draft,
          [field]: value,
        } as MaterialDraft,
        selectedTipo,
      );
      return { draft: nextDraft };
    }),

  updateDraftAtributo: (id_header_atribute, value) =>
    set((state) => {
      const selectedTipo = state.tipos.find((t) => t.id_tipo_material === state.selectedTipoId) ?? null;
      const nextDraft = recalculateDraftForTipo(
        {
          ...state.draft,
          atributos: {
            ...state.draft.atributos,
            [id_header_atribute]: value,
          },
        },
        selectedTipo,
      );
      return { draft: nextDraft };
    }),

  recalculateDraft: () =>
    set((state) => {
      const selectedTipo = state.tipos.find((t) => t.id_tipo_material === state.selectedTipoId) ?? null;
      return {
        draft: recalculateDraftForTipo(state.draft, selectedTipo),
      };
    }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),
}));

export default useMaterialStore;


