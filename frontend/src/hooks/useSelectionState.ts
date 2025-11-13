// useSelectionState.ts - Hook para manejar el estado de selección
import { useState, useMemo, useCallback, useRef } from 'react';
import { HeaderDraft, SelectionState, SelectionBackup } from '@/store/material/types';
import { headerIsSelectableForCalculation } from '@/utils/materiales';

export const useSelectionState = (headers: HeaderDraft[]) => {
  const [selectionMode, setSelectionMode] = useState<SelectionState | null>(null);
  const [flashingColumns, setFlashingColumns] = useState<Set<string>>(new Set());
  const selectionBackupRef = useRef<SelectionBackup | null>(null);

  const eligibleColumnIds = useMemo(() => {
    if (!selectionMode) return new Set<string>();

    const eligible = headers.filter((header) => {
      if (selectionMode.excludeHeaders.has(header.id)) return false;
      return headerIsSelectableForCalculation(header);
    });

    return new Set(eligible.map((header) => header.id));
  }, [headers, selectionMode]);

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

  return {
    selectionMode,
    setSelectionMode,
    flashingColumns,
    setFlashingColumns,
    eligibleColumnIds,
    selectionBackupRef,
    createSelectionState,
    triggerFlash,
  };
};

export default useSelectionState