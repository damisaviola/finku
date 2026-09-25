'use client';

import React from 'react';
import { Dialog, DialogFooter } from './dialog';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<AlertTriangle className="h-5 w-5" />}
      iconVariant={variant === 'danger' ? 'rose' : 'amber'}
      badge="Konfirmasi"
      maxWidth="sm"
    >
      <div className="space-y-3.5 py-1">
        <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {description}
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-medium">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Tindakan ini permanen dan tidak dapat dibatalkan.</span>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={async () => {
            try {
              await onConfirm();
              onClose();
            } catch (err) {
              console.error('ConfirmDialog action error:', err);
              onClose();
            }
          }}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

