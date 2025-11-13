// page.tsx - Componente Principal con Animaciones Mejoradas
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Boxes, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { createTipoMaterial } from '@/actions/materiales';
import { HeaderHome } from '@/components';
import { Button } from '@/components/ui/button';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { useMaterialStore } from '@/store/material/materialStore';
import { HeaderSelectionBar } from '@/components/forms/HeaderSelectionBar';
import { DraftTableView } from '@/components/tables/DraftTableView';
import { AyudaMesage } from '@/components/notifications/AyudaMesage';
import { cn } from '@/lib/utils';

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

type OperatorType = 'multiplicacion' | 'division';
type ColumnType = 'base' | 'atribute';

interface CalculoValue {
  id: string;
  headerRef: string | null;
  headerTitle: string;
  tipo: ColumnType;
}

interface CalculoOperation {
  operator: OperatorType;
  values: CalculoValue[];
}

interface HeaderDraft {
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

interface SelectionState {
  targetHeaderId: string;
  operationIndex: number;
  valueIndex: number;
  excludeHeaders: Set<string>;
}

interface SelectionBackup {
  headerId: string;
  backup: HeaderDraft;
}

const BASE_HEADERS = [
  { id: 1, label: 'Detalle', optional: false, order: 1 },
  { id: 2, label: 'Cantidad', optional: true, order: 2 },
  { id: 3, label: 'Unidad', optional: true, order: 3 },
  { id: 4, label: '$Unitario', optional: false, order: 4 },
  { id: 5, label: '$Total', optional: false, order: 999 },
] as const;

type BaseHeaderId = (typeof BASE_HEADERS)[number]['id'];

const BASE_HEADER_LABEL = new Map<number, string>(
  BASE_HEADERS.map((item) => [item.id, item.label])
);

const createPlaceholderValue = (tipo: ColumnType = 'base'): CalculoValue => ({
  id: createId(),
  headerRef: null,
  headerTitle: '',
  tipo,
});

const createInitialHeaders = (): HeaderDraft[] => [
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
    id: 'base-2',
    title: 'Cantidad',
    isEditable: true,
    isBaseHeader: true,
    baseHeaderId: 2,
    isCantidad: true,
    isQuantityDefined: true,
    showQuantityQuestion: false,
    calculoOperations: [],
    order: 2,
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

const normalizeHeaders = (headers: HeaderDraft[]): HeaderDraft[] =>
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

const getHeaderTitle = (header: HeaderDraft): string => {
  if (header.title.trim()) return header.title;
  if (header.isBaseHeader && header.baseHeaderId) {
    return BASE_HEADER_LABEL.get(header.baseHeaderId) ?? 'Header base';
  }
  return 'Header';
};

const getBaseOrder = (baseId: BaseHeaderId) =>
  BASE_HEADERS.find((item) => item.id === baseId)?.order ?? 100;

const cloneHeaderDraft = (header: HeaderDraft): HeaderDraft => ({
  ...header,
  calculoOperations: header.calculoOperations.map((operation) => ({
    operator: operation.operator,
    values: operation.values.map((value) => ({ ...value })),
  })),
});

const MotionButton = motion(Button);

const headerSupportsCalculation = (header: HeaderDraft): boolean => {
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

const headerIsSelectableForCalculation = (header: HeaderDraft): boolean => {
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

const TipoMaterialPage: React.FC = () => {
  const navigate = useNavigate();
  const { tipos, setTipos, setLoading } = useMaterialStore();
  const { execute, loading } = useAsyncOperation();

  const [titulo, setTitulo] = useState('');
  const [headers, setHeaders] = useState<HeaderDraft[]>(() =>
    normalizeHeaders(createInitialHeaders())
  );
  const [removedCustomHeaders, setRemovedCustomHeaders] = useState<HeaderDraft[]>([]);
  const [selectionMode, setSelectionMode] = useState<SelectionState | null>(null);
  const selectionBackupRef = useRef<SelectionBackup | null>(null);
  const [flashingColumns, setFlashingColumns] = useState<Set<string>>(new Set());
  const [formError, setFormError] = useState<string | null>(null);
  const [ayudaOpen, setAyudaOpen] = useState(false);

  const setHeadersWithNormalize = useCallback(
    (updater: (prev: HeaderDraft[]) => HeaderDraft[]) => {
      setHeaders((prev) => normalizeHeaders(updater(prev)));
    },
    []
  );

  const showHeaderSelectionBar = useMemo(() => {
    const baseHeadersRemoved = BASE_HEADERS.some(
      (b) => b.optional && !headers.some((h) => h.baseHeaderId === b.id)
    );
    const customHeadersRemoved = removedCustomHeaders.length > 0;
    return baseHeadersRemoved || customHeadersRemoved;
  }, [headers, removedCustomHeaders]);

  const availableBaseHeaders = useMemo(() => {
    const activeBaseIds = new Set(
      headers
        .filter(
          (header) =>
            header.isBaseHeader &&
            header.baseHeaderId &&
            header.baseHeaderId !== 1 &&
            header.baseHeaderId !== 4 &&
            header.baseHeaderId !== 5
        )
        .map((header) => header.baseHeaderId!)
    );
    return BASE_HEADERS.filter((item) => item.optional && !activeBaseIds.has(item.id));
  }, [headers]);

  const customHeaderOptions = useMemo(
    () =>
      removedCustomHeaders.map((header) => ({
        id: header.id,
        label: getHeaderTitle(header),
      })),
    [removedCustomHeaders]
  );

  const eligibleColumnIds = useMemo(() => {
    if (!selectionMode) return new Set<string>();

    const eligible = headers.filter((header) => {
      if (selectionMode.excludeHeaders.has(header.id)) return false;
      return headerIsSelectableForCalculation(header);
    });

    return new Set(eligible.map((header) => header.id));
  }, [headers, selectionMode]);

  useEffect(() => {
    if (!selectionMode) {
      setFlashingColumns((prev) => (prev.size === 0 ? prev : new Set()));
      return;
    }

    const eligibleIds = Array.from(eligibleColumnIds);
    setFlashingColumns((prev) => {
      const next = new Set(prev);
      eligibleIds.forEach((id) => next.add(id));
      return next;
    });
  }, [eligibleColumnIds, selectionMode]);

  const handleAddBaseHeader = useCallback(
    (baseHeaderId: number) => {
      const baseInfo = BASE_HEADERS.find((item) => item.id === baseHeaderId);
      if (!baseInfo) return;

      setHeadersWithNormalize((prev) => {
        const newHeader: HeaderDraft = {
          id: `base-${baseHeaderId}`,
          title: baseInfo.label,
          isEditable: baseInfo.optional,
          isBaseHeader: true,
          baseHeaderId,
          isCantidad: baseHeaderId === 2,
          isQuantityDefined: true,
          showQuantityQuestion: false,
          calculoOperations: [],
          order: getBaseOrder(baseHeaderId as BaseHeaderId),
        };

        let nextHeaders = [...prev, newHeader];

        if (baseHeaderId === 2) {
          nextHeaders = nextHeaders.map((header) => {
            if (header.baseHeaderId === 5) {
              const alreadyIncludes = header.calculoOperations.some((operation) =>
                operation.values.some((value) => value.headerRef === 'base-2')
              );
              if (alreadyIncludes) return header;

              const updatedOperations = header.calculoOperations.length
                ? header.calculoOperations.map((operation, index) =>
                    index === 0
                      ? {
                          ...operation,
                          values: [
                            ...operation.values,
                            {
                              id: createId(),
                              headerRef: 'base-2',
                              headerTitle: 'Cantidad',
                              tipo: 'base' as ColumnType,
                            },
                          ],
                        }
                      : operation
                  )
                : [
                    {
                      operator: 'multiplicacion' as OperatorType,
                      values: [
                        {
                          id: createId(),
                          headerRef: 'base-2',
                          headerTitle: 'Cantidad',
                          tipo: 'base' as ColumnType,
                        },
                        {
                          id: createId(),
                          headerRef: 'base-4',
                          headerTitle: '$Unitario',
                          tipo: 'base' as ColumnType,
                        },
                      ],
                    },
                  ];

              return {
                ...header,
                calculoOperations: updatedOperations,
              };
            }
            return header;
          });
        }

        return nextHeaders;
      });
    },
    [setHeadersWithNormalize]
  );

  const handleAddNewHeader = useCallback(() => {
    setHeadersWithNormalize((prev) => {
      const maxBaseOrderBeforeUnit = Math.max(
        0,
        ...prev
          .filter(
            (header) =>
              header.baseHeaderId &&
              header.baseHeaderId !== 4 &&
              header.baseHeaderId !== 5
          )
          .map((header) => header.order)
      );

      const maxCustomOrder = Math.max(
        0,
        ...prev
          .filter((header) => !header.isBaseHeader)
          .map((header) => header.order)
      );

      const nextOrder = Math.max(maxBaseOrderBeforeUnit, maxCustomOrder) + 1;

      const newHeader: HeaderDraft = {
        id: createId(),
        title: '',
        isEditable: true,
        isBaseHeader: false,
        isCantidad: false,
        isQuantityDefined: false,
        showQuantityQuestion: true,
        calculoOperations: [],
        order: nextOrder,
      };

      const updatedHeaders = prev.map((header) => {
        if (header.baseHeaderId === 4) {
          const desiredOrder = header.order <= nextOrder ? nextOrder + 1 : header.order;
          return {
            ...header,
            order: desiredOrder,
          };
        }

        if (header.baseHeaderId === 5) {
          return {
            ...header,
            order: 999,
          };
        }

        return header;
      });

      return [...updatedHeaders, newHeader];
    });
  }, [setHeadersWithNormalize]);

  const handleHeaderRemove = useCallback(
    (headerId: string) => {
      let removedHeader: HeaderDraft | undefined;

      setHeadersWithNormalize((prev) =>
        prev
          .filter((header) => {
            if (header.id === headerId) {
              removedHeader = header;
              return false;
            }
            return true;
          })
          .map((header) => ({
            ...header,
            calculoOperations: header.calculoOperations
              .map((operation) => ({
                ...operation,
                values: operation.values.filter((value) => value.headerRef !== headerId),
              }))
              .filter((operation) => operation.values.length > 0),
          }))
      );

      if (selectionMode) {
        if (selectionMode.targetHeaderId === headerId) {
          setSelectionMode(null);
          selectionBackupRef.current = null;
        } else if (selectionMode.excludeHeaders.has(headerId)) {
          const updatedExclude = new Set(selectionMode.excludeHeaders);
          updatedExclude.delete(headerId);
          setSelectionMode({
            ...selectionMode,
            excludeHeaders: updatedExclude,
          });
        }
      }

      if (selectionBackupRef.current && selectionBackupRef.current.headerId === headerId) {
        selectionBackupRef.current = null;
      }

      // ✅ Guardar header personalizado si tiene título o cálculos
      if (
        removedHeader &&
        !removedHeader.isBaseHeader &&
        (removedHeader.title.trim() !== '' || removedHeader.calculoOperations.length > 0)
      ) {
        const snapshot = cloneHeaderDraft(removedHeader);
        setRemovedCustomHeaders((prev) => {
          const withoutDuplicates = prev.filter((header) => header.id !== snapshot.id);
          return [...withoutDuplicates, snapshot];
        });
      }
    },
    [selectionBackupRef, selectionMode, setHeadersWithNormalize, setRemovedCustomHeaders, setSelectionMode]
  );

  const handleRestoreCustomHeader = useCallback(
    (headerId: string) => {
      setRemovedCustomHeaders((prev) => {
        const headerToRestore = prev.find((header) => header.id === headerId);
        if (!headerToRestore) return prev;

        setHeadersWithNormalize((current) => [...current, cloneHeaderDraft(headerToRestore)]);

        return prev.filter((header) => header.id !== headerId);
      });
    },
    [setHeadersWithNormalize]
  );

  const handleDiscardCustomHeader = useCallback((headerId: string) => {
    setRemovedCustomHeaders((prev) => prev.filter((header) => header.id !== headerId));
  }, []);

  const handleReorderEditableHeaders = useCallback(
    (orderedIds: string[]) => {
      if (orderedIds.length === 0) return;

      setHeadersWithNormalize((prev) => {
        const detailHeader = prev.find((header) => header.baseHeaderId === 1);
        const unitarioHeader = prev.find((header) => header.baseHeaderId === 4);
        const totalHeader = prev.find((header) => header.baseHeaderId === 5);

        const assignedOrders = new Map<string, number>();
        let orderCursor = 1;

        if (detailHeader) {
          assignedOrders.set(detailHeader.id, orderCursor++);
        }

        orderedIds.forEach((id) => {
          if (!assignedOrders.has(id)) {
            assignedOrders.set(id, orderCursor++);
          }
        });

        prev
          .filter(
            (header) =>
              header.isEditable &&
              header.baseHeaderId !== 1 &&
              header.baseHeaderId !== 4 &&
              header.baseHeaderId !== 5 &&
              !orderedIds.includes(header.id)
          )
          .sort((a, b) => a.order - b.order)
          .forEach((header) => {
            if (!assignedOrders.has(header.id)) {
              assignedOrders.set(header.id, orderCursor++);
            }
          });

        prev
          .filter(
            (header) =>
              !header.isEditable &&
              header.baseHeaderId !== 1 &&
              header.baseHeaderId !== 4 &&
              header.baseHeaderId !== 5
          )
          .sort((a, b) => a.order - b.order)
          .forEach((header) => {
            if (!assignedOrders.has(header.id)) {
              assignedOrders.set(header.id, orderCursor++);
            }
          });

        if (unitarioHeader) {
          assignedOrders.set(unitarioHeader.id, orderCursor++);
        }

        if (totalHeader) {
          assignedOrders.set(totalHeader.id, 999);
        }

        return prev.map((header) => ({
          ...header,
          order: assignedOrders.get(header.id) ?? header.order,
        }));
      });
    },
    [setHeadersWithNormalize]
  );

  const handleQuantityResponse = useCallback(
    (headerId: string, value: boolean) => {
      setHeadersWithNormalize((prev) =>
        prev.map((header) =>
          header.id === headerId
            ? {
                ...header,
                isCantidad: value,
                isQuantityDefined: true,
                showQuantityQuestion: false,
              }
            : header
        )
      );
      setFormError(null);
    },
    [setHeadersWithNormalize, setFormError]
  );

  const createSelectionState = useCallback(
    (header: HeaderDraft, operationIndex: number, valueIndex: number): SelectionState => {
      const exclude = new Set<string>();
      header.calculoOperations.forEach((operation, opIdx) => {
        operation.values.forEach((value, valIdx) => {
          if (value.headerRef && !(opIdx === operationIndex && valIdx === valueIndex)) {
            exclude.add(value.headerRef);
          }
        });
      });
      exclude.add(header.id);

      return {
        targetHeaderId: header.id,
        operationIndex,
        valueIndex,
        excludeHeaders: exclude,
      };
    },
    []
  );

  const handleCancelSeleccion = useCallback(() => {
    if (!selectionMode) return;

    const headerId = selectionMode.targetHeaderId;
    const context = selectionBackupRef.current;
    const backup =
      context && context.headerId === headerId
        ? context.backup
        : null;

    const restored = backup ? cloneHeaderDraft(backup) : null;

    if (restored) {
      setHeadersWithNormalize((prev) =>
        prev.map((header) => (header.id === headerId ? restored : header))
      );
    } else {
      setHeadersWithNormalize((prev) =>
        prev.map((header) => {
          if (header.id !== headerId) return header;
          return {
            ...header,
            calculoOperations: header.calculoOperations
              .map((operation) => ({
                ...operation,
                values: operation.values.filter((value) => value.headerRef),
              }))
              .filter((operation) => operation.values.length > 0),
          };
        })
      );
    }

    setSelectionMode(null);
    selectionBackupRef.current = null;
    setFormError(null);
    setFlashingColumns(new Set());
  }, [
    selectionBackupRef,
    selectionMode,
    setFormError,
    setFlashingColumns,
    setHeadersWithNormalize,
    setSelectionMode,
  ]);

  useEffect(() => {
    if (!selectionMode) return;

    const handlePointerDownOutside = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (target.closest('[data-calculo-selectable="true"]')) return;
      if (target.closest('[data-calculo-trigger="true"]')) return;

      if (selectionMode) {
        const header = headers.find((item) => item.id === selectionMode.targetHeaderId);
        if (header) {
          const hasPendingValues = header.calculoOperations.some((operation) =>
            operation.values.some((value) => !value.headerRef)
          );
          if (hasPendingValues) {
            return;
          }
        }
      }

      handleCancelSeleccion();
    };

    document.addEventListener('pointerdown', handlePointerDownOutside);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside);
    };
  }, [handleCancelSeleccion, headers, selectionMode]);

  const handleAddCalculo = useCallback(
    (headerId: string, operator: OperatorType) => {
      if (selectionMode) {
        if (selectionMode.targetHeaderId !== headerId) {
          handleCancelSeleccion();
        } else {
          return;
        }
      }

      const targetHeader = headers.find((item) => item.id === headerId);
      if (!targetHeader) {
        return;
      }

      if (!headerSupportsCalculation(targetHeader)) {
        if (
          !targetHeader.isBaseHeader &&
          !targetHeader.isQuantityDefined &&
          targetHeader.calculoOperations.length === 0
        ) {
          setFormError('Primero indica si el header es una cantidad antes de crear un cálculo.');
        }
        return;
      }

      selectionBackupRef.current = {
        headerId,
        backup: cloneHeaderDraft(targetHeader),
      };
      setFormError(null);

      setHeadersWithNormalize((prev) =>
        prev.map((header) => {
          if (header.id !== headerId) return header;

          let nextOperations: CalculoOperation[];

          if (header.calculoOperations.length === 0) {
            nextOperations = [
              {
                operator,
                values: [createPlaceholderValue(), createPlaceholderValue()],
              },
            ];
          } else {
            nextOperations = [
              ...header.calculoOperations,
              {
                operator,
                values: [createPlaceholderValue()],
              },
            ];
          }

          return {
            ...header,
            calculoOperations: nextOperations,
          };
        })
      );

      setSelectionMode(null);
    },
    [
      handleCancelSeleccion,
      headers,
      selectionBackupRef,
      selectionMode,
      setFormError,
      setHeadersWithNormalize,
    ]
  );

  const triggerFlash = useCallback((headerId: string) => {
    setFlashingColumns((prev) => {
      const next = new Set(prev);
      next.add(headerId);
      return next;
    });
    setTimeout(() => {
      setFlashingColumns((prev) => {
        const next = new Set(prev);
        next.delete(headerId);
        return next;
      });
    }, 1000);
  }, []);

  const handleValueClick = useCallback(
    (headerId: string, operationIndex: number, valueIndex: number) => {
      const header = headers.find((item) => item.id === headerId);
      if (!header) return;
      const operation = header.calculoOperations[operationIndex];
      if (!operation) return;
      const value = operation.values[valueIndex];
      if (!value) return;

      if (!value.headerRef) {
        if (
          !selectionBackupRef.current ||
          selectionBackupRef.current.headerId !== headerId
        ) {
          selectionBackupRef.current = {
            headerId,
            backup: cloneHeaderDraft(header),
          };
        }
        setSelectionMode(createSelectionState(header, operationIndex, valueIndex));
        setFormError(null);
        return;
      }

      triggerFlash(value.headerRef);
    },
    [createSelectionState, headers, selectionBackupRef, setFormError, triggerFlash]
  );

  const formatExpression = useCallback((operations: CalculoOperation[]) => {
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
  }, []);

  const handleValueContextMenu = useCallback(
    (headerId: string, operationIndex: number, valueIndex: number) => {
      const header = headers.find((item) => item.id === headerId);
      if (!header) return;

      const operations = header.calculoOperations;
      if (!operations.length) return;

      const operation = operations[operationIndex];
      if (!operation) return;

      const value = operation.values[valueIndex];
      if (!value?.headerRef) return;

      const titleHeader = getHeaderTitle(header);
      const symbolChar = operation.operator === 'multiplicacion' ? '×' : '÷';
      const symbolWord = operation.operator === 'multiplicacion' ? 'multiplicación' : 'división';

      if (operations.length === 1 && operation.values.length <= 2) {
        const first = operation.values[0];
        const second = operation.values[1];
        if (!first || !second) return;
        const question = `¿Desea eliminar el cálculo de "${first.headerTitle || '---'}" ${symbolChar} "${second.headerTitle || '---'}" del header "${titleHeader}"?`;

        if (!window.confirm(question)) {
          return;
        }

        setHeadersWithNormalize((prev) =>
          prev.map((item) =>
            item.id === headerId
              ? {
                  ...item,
                  calculoOperations: [],
                }
              : item
          )
        );

        if (selectionBackupRef.current?.headerId === headerId) {
          selectionBackupRef.current = null;
        }
        if (selectionMode?.targetHeaderId === headerId) {
          setSelectionMode(null);
        }
        return;
      }

      const expressionBefore = formatExpression(operations);

      const updatedOperations = operations
        .map((op, idx) =>
          idx === operationIndex
            ? {
                ...op,
                values: op.values.filter((_, idxValue) => idxValue !== valueIndex),
              }
            : op
        )
        .filter((op) => op.values.length > 0);

      const expressionAfter = formatExpression(updatedOperations);
      const valueTitle = value.headerTitle || '---';

      const question = `¿Desea eliminar la opción "${valueTitle}" y su cálculo de ${symbolWord} de la operación "${expressionBefore}" y dejar el cálculo como "${expressionAfter || '---'}"?`;

      if (!window.confirm(question)) {
        return;
      }

      setHeadersWithNormalize((prev) =>
        prev.map((item) =>
          item.id === headerId
            ? {
                ...item,
                calculoOperations: updatedOperations,
              }
            : item
        )
      );

      if (selectionBackupRef.current?.headerId === headerId) {
        selectionBackupRef.current = null;
      }
      if (selectionMode?.targetHeaderId === headerId) {
        setSelectionMode(null);
      }
    },
    [
      formatExpression,
      headers,
      selectionBackupRef,
      selectionMode,
      setHeadersWithNormalize,
      setSelectionMode,
    ]
  );

  const handleValueDoubleClick = useCallback(
    (headerId: string, operationIndex: number, valueIndex: number) => {
      const header = headers.find((item) => item.id === headerId);
      if (!header) return;

      selectionBackupRef.current = {
        headerId,
        backup: cloneHeaderDraft(header),
      };

      setHeadersWithNormalize((prev) =>
        prev.map((header) => {
          if (header.id !== headerId) return header;

          const nextOperations = header.calculoOperations.map((operation, opIdx) =>
            opIdx === operationIndex
              ? {
                  ...operation,
                  values: operation.values.map((value, valIdx) =>
                    valIdx === valueIndex ? { ...value, headerRef: null, headerTitle: '' } : value
                  ),
                }
              : operation
          );

          return {
            ...header,
            calculoOperations: nextOperations,
          };
        })
      );

      const normalizedHeader: HeaderDraft = {
        ...header,
        calculoOperations: header.calculoOperations.map((operation, opIdx) =>
          opIdx === operationIndex
            ? {
                ...operation,
                values: operation.values.map((value, valIdx) =>
                  valIdx === valueIndex ? { ...value, headerRef: null, headerTitle: '' } : value
                ),
              }
            : operation
        ),
      };

      setSelectionMode(createSelectionState(normalizedHeader, operationIndex, valueIndex));
    },
    [createSelectionState, headers, selectionBackupRef, setHeadersWithNormalize]
  );

  const handleColumnSelect = useCallback(
    (selectedHeaderId: string) => {
      if (!selectionMode) return;

      const selectedHeader = headers.find((header) => header.id === selectedHeaderId);
      if (!selectedHeader) return;

      const selectedTitle = getHeaderTitle(selectedHeader);
      const selectedType: ColumnType = selectedHeader.isBaseHeader ? 'base' : 'atribute';

      let nextSelection: SelectionState | null = null;

      setHeadersWithNormalize((prev) =>
        prev.map((header) => {
          if (header.id !== selectionMode.targetHeaderId) return header;

          const nextOperations = header.calculoOperations.map((operation, opIdx) => {
            if (opIdx !== selectionMode.operationIndex) return operation;

            return {
              ...operation,
              values: operation.values.map((value, valIdx) =>
                valIdx === selectionMode.valueIndex
                  ? {
                      ...value,
                      headerRef: selectedHeaderId,
                      headerTitle: selectedTitle,
                      tipo: selectedType,
                    }
                  : value
              ),
            };
          });

          const updatedHeader: HeaderDraft = {
            ...header,
            calculoOperations: nextOperations,
          };

          for (
            let opIdx = selectionMode.operationIndex;
            opIdx < updatedHeader.calculoOperations.length;
            opIdx += 1
          ) {
            const operation = updatedHeader.calculoOperations[opIdx];
            const startIndex = opIdx === selectionMode.operationIndex ? selectionMode.valueIndex + 1 : 0;
            for (let valIdx = startIndex; valIdx < operation.values.length; valIdx += 1) {
              const value = operation.values[valIdx];
              if (!value.headerRef) {
                nextSelection = createSelectionState(updatedHeader, opIdx, valIdx);
                return updatedHeader;
              }
            }
          }

          return updatedHeader;
        })
      );

    setSelectionMode(nextSelection);

    if (!nextSelection) {
      selectionBackupRef.current = null;
    }
    },
  [createSelectionState, headers, selectionBackupRef, selectionMode, setHeadersWithNormalize]
  );

  const validateCalculations = useCallback(() => {
    for (const header of headers) {
      if (!header.calculoOperations.length) continue;
      for (const operation of header.calculoOperations) {
        if (operation.values.some((value) => !value.headerRef)) {
          return `Completa el cálculo del header "${getHeaderTitle(header)}".`;
        }
      }
    }
    return null;
  }, [headers]);

  const buildCalculoPayload = useCallback(
    (operations: CalculoOperation[], atributoIndexMap: Map<string, number>) => {
      if (!operations.length) return undefined;

      const cleaned = operations.reduce<
        Array<{
          tipo: OperatorType;
          headers_base?: number[];
          headers_atributes?: number[];
        }>
      >((acc, operation) => {
        const baseRefs = Array.from(
          new Set(
            operation.values
              .filter((value) => value.tipo === 'base' && value.headerRef)
              .map((value) => headers.find((header) => header.id === value.headerRef)?.baseHeaderId)
              .filter((id): id is number => typeof id === 'number')
          )
        );

        const attrRefs = Array.from(
          new Set(
            operation.values
              .filter(
                (value): value is CalculoValue & { headerRef: string } =>
                  value.tipo === 'atribute' && !!value.headerRef
              )
              .map((value) => atributoIndexMap.get(value.headerRef))
              .filter((id): id is number => typeof id === 'number')
          )
        );

        if (!baseRefs.length && !attrRefs.length) {
          return acc;
        }

        acc.push({
          tipo: operation.operator,
          headers_base: baseRefs.length ? baseRefs : undefined,
          headers_atributes: attrRefs.length ? attrRefs : undefined,
        });

        return acc;
      }, []);

      if (!cleaned.length) return undefined;

      return {
        activo: true,
        isMultiple: cleaned.length > 1,
        operaciones: cleaned,
      };
    },
    [headers]
  );

  const handleSubmit = useCallback(async () => {
    setFormError(null);

    if (!titulo.trim()) {
      setFormError('El título de la tabla es obligatorio.');
      return;
    }

    const pendingQuestion = headers.find((header) => header.showQuantityQuestion);
    if (pendingQuestion) {
      setFormError('Responde si el header es una cantidad antes de continuar.');
      return;
    }

    const incompleteCalculation = validateCalculations();
    if (incompleteCalculation) {
      setFormError(incompleteCalculation);
      return;
    }

    const atributos = headers.filter((header) => !header.isBaseHeader);
    const atributoIndexMap = new Map(atributos.map((header, index) => [header.id, index + 1]));

    const payload = {
      titulo: titulo.trim(),
      headers_base_active: headers
        .filter(
          (header) =>
            header.isBaseHeader &&
            header.baseHeaderId &&
            header.baseHeaderId !== 1 &&
            header.baseHeaderId !== 4 &&
            header.baseHeaderId !== 5
        )
        .map((header) => header.baseHeaderId!)
        .filter((value, index, self) => self.indexOf(value) === index),
      headers_base_calculations: headers
        .filter((header) => header.isBaseHeader && header.baseHeaderId)
        .map((header) => ({
          id_header_base: header.baseHeaderId!,
          calculo: buildCalculoPayload(header.calculoOperations, atributoIndexMap),
        }))
        .filter((item) => item.calculo !== undefined),
      headers_atributes:
        atributos.length > 0
          ? atributos.map((header) => ({
              titulo: header.title.trim() || 'Header',
              isCantidad: header.isCantidad,
              calculo: buildCalculoPayload(header.calculoOperations, atributoIndexMap),
            }))
          : undefined,
    };

    await execute(
      async () => {
        setLoading(true);
        const created = await createTipoMaterial(payload);
        setTipos([...tipos, created]);
        navigate('/materiales');
        return created;
      },
      {
        showErrorToast: true,
        successMessage: 'Tabla de materiales creada correctamente',
        errorMessage: 'Error al crear la tabla de materiales',
        onError: (error) => {
          setFormError(error?.response?.data?.detail || 'Ocurrió un error al crear la tabla.');
          setLoading(false);
        },
        onSuccess: () => {
          setLoading(false);
        },
      }
    );
  }, [
    buildCalculoPayload,
    execute,
    headers,
    navigate,
    setLoading,
    setTipos,
    titulo,
    tipos,
    validateCalculations,
  ]);

  const handleBack = useCallback(() => {
    navigate('/materiales');
  }, [navigate]);

  return (
    <div className="space-y-6 pb-8">
      <HeaderHome
        title="Nueva Tabla de Materiales"
        description="Diseña tu tabla personalizada agregando los campos que necesites. Puedes crear cálculos automáticos entre columnas usando multiplicaciones y divisiones."
        icon={Boxes}
        iconClassName="bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
        aside={
          <div className='flex'>
            <Button
              type="button"
              onClick={handleBack}
              variant="outline"
              className="border-slate-600 text-slate-200 bg-slate-900 mr-2 hover:bg-slate-800/60"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Button
              className="border-slate-600 text-slate-200 bg-slate-900 hover:bg-slate-800/60" 
              variant="outline" 
              onClick={() => setAyudaOpen(true)}>
              Ayuda
            </Button>
          </div>
        } 
      />

      <div className=" text-slate-100">
          <div className="space-y-6" data-help-anchor="review-area">
          <AyudaMesage open={ayudaOpen} onOpenChange={setAyudaOpen} />
          <div
            className={cn(
              'relative flex items-start justify-between mx-1 gap-4',
              'overflow-hidden' // evita desplazamientos bruscos
            )}
          >
            <AnimatePresence mode="sync">
              {showHeaderSelectionBar && (
                <motion.div
                  key="header-selection"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                  className="flex-1"
                >
                  <HeaderSelectionBar
                    baseOptions={availableBaseHeaders.map((item) => ({
                      id: item.id,
                      label: item.label,
                    }))}
                    customOptions={customHeaderOptions}
                    onSelectBase={handleAddBaseHeader}
                    onRestoreCustom={handleRestoreCustomHeader}
                    onDiscardCustom={handleDiscardCustomHeader}
                    loading={loading}
                  />
                </motion.div>
              )}

              <motion.div
                key="add-header-button"
                layout
                initial={false}
                animate={{
                  x: showHeaderSelectionBar ? 0.2 : 0, // 🔹 se mueve a la derecha
                  opacity: 1,
                }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                className="flex-shrink-0"
              >
                <MotionButton
                  type="button"
                  onClick={handleAddNewHeader}
                  data-help-anchor="add-custom-header"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo header personalizado
                </MotionButton>
              </motion.div>
            </AnimatePresence>
          </div>

          <DraftTableView
            titulo={titulo}
            headers={headers}
            isSelectionMode={!!selectionMode}
            highlightedColumns={eligibleColumnIds}
            flashingColumns={flashingColumns}
            onTituloChange={setTitulo}
            onHeaderTitleChange={(headerId, value) =>
              setHeadersWithNormalize((prev) =>
                prev.map((header) => (header.id === headerId ? { ...header, title: value } : header)),
              )
            }
            onHeaderRemove={handleHeaderRemove}
            onQuantityResponse={handleQuantityResponse}
            onAddCalculo={handleAddCalculo}
            onValueClick={handleValueClick}
            onValueDoubleClick={handleValueDoubleClick}
            onValueContextMenu={handleValueContextMenu}
            onColumnSelect={handleColumnSelect}
            loading={loading}
            onReorderHeaders={handleReorderEditableHeaders}
          />

          {formError && (
            <div className="rounded-md border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {formError}
            </div>
          )}

          <div className="flex justify-center pt-4">
            <Button
              type="button"
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              disabled={loading || !titulo.trim()}
              onClick={handleSubmit}
              data-help-anchor="save-button"
            >
              {loading ? 'Creando tabla...' : 'Guardar nueva tabla'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipoMaterialPage;