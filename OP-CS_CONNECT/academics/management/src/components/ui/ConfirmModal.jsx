import { Modal } from './Modal';
import { Button } from './Button';

export const ConfirmModal = ({
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
      {description && <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>}
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="secondary" onClick={onClose}>
          {cancelText}
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          onClick={() => {
            onConfirm?.();
            onClose?.();
          }}
        >
          {confirmText}
        </Button>
      </div>
    </div>
  </Modal>
);

