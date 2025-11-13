// initialState.ts - Estado inicial de headers
import { HeaderDraft, OperatorType, ColumnType } from './types';
import { createId } from '@/utils/materiales';

export const createInitialHeaders = (): HeaderDraft[] => [
  {
    id: 'base-1',
    title: 'Detalle',
    isEditable: false,
    isBaseHeader: true,
    baseHeaderId: 1,
    isCantidad: false,
    isQuantityDefined: true,
    showQuantityQuestion: false,
    calculoOperations: [],
    order: 1,
  },
  {
    id: 'base-3',
    title: 'Unidad',
    isEditable: true,
    isBaseHeader: true,
    baseHeaderId: 3,
    isCantidad: false,
    isQuantityDefined: true,
    showQuantityQuestion: false,
    calculoOperations: [],
    order: 2,
  },
  {
    id: 'base-2',
    title: 'Cantidad',
    isEditable: true,
    isBaseHeader: true,
    baseHeaderId: 2,
    isCantidad: true,
    isQuantityDefined: true,
    showQuantityQuestion: false,
    calculoOperations: [],
    order: 3,
  },
  {
    id: 'base-4',
    title: '$Unitario',
    isEditable: false,
    isBaseHeader: true,
    baseHeaderId: 4,
    isCantidad: false,
    isQuantityDefined: true,
    showQuantityQuestion: false,
    calculoOperations: [],
    order: 4,
  },
  {
    id: 'base-5',
    title: '$Total',
    isEditable: false,
    isBaseHeader: true,
    baseHeaderId: 5,
    isCantidad: false,
    isQuantityDefined: true,
    showQuantityQuestion: false,
    calculoOperations: [
      {
        operator: 'multiplicacion' as OperatorType,
        values: [
          { id: createId(), headerRef: 'base-2', headerTitle: 'Cantidad', tipo: 'base' as ColumnType },
          { id: createId(), headerRef: 'base-4', headerTitle: '$Unitario', tipo: 'base' as ColumnType },
        ],
      },
    ],
    order: 999,
  },
];

export default createInitialHeaders