// utils.ts - Funciones de utilidad
import {
  HeaderDraft,
  CalculoOperation,
  CalculoValue,
  ColumnType,
  BASE_HEADERS,
  BASE_HEADER_LABEL,
  BaseHeaderId,
  OperatorType,
} from '@/store/material/types';
import { TipoMaterial } from '@/store/material/materialStore';

export const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const createPlaceholderValue = (tipo: ColumnType = 'base'): CalculoValue => ({
  id: createId(),
  headerRef: null,
  headerTitle: '',
  tipo,
});

export const normalizeHeaders = (headers: HeaderDraft[]): HeaderDraft[] =>
  headers
    .map((header) => ({
      ...header,
      calculoOperations: header.calculoOperations.map((operation) => ({
        operator: operation.operator,
        values: operation.values.map((value) => ({
          ...value,
          headerRef: value.headerRef ?? null,
        })),
      })),
    }))
    .sort((a, b) => a.order - b.order);

export const getHeaderTitle = (header: HeaderDraft): string => {
  if (header.title.trim()) return header.title;
  if (header.isBaseHeader && header.baseHeaderId) {
    return BASE_HEADER_LABEL.get(header.baseHeaderId) ?? 'Header base';
  }
  return 'Header';
};

export const getBaseOrder = (baseId: BaseHeaderId) =>
  BASE_HEADERS.find((item) => item.id === baseId)?.order ?? 100;

export const cloneHeaderDraft = (header: HeaderDraft): HeaderDraft => ({
  ...header,
  calculoOperations: header.calculoOperations.map((operation) => ({
    operator: operation.operator,
    values: operation.values.map((value) => ({ ...value })),
  })),
});

export const OPERATOR_LABEL_MAP: Record<OperatorType, string> = {
  multiplicacion: 'multiplicación',
  division: 'división',
  suma: 'suma',
  resta: 'resta',
};

export const OPERATOR_SYMBOL_MAP: Record<OperatorType, string> = {
  multiplicacion: '×',
  division: '/',
  suma: '+',
  resta: '-',
};

const BASE_HEADER_PROPS: Record<
  number,
  {
    isEditable: boolean;
    isCantidad: boolean;
    isQuantityDefined: boolean;
    showQuantityQuestion: boolean;
  }
> = {
  1: { isEditable: false, isCantidad: false, isQuantityDefined: true, showQuantityQuestion: false },
  2: { isEditable: true, isCantidad: true, isQuantityDefined: true, showQuantityQuestion: false },
  3: { isEditable: true, isCantidad: false, isQuantityDefined: true, showQuantityQuestion: false },
  4: { isEditable: false, isCantidad: false, isQuantityDefined: true, showQuantityQuestion: false },
  5: { isEditable: false, isCantidad: false, isQuantityDefined: true, showQuantityQuestion: false },
};

export const headerSupportsCalculation = (header: HeaderDraft): boolean => {
  if (header.isBaseHeader) {
    if (header.baseHeaderId === 5) {
      return true;
    }
    if (header.baseHeaderId === 2) {
      return header.isQuantityDefined && header.isCantidad;
    }
    return false;
  }

  if (header.calculoOperations.length > 0) {
    return true;
  }

  return header.isQuantityDefined && header.isCantidad;
};

export const headerIsSelectableForCalculation = (header: HeaderDraft): boolean => {
  if (header.calculoOperations.length > 0) {
    return true;
  }

  if (header.isBaseHeader) {
    if (!header.baseHeaderId) {
      return false;
    }
    if (header.baseHeaderId === 4) {
      return true;
    }
    if (header.baseHeaderId === 2) {
      return header.isQuantityDefined && header.isCantidad;
    }
    return false;
  }

  return header.isQuantityDefined && header.isCantidad;
};

export const formatExpression = (operations: CalculoOperation[]) => {
  const parts: string[] = [];
  for (const operation of operations) {
    for (const value of operation.values) {
      if (parts.length > 0) {
        parts.push(OPERATOR_SYMBOL_MAP[operation.operator]);
      }
      parts.push(value.headerTitle || '---');
    }
  }
  return parts.join(' ');
};

