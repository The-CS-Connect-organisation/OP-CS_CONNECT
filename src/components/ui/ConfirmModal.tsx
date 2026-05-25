import React from 'react';
import { Modal } from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm?: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  title = 'Confirm',
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  onConfirm,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <div className="space-y-4">
      {description && <p className="text-sm text-[var(--text-secondary)]">{description}</p>}
      <div className="flex gap-3 justify-end pt-2">
        <button className="btn-secondary" onClick={onClose}>
          {cancelText}
        </button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={() => { onConfirm?.(); onClose(); }}>
          {confirmText}
        </button>
      </div>
    </div>
  </Modal>
);
