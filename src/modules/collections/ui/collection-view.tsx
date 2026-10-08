'use client';

import { useState, useTransition } from 'react';
import { Dialog, Icon, useToast, type Section } from '@/modules/shared';
import { createEntry, deleteEntry, updateEntry } from '../application/actions';
import type { ActionResult, EntryView } from '../domain/collection';

interface Props {
  section: Section;
  entries: EntryView[];
}

type Editing = { mode: 'new' } | { mode: 'edit'; entry: EntryView } | null;

export function CollectionView({ section, entries }: Props) {
  const notify = useToast();
  const [term, setTerm] = useState('');
  const [editing, setEditing] = useState<Editing>(null);
  const [confirming, setConfirming] = useState(false);
  // Muda a cada abertura do editor: remonta o formulário (valores novos) sem perder o rascunho
  // quando o usuário só abre e cancela a confirmação de exclusão.
  const [session, setSession] = useState(0);
  const [pending, startTransition] = useTransition();

  const needle = term.trim().toLocaleLowerCase('pt-BR');
  const filtered = entries.filter((e) =>
    (e.name + ' ' + e.detail).toLocaleLowerCase('pt-BR').includes(needle),
  );

  function run(action: () => Promise<ActionResult>, success: string) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setEditing(null);
        setConfirming(false);
        notify(success);
      } else {
        notify(result.error);
      }
    });
  }

  function submit(data: FormData) {
    if (!editing) return;
    const input = {
      name: String(data.get('name') ?? ''),
      detail: String(data.get('detail') ?? ''),
    };
    run(
      () =>
        editing.mode === 'edit'
          ? updateEntry(section.slug, editing.entry.id, input)
          : createEntry(section.slug, input),
      'Registro salvo.',
    );
  }

  function openEditor(next: NonNullable<Editing>) {
    setSession((s) => s + 1);
    setEditing(next);
  }

  const edit = editing?.mode === 'edit' ? editing.entry : undefined;

  return (
    <>
      <div className="page-top">
        <div>
          <p className="eyebrow">SEU PRÓXIMO CAPÍTULO</p>
          <h1>
            {section.title}
            <span>.</span>
          </h1>
          {section.description && <p className="subtitle">{section.description}</p>}
        </div>
        <button className="primary" onClick={() => openEditor({ mode: 'new' })}>
          <Icon name="plus" />
          <span>{section.action}</span>
        </button>
      </div>

      <div className="section-line">
        <span>
          {section.list} <b>{entries.length}</b>
        </span>
        <span className="section-caption">SUAS HISTÓRIAS COMEÇAM AQUI</span>
      </div>
      <label className="search-field">
        Buscar nesta coleção
        <input
          type="search"
          placeholder="Buscar por nome ou descrição"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </label>

      <div className="cards">
        {filtered.map((entry) => (
          <article className="card" key={entry.id}>
            <Icon name={section.icon} />
            <h2>{entry.name}</h2>
            <p>{entry.detail || 'Sem anotações.'}</p>
            <button
              className="secondary"
              aria-label={'Abrir / editar ' + entry.name}
              onClick={() => openEditor({ mode: 'edit', entry })}
            >
              Abrir / editar
            </button>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <section className="empty">
          <div className="emblem">
            <div className="orbit" />
            <Icon name="dice" />
            <span className="star star-a">+</span>
            <span className="star star-b">+</span>
          </div>
          <p className="eyebrow">A AVENTURA ESTÁ À SUA ESPERA</p>
          <h2>{needle ? 'Nenhum resultado encontrado.' : 'Sua coleção começa aqui.'}</h2>
          <p>
            {needle
              ? 'Tente outro nome ou termo na busca.'
              : 'Adicione seu primeiro registro para consultar durante a próxima sessão.'}
          </p>
          {!needle && (
            <button className="primary" onClick={() => openEditor({ mode: 'new' })}>
              <Icon name="plus" />
              <span>{section.action}</span>
            </button>
          )}
          <span className="empty-foot">Coleção pessoal</span>
        </section>
      )}

      <Dialog
        key={session}
        keepMounted
        open={editing !== null && !confirming}
        title={edit ? 'Editar registro' : (section.action ?? 'Novo registro')}
        onClose={() => {
          if (!confirming) setEditing(null);
        }}
        onSubmit={submit}
        pending={pending}
        footerStart={
          edit && (
            <button type="button" className="secondary danger" onClick={() => setConfirming(true)}>
              Excluir
            </button>
          )
        }
      >
        <label>
          Nome
          <input
            name="name"
            maxLength={80}
            required
            autoFocus
            defaultValue={edit?.name ?? ''}
            onInvalid={(e) => e.currentTarget.setCustomValidity('Digite um nome.')}
            onInput={(e) => e.currentTarget.setCustomValidity('')}
          />
        </label>
        <label>
          {section.field}
          <textarea
            name="detail"
            maxLength={6000}
            placeholder={section.placeholder}
            defaultValue={edit?.detail ?? ''}
          />
        </label>
      </Dialog>

      <Dialog
        open={confirming && edit !== undefined}
        title="Excluir registro"
        danger
        submitLabel="Excluir"
        pending={pending}
        onClose={() => setConfirming(false)}
        onSubmit={() => {
          if (edit) run(() => deleteEntry(section.slug, edit.id), 'Registro excluído.');
        }}
      >
        <p>Excluir este registro? Esta ação não pode ser desfeita.</p>
      </Dialog>
    </>
  );
}