export const buildDraftHeadersFromTipo = (tipo: TipoMaterial): HeaderDraft[] => {
  type DraftEntry = {
    header: HeaderDraft;
    calculo: TipoMaterial['headers_base'][number]['calculo'] | null;
    type: 'base' | 'atribute';
    sourceId: number;
  };

  const entries: DraftEntry[] = [];
  const requiredBaseIds = new Set<number>([1, 4, 5]);
  const resolveBaseTitle = (baseId: number) => BASE_HEADER_LABEL.get(baseId) ?? 'Header base';
  const orderMap = new Map<string, number>();

  (tipo.order_headers || []).forEach((entry) => {
    const rawType = entry.type || 'base';
    const normalizedType = rawType.toLowerCase().startsWith('atr') ? 'atribute' : 'base';
    orderMap.set(`${normalizedType}-${entry.id}`, entry.order);
  });

  const sortedBaseHeaders = (tipo.headers_base || [])
    .map((header, index) => {
      const key = `base-${header.id_header_base}`;
      const resolvedOrder = orderMap.get(key) ?? header.order ?? (header.id_header_base === 5 ? 999 : index + 1);
      return {
        ...header,
        order: resolvedOrder,
      };
    })
    .filter((header) => (header.active ?? true) || requiredBaseIds.has(header.id_header_base))
    .sort((a, b) => a.order - b.order);

  sortedBaseHeaders.forEach((baseHeader) => {
    const baseId = baseHeader.id_header_base;
    const props = BASE_HEADER_PROPS[baseId] ?? {
      isEditable: true,
      isCantidad: false,
      isQuantityDefined: true,
      showQuantityQuestion: false,
    };

    const title = (baseHeader.titulo || resolveBaseTitle(baseId)).trim() || resolveBaseTitle(baseId);

    const header: HeaderDraft = {
      id: `base-${baseId}`,
      title,
      isEditable: props.isEditable,
      isBaseHeader: true,
      baseHeaderId: baseId,
      isCantidad: props.isCantidad,
      isQuantityDefined: props.isQuantityDefined,
      showQuantityQuestion: props.showQuantityQuestion,
      calculoOperations: [],
      order: baseHeader.order,
    };

    entries.push({
      header,
      calculo: baseHeader.calculo,
      type: 'base',
      sourceId: baseId,
    });
  });

  const sortedAttributeHeaders = (tipo.headers_atributes || [])
    .map((header, index) => {
      const key = `atribute-${header.id_header_atribute}`;
      const resolvedOrder = orderMap.get(key) ?? header.order ?? index + 1;
      return {
        ...header,
        order: resolvedOrder,
      };
    })
    .sort((a, b) => a.order - b.order);

  sortedAttributeHeaders.forEach((attr) => {
    const title = (attr.titulo || 'Header').trim() || 'Header';

    const header: HeaderDraft = {
      id: `attr-${attr.id_header_atribute}`,
      title,
      isEditable: true,
      isBaseHeader: false,
      isCantidad: attr.isCantidad,
      isQuantityDefined: true,
      showQuantityQuestion: false,
      calculoOperations: [],
      order: attr.order,
    };

    entries.push({
      header,
      calculo: attr.calculo,
      type: 'atribute',
      sourceId: attr.id_header_atribute,
    });
  });

  const resolver = (type: 'base' | 'atribute', sourceId: number) => {
    const entry = entries.find((item) => item.type === type && item.sourceId === sourceId);
    if (!entry) return null;
    const fallbackTitle = type === 'base' ? resolveBaseTitle(sourceId) : 'Header';
    return {
      headerId: entry.header.id,
      titulo: entry.header.title || fallbackTitle,
    };
  };

  const validOperators: OperatorType[] = ['multiplicacion', 'division', 'suma', 'resta'];

  const convertOperations = (
    calculo: TipoMaterial['headers_base'][number]['calculo'] | null,
  ): CalculoOperation[] => {
    if (!calculo || !calculo.activo) {
      return [];
    }

    const operaciones = calculo.operaciones || [];

    return operaciones
      .map((operacion) => {
        const rawOperator = (operacion.tipo || 'multiplicacion').toLowerCase() as OperatorType;
        if (!validOperators.includes(rawOperator)) {
          return null;
        }

        const values: CalculoValue[] = [];

        (operacion.headers_base || []).forEach((baseId) => {
          const resolved = resolver('base', baseId);
          if (resolved) {
            values.push({
              id: createId(),
              headerRef: resolved.headerId,
              headerTitle: resolved.titulo,
              tipo: 'base',
            });
          }
        });

        (operacion.headers_atributes || []).forEach((attrId) => {
          const resolved = resolver('atribute', attrId);
          if (resolved) {
            values.push({
              id: createId(),
              headerRef: resolved.headerId,
              headerTitle: resolved.titulo,
              tipo: 'atribute',
            });
          }
        });

        if (!values.length) {
          return null;
        }

        return {
          operator: rawOperator,
          values,
        } as CalculoOperation;
      })
      .filter((operation): operation is CalculoOperation => operation !== null);
  };

  entries.forEach((entry) => {
    entry.header.calculoOperations = convertOperations(entry.calculo);
  });

  return entries
    .map((entry) => entry.header)
    .sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
};

export default {
  createId,
  createPlaceholderValue,
  normalizeHeaders,
  getHeaderTitle,
  getBaseOrder,
  cloneHeaderDraft,
  headerSupportsCalculation,
  headerIsSelectableForCalculation,
  formatExpression,
  OPERATOR_LABEL_MAP,
  OPERATOR_SYMBOL_MAP,
};