import React from 'react';
import { ConfirmModal as BaseConfirmModal } from '@/components/modals/BaseModal';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = (props) => {
  return <BaseConfirmModal {...props} />;
};

export default ConfirmModal;
