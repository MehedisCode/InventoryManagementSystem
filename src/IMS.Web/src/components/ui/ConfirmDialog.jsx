import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = "Confirm Action", message = "Are you sure you want to proceed?", confirmText = "Confirm", isDanger = true }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {isDanger && <AlertTriangle className="h-5 w-5 text-red-500" />}
          {title}
        </div>
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant={isDanger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}