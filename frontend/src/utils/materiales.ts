// utils.ts - Funciones de utilidad
import { 
  HeaderDraft, 
  CalculoOperation, 
  CalculoValue, 
  ColumnType, 
  BASE_HEADERS, 
  BASE_HEADER_LABEL,
  BaseHeaderId 
} from '@/store/material/types';

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
        parts.push(operation.operator === 'multiplicacion' ? '×' : '÷');
      }
      parts.push(value.headerTitle || '---');
    }
  }
  return parts.join(' ');
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
}