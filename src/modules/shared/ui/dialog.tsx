'use client';

import { useEffect, useRef } from 'react';
import { Icon } from './icon';

interface DialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  children: React.ReactNode;
}

/** <dialog> nativo com showModal, no mesmo markup do legado. */
export function Dialog({ open, title, onClose, onSubmit, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="dialog-title">
      {open && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(new FormData(event.currentTarget));
          }}
        >
          <div className="dialog-header">
            <h2 id="dialog-title">{title}</h2>
            <button type="button" className="icon-button" aria-label="Fechar" onClick={onClose}>
              <Icon name="close-icon" />
            </button>
          </div>
          {children}
          <div className="dialog-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary">
              Salvar
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
