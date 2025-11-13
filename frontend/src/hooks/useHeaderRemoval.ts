// useHeaderRemoval.ts - Hook para manejar la eliminación de headers
import { useCallback } from 'react';
import { HeaderDraft, SelectionState, SelectionBackup } from '@/store/material/types';
import { cloneHeaderDraft } from '@/utils/materiales';

export const useHeaderRemoval = (
  setHeadersWithNormalize: (updater: (prev: HeaderDraft[]) => HeaderDraft[]) => void,
  setRemovedCustomHeaders: React.Dispatch<React.SetStateAction<HeaderDraft[]>>,
  selectionMode: SelectionState | null,
  setSelectionMode: React.Dispatch<React.SetStateAction<SelectionState | null>>,
  selectionBackupRef: React.MutableRefObject<SelectionBackup | null>
) => {
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

      // Guardar header personalizado si tiene título o cálculos
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

  return { handleHeaderRemove };
};

export default useHeaderRemoval