import { useState, useCallback } from 'react';

interface UseModalOptions {
  initialState?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
}

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setIsOpen: (open: boolean) => void;
}

/**
 * Hook para manejar el estado y comportamiento de modales
 * Centraliza la lógica común de apertura/cierre de modales
 */
export const useModal = (options: UseModalOptions = {}): UseModalReturn => {
  const {
    initialState = false,
    onOpen,
    onClose,
    closeOnEscape = true,
    closeOnBackdrop = true
  } = options;

  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => {
    setIsOpen(true);
    if (onOpen) {
      onOpen();
    }
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Manejar tecla Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (closeOnEscape && e.key === 'Escape' && isOpen) {
      close();
    }
  }, [closeOnEscape, isOpen, close]);

  // Manejar click en backdrop
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      close();
    }
  }, [closeOnBackdrop, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
    // Helpers para usar en componentes
    handleKeyDown: closeOnEscape ? handleKeyDown : undefined,
    handleBackdropClick: closeOnBackdrop ? handleBackdropClick : undefined
  } as UseModalReturn & {
    handleKeyDown?: (e: KeyboardEvent) => void;
    handleBackdropClick?: (e: React.MouseEvent) => void;
  };
};

/**
 * Hook especializado para modales con confirmación
 */
export const useConfirmModal = () => {
  const modal = useModal();
  const [confirmData, setConfirmData] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  } | null>(null);

  const showConfirm = useCallback((data: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  }) => {
    setConfirmData(data);
    modal.open();
  }, [modal]);

  const handleConfirm = useCallback(() => {
    if (confirmData) {
      confirmData.onConfirm();
      modal.close();
      setConfirmData(null);
    }
  }, [confirmData, modal]);

  const handleCancel = useCallback(() => {
    modal.close();
    setConfirmData(null);
  }, [modal]);

  return {
    isOpen: modal.isOpen,
    confirmData,
    showConfirm,
    handleConfirm,
    handleCancel,
    close: handleCancel
  };
};

/**
 * Hook para manejar múltiples modales en un componente
 */
export const useMultipleModals = <T extends string>(modalNames: T[]) => {
  const [openModals, setOpenModals] = useState<Set<T>>(new Set());

  const openModal = useCallback((modalName: T) => {
    setOpenModals(prev => new Set(prev).add(modalName));
  }, []);

  const closeModal = useCallback((modalName: T) => {
    setOpenModals(prev => {
      const newSet = new Set(prev);
      newSet.delete(modalName);
      return newSet;
    });
  }, []);

  const toggleModal = useCallback((modalName: T) => {
    setOpenModals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modalName)) {
        newSet.delete(modalName);
      } else {
        newSet.add(modalName);
      }
      return newSet;
    });
  }, []);

  const isModalOpen = useCallback((modalName: T) => {
    return openModals.has(modalName);
  }, [openModals]);

  const closeAllModals = useCallback(() => {
    setOpenModals(new Set());
  }, []);

  // Crear objeto con métodos para cada modal
  const modals = modalNames.reduce((acc, modalName) => {
    acc[modalName] = {
      isOpen: openModals.has(modalName),
      open: () => openModal(modalName),
      close: () => closeModal(modalName),
      toggle: () => toggleModal(modalName)
    };
    return acc;
  }, {} as Record<T, { isOpen: boolean; open: () => void; close: () => void; toggle: () => void }>);

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    isModalOpen,
    closeAllModals,
    openModals: Array.from(openModals)
  };
};

export default useModal;


