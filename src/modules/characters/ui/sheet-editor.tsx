'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, useToast } from '@/modules/shared';
import { deleteCharacter, saveCharacter } from '../application/actions';
import { setPath, type Sheet } from '../domain/sheet';
import type { SheetBinding } from './sheet-fields';
import { DetailsPage, MainPage, SpellsPage } from './sheet-pages';

const TABS = [
  ['ficha', 'Ficha'],
  ['detalhes', 'Detalhes'],
  ['magias', 'Magias'],
] as const;
type TabKey = (typeof TABS)[number][0];

const SAVE_DELAY_MS = 500;

interface Props {
  /** `null` = personagem novo: só é criado no banco na primeira alteração. */
  id: string | null;
  initial: Sheet;
  /** Chamado depois que o salvamento pendente terminou. */
  onBack: () => void;
  onDeleted: () => void;
}

export function SheetEditor({ id, initial, onBack, onDeleted }: Props) {
  const notify = useToast();
  const [sheet, setSheet] = useState<Sheet>(initial);
  const [tab, setTab] = useState<TabKey>('ficha');
  const [status, setStatus] = useState(id ? 'Salvo automaticamente' : 'Novo personagem');
  const [savedId, setSavedId] = useState(id);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const latest = useRef(initial);
  const idRef = useRef(id);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Salvamentos em série: o primeiro cria (e devolve o id), os seguintes atualizam.
  const chain = useRef<Promise<void>>(Promise.resolve());
  const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({ ficha: null, detalhes: null, magias: null });
  const body = useRef<HTMLDivElement>(null);

  const flush = useCallback((): Promise<void> => {
    clearTimeout(timer.current);
    if (!dirty.current) return chain.current;
    dirty.current = false;
    const snapshot = latest.current;
    chain.current = chain.current.then(async () => {
      try {
        const result = await saveCharacter(idRef.current, snapshot);
        if (result.ok) {
          idRef.current = result.id;
          setSavedId(result.id);
          setStatus(dirty.current ? 'Salvando…' : 'Salvo automaticamente');
        } else {
          dirty.current = true;
          setStatus('Não foi possível salvar');
          notify(result.error);
        }
      } catch {
        dirty.current = true;
        setStatus('Não foi possível salvar');
      }
    });
    return chain.current;
  }, [notify]);

  const set = useCallback(
    (path: string, value: unknown) => {
      const next = setPath(latest.current, path, value);
      if (next === latest.current) return;
      latest.current = next;
      dirty.current = true;
      setSheet(next);
      setStatus('Salvando…');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), SAVE_DELAY_MS);
    },
    [flush],
  );

  useEffect(() => {
    const onHide = () => void flush();
    window.addEventListener('pagehide', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      void flush();
    };
  }, [flush]);

  useEffect(() => {
    document.getElementById('main')?.scrollTo({ top: 0 });
    body.current?.querySelector('input')?.focus({ preventScroll: true });
  }, []);

  const binding = useMemo<SheetBinding>(() => ({ sheet, set }), [sheet, set]);

  function onTabKey(e: React.KeyboardEvent) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = TABS.findIndex(([k]) => k === tab);
    const [next] = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length]!;
    setTab(next);
    tabRefs.current[next]?.focus();
  }

  async function confirmDelete() {
    setDeleting(true);
    await flush();
    const target = idRef.current;
    const result = target ? await deleteCharacter(target) : ({ ok: true } as const);
    setDeleting(false);
    if (!result.ok) return notify(result.error);
    dirty.current = false;
    notify('Personagem excluído.');
    onDeleted();
  }

  return (
    <section className="sheet">
      <div className="sheet-bar">
        <button
          type="button"
          className="secondary"
          onClick={async () => {
            await flush();
            onBack();
          }}
        >
          <svg aria-hidden="true">
            <use href="#arrow" transform="rotate(180 12 12)" />
          </svg>
          Meus personagens
        </button>
        <div className="sheet-tabs" role="tablist" aria-label="Páginas da ficha" onKeyDown={onTabKey}>
          {TABS.map(([key, label]) => (
            <button
              key={key}
              ref={(el) => {
                tabRefs.current[key] = el;
              }}
              type="button"
              role="tab"
              id={'tab-' + key}
              aria-controls="sheet-body"
              aria-selected={tab === key}
              tabIndex={tab === key ? 0 : -1}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="sheet-status" role="status">
          {status}
        </span>
        {savedId && (
          <button type="button" className="secondary danger" onClick={() => setConfirming(true)}>
            Excluir
          </button>
        )}
      </div>
      <div id="sheet-body" role="tabpanel" aria-labelledby={'tab-' + tab} ref={body}>
        {tab === 'ficha' && <MainPage b={binding} />}
        {tab === 'detalhes' && <DetailsPage b={binding} />}
        {tab === 'magias' && <SpellsPage b={binding} />}
      </div>

      <Dialog
        open={confirming}
        title="Excluir personagem"
        danger
        submitLabel="Excluir"
        pending={deleting}
        onClose={() => setConfirming(false)}
        onSubmit={() => void confirmDelete()}
      >
        <p>Excluir este personagem? Esta ação não pode ser desfeita.</p>
      </Dialog>
    </section>
  );
}

