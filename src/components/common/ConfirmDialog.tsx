/**
 * @file src/components/common/ConfirmDialog.tsx
 * Diálogo de confirmação para ações destrutivas (como exclusão de objetivos).
 */

import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidthClass="max-w-md">
      <div className="flex gap-4">
        {isDestructive && (
          <div className="shrink-0 w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onCancel();
          }}
          className={`px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors focus-visible:outline-2 ${
            isDestructive
              ? 'bg-rose-600 hover:bg-rose-700 focus-visible:outline-rose-500'
              : 'bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-500'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
