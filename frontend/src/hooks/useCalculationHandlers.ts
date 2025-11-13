// useCalculationHandlers.ts - Hook para manejar operaciones de cálculo
import { useCallback, useEffect } from 'react';
import { 
  HeaderDraft, 
  OperatorType, 
  ColumnType, 
  SelectionState, 
  SelectionBackup,
  CalculoOperation 
} from '@/store/material/types';
import {
  createPlaceholderValue,
  headerSupportsCalculation,
  cloneHeaderDraft,
  getHeaderTitle,
  formatExpression,
  OPERATOR_LABEL_MAP,
  OPERATOR_SYMBOL_MAP,
} from '@/utils/materiales';

export const useCalculationHandlers = (
  headers: HeaderDraft[],
  setHeadersWithNormalize: (updater: (prev: HeaderDraft[]) => HeaderDraft[]) => void,
  selectionMode: SelectionState | null,
  setSelectionMode: React.Dispatch<React.SetStateAction<SelectionState | null>>,
  selectionBackupRef: React.MutableRefObject<SelectionBackup | null>,
  setFormError: React.Dispatch<React.SetStateAction<string | null>>,
  setFlashingColumns: React.Dispatch<React.SetStateAction<Set<string>>>,
  createSelectionState: (header: HeaderDraft, operationIndex: number, valueIndex: number) => SelectionState,
  triggerFlash: (headerId: string) => void,
  eligibleColumnIds: Set<string>
) => {
  // Efecto para actualizar columnas parpadeantes
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
  }, [eligibleColumnIds, selectionMode, setFlashingColumns]);

  const handleCancelSeleccion = useCallback(() => {
    if (!selectionMode) return;

    const headerId = selectionMode.targetHeaderId;
    const context = selectionBackupRef.current;
    const backup = context && context.headerId === headerId ? context.backup : null;
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

  // Efecto para manejar clicks fuera de los selectores
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
      setSelectionMode,
    ]
  );

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
    [createSelectionState, headers, selectionBackupRef, setFormError, triggerFlash, setSelectionMode]
  );

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
      const symbolChar = OPERATOR_SYMBOL_MAP[operation.operator];
      const symbolWord = OPERATOR_LABEL_MAP[operation.operator];

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
    [createSelectionState, headers, selectionBackupRef, setHeadersWithNormalize, setSelectionMode]
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
    [createSelectionState, headers, selectionBackupRef, selectionMode, setHeadersWithNormalize, setSelectionMode]
  );

  return {
    handleCancelSeleccion,
    handleAddCalculo,
    handleValueClick,
    handleValueContextMenu,
    handleValueDoubleClick,
    handleColumnSelect,
  };
};

export default useCalculationHandlers