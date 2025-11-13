import { useCallback, useRef, useState, useEffect } from 'react';
import {  PanInfo } from 'framer-motion';

interface HeaderPosition {
  id: string;
  left: number;
  width: number;
  center: number;
  index: number;
}

interface UseDraggableHeadersProps {
  editableHeaderIds: string[];
  onReorder: (newOrder: string[]) => void;
}

export const useDraggableHeaders = ({ 
  editableHeaderIds, 
  onReorder 
}: UseDraggableHeadersProps) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const positionsRef = useRef<Map<string, HeaderPosition>>(new Map());
  const orderRef = useRef<string[]>(editableHeaderIds);

  useEffect(() => {
    orderRef.current = editableHeaderIds;
  }, [editableHeaderIds]);

  const registerPosition = useCallback((id: string, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    const index = orderRef.current.indexOf(id);
    
    positionsRef.current.set(id, {
      id,
      left: rect.left + scrollLeft,
      width: rect.width,
      center: rect.left + scrollLeft + rect.width / 2,
      index,
    });
  }, []);

  const calculateDropIndex = useCallback((draggedId: string, offsetX: number): number | null => {
    const draggedPos = positionsRef.current.get(draggedId);
    if (!draggedPos) return null;

    const draggedCenter = draggedPos.center + offsetX;
    let targetIndex = draggedPos.index;

    positionsRef.current.forEach((pos, id) => {
      if (id === draggedId) return;

      if (offsetX > 0 && draggedCenter > pos.center && pos.index > draggedPos.index) {
        targetIndex = Math.max(targetIndex, pos.index);
      } else if (offsetX < 0 && draggedCenter < pos.center && pos.index < draggedPos.index) {
        targetIndex = Math.min(targetIndex, pos.index);
      }
    });

    return targetIndex !== draggedPos.index ? targetIndex : null;
  }, []);

  const handleDragStart = useCallback((id: string) => {
    setDraggedId(id);
    setDropIndex(null);
  }, []);

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    if (!draggedId) return;
    
    const newDropIndex = calculateDropIndex(draggedId, info.offset.x);
    setDropIndex(newDropIndex);
  }, [draggedId, calculateDropIndex]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (!draggedId) {
      setDropIndex(null);
      return;
    }

    const finalDropIndex = calculateDropIndex(draggedId, info.offset.x);
    
    if (finalDropIndex !== null) {
      const currentOrder = [...orderRef.current];
      const currentIndex = currentOrder.indexOf(draggedId);
      
      if (currentIndex !== -1) {
        currentOrder.splice(currentIndex, 1);
        currentOrder.splice(finalDropIndex, 0, draggedId);
        orderRef.current = currentOrder;
        onReorder(currentOrder);
      }
    }

    setDraggedId(null);
    setDropIndex(null);
  }, [draggedId, calculateDropIndex, onReorder]);

  return {
    draggedId,
    dropIndex,
    registerPosition,
    handleDragStart,
    handleDrag,
    handleDragEnd,
  };
};
