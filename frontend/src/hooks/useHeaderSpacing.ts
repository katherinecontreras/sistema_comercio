import { useCallback} from 'react';

interface HeaderSpacingAnimatorProps {
  headers: Array<{ id: string; isEditable: boolean }>;
  draggedId: string | null;
  dropIndex: number | null;
  editableHeaderIds: string[];
}

export const useHeaderSpacing = ({
  headers,
  draggedId,
  dropIndex,
  editableHeaderIds,
}: HeaderSpacingAnimatorProps) => {
  const getSpacingForHeader = useCallback((headerId: string, currentIndex: number) => {
    if (!draggedId || dropIndex === null) return 0;
    
    const editableIndex = editableHeaderIds.indexOf(headerId);
    if (editableIndex === -1) return 0;

    const draggedIndex = editableHeaderIds.indexOf(draggedId);
    if (draggedIndex === -1) return 0;

    // Si es el header arrastrado, no mover
    if (headerId === draggedId) return 0;

    // Si el drop es a la derecha del arrastrado
    if (dropIndex > draggedIndex) {
      if (editableIndex > draggedIndex && editableIndex <= dropIndex) {
        return -1; // Mover a la izquierda
      }
    }
    
    // Si el drop es a la izquierda del arrastrado
    if (dropIndex < draggedIndex) {
      if (editableIndex >= dropIndex && editableIndex < draggedIndex) {
        return 1; // Mover a la derecha
      }
    }

    return 0;
  }, [draggedId, dropIndex, editableHeaderIds]);

  return { getSpacingForHeader };
};