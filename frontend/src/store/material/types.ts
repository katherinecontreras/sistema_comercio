// types.ts - Tipos compartidos del módulo
export type OperatorType = 'multiplicacion' | 'division' | 'suma' | 'resta';
export type ColumnType = 'base' | 'atribute';

export interface CalculoValue {
  id: string;
  headerRef: string | null;
  headerTitle: string;
  tipo: ColumnType;
}

export interface CalculoOperation {
  operator: OperatorType;
  values: CalculoValue[];
}

export interface HeaderDraft {
  id: string;
  title: string;
  isEditable: boolean;
  isBaseHeader: boolean;
  baseHeaderId?: number;
  isCantidad: boolean;
  isQuantityDefined: boolean;
  showQuantityQuestion: boolean;
  calculoOperations: CalculoOperation[];
  order: number;
}

export interface SelectionState {
  targetHeaderId: string;
  operationIndex: number;
  valueIndex: number;
  excludeHeaders: Set<string>;
}

export interface SelectionBackup {
  headerId: string;
  backup: HeaderDraft;
}

export const BASE_HEADERS = [
  { id: 1, label: 'Detalle', optional: false, order: 1 },
  { id: 2, label: 'Cantidad', optional: true, order: 2 },
  { id: 3, label: 'Unidad', optional: true, order: 3 },
  { id: 4, label: '$Unitario', optional: false, order: 4 },
  { id: 5, label: '$Total', optional: false, order: 999 },
] as const;

export type BaseHeaderId = (typeof BASE_HEADERS)[number]['id'];

export const BASE_HEADER_LABEL = new Map<number, string>(
  BASE_HEADERS.map((item) => [item.id, item.label])
);

export default BaseHeaderId 