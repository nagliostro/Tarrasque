'use client';

import { useEffect, useId, useRef } from 'react';
import { Icon } from './icon';

interface DialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  children: React.ReactNode;
  /** Texto do botão de envio (padrão: "Salvar"). */
  submitLabel?: string;
  /** Envio destrutivo: usa o estilo `secondary danger` em vez do botão primário. */
  danger?: boolean;
  /** Desabilita o envio enquanto uma ação está em andamento. */
  pending?: boolean;
  /** Mantém o formulário montado (e o rascunho) enquanto o diálogo está fechado. */
  keepMounted?: boolean;
  /** Ação extra alinhada à esquerda do rodapé (ex.: "Excluir"). */
  footerStart?: React.ReactNode;
  /** Diálogo largo (paisagem), para conteúdo como a mesa de dados. */
  wide?: boolean;
}

/** <dialog> nativo com showModal, no mesmo markup do legado. */
export function Dialog({
  open,
  title,
  onClose,
  onSubmit,
  children,
  submitLabel = 'Salvar',
  danger = false,
  pending = false,
  footerStart,
  keepMounted = false,
  wide = false,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={wide ? 'wide' : undefined}
      onClose={onClose}
      aria-labelledby={titleId}
    >
      {(open || keepMounted) && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(new FormData(event.currentTarget));
          }}
        >
          <div className="dialog-header">
            <h2 id={titleId}>{title}</h2>
            <button type="button" className="icon-button" aria-label="Fechar" onClick={onClose}>
              <Icon name="close-icon" />
            </button>
          </div>
          {children}
          <div className="dialog-actions">
            {footerStart && <span style={{ marginRight: 'auto' }}>{footerStart}</span>}
            <button type="button" className="secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className={danger ? 'secondary danger' : 'primary'}
              disabled={pending}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
