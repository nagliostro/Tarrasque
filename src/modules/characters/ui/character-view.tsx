'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Icon, useToast, type Section } from '@/modules/shared';
import { loadSheet } from '../application/actions';
import { defaultSheet, type CharacterSummary, type Sheet } from '../domain/sheet';
import { SheetEditor } from './sheet-editor';

interface Props {
  section: Section;
  characters: CharacterSummary[];
}

interface Open {
  key: number;
  id: string | null;
  sheet: Sheet;
}

export function CharacterView({ section, characters }: Props) {
  const router = useRouter();
  const notify = useToast();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState<Open | null>(null);
  const [, startTransition] = useTransition();

  if (open) {
    const close = () => {
      setOpen(null);
      router.refresh();
    };
    return (
      <SheetEditor
        key={open.key}
        id={open.id}
        initial={open.sheet}
        onBack={close}
        onDeleted={close}
      />
    );
  }

  const needle = term.trim().toLocaleLowerCase('pt-BR');
  const filtered = characters.filter((c) =>
    (c.name + ' ' + c.summary).toLocaleLowerCase('pt-BR').includes(needle),
  );

  const create = () => setOpen({ key: Date.now(), id: null, sheet: defaultSheet() });

  function openExisting(character: CharacterSummary) {
    startTransition(async () => {
      const result = await loadSheet(character.id);
      if (!result.ok) return notify(result.error);
      // Fichas antigas sem nome herdam o nome do cartão, como no legado.
      const sheet = { ...defaultSheet(), ...result.sheet };
      if (!sheet.nm) sheet.nm = character.name;
      setOpen({ key: Date.now(), id: character.id, sheet });
    });
  }

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
        <button className="primary" onClick={create}>
          <Icon name="plus" />
          <span>{section.action}</span>
        </button>
      </div>

      <div className="section-line">
        <span>
          {section.list} <b>{characters.length}</b>
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
        {filtered.map((c) => (
          <article className="card" key={c.id}>
            <Icon name={section.icon} />
            <h2>{c.name}</h2>
            <p>{c.summary || 'Sem anotações.'}</p>
            <button
              className="secondary"
              aria-label={'Abrir / editar ' + c.name}
              onClick={() => openExisting(c)}
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
          {needle ? (
            <>
              <h2>Nenhum resultado encontrado.</h2>
              <p>Tente outro nome ou termo na busca.</p>
            </>
          ) : (
            <>
              <h2>
                Uma ficha em branco.
                <br />
                Infinitas possibilidades.
              </h2>
              <p>
                Todo herói tem um começo. Crie seu primeiro personagem
                <br className="desktop-break" /> e prepare-se para escrever o próximo capítulo.
              </p>
              <button className="primary" onClick={create}>
                <Icon name="plus" />
                <span>Criar meu personagem</span>
              </button>
            </>
          )}
          <span className="empty-foot">
            {needle ? 'Coleção pessoal' : 'Um nome. Uma origem. Uma nova lenda.'}
          </span>
        </section>
      )}
    </>
  );
}
