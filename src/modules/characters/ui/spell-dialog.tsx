'use client';

import { useState } from 'react';
import { Dialog } from '@/modules/shared';
import { SCHOOLS, SPELL_CLASSES, type Spell } from '../domain/sheet';

export interface CastControl {
  /** Círculos com espaço livre, a partir do círculo da magia. */
  options: { circle: number; left: number }[];
  /** Magia do grimório ainda não preparada. */
  blocked: boolean;
  onCast: (circle: number) => void;
}

/** Detalhes de uma magia, para leitura, com a opção de conjurá-la gastando um espaço. */
export function SpellDialog({
  spell,
  onClose,
  cast,
}: {
  spell: Spell | null;
  onClose: () => void;
  cast?: CastControl;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const kind = spell
    ? spell.circle === 0
      ? `Truque de ${SCHOOLS[spell.school].toLowerCase()}`
      : `${spell.circle}º círculo de ${SCHOOLS[spell.school].toLowerCase()}`
    : '';
  const rows: [string, string][] = spell
    ? [
        ['Tempo de conjuração', spell.time],
        ['Alcance', spell.range],
        ['Componentes', spell.components],
        ['Duração', spell.duration],
        ['Classes', spell.classes.map((c) => SPELL_CLASSES[c]).join(', ')],
      ]
    : [];
  return (
    <Dialog
      open={spell !== null}
      title={spell?.name ?? 'Magia'}
      onClose={onClose}
      onSubmit={onClose}
      readOnly
    >
      {spell && (
        <div className="spell-info">
          <p className="hint">
            {kind}
            {spell.ritual && ' (ritual)'}
            {spell.concentration && ' · concentração'}
          </p>
          <dl>
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p>{spell.text}</p>
          {spell.higher && (
            <p>
              <strong>Em níveis ou círculos mais altos.</strong> {spell.higher}
            </p>
          )}
          {cast && (
            <div className="spell-cast">
              {cast.blocked ? (
                <p className="hint">Prepare a magia para conjurá-la.</p>
              ) : cast.options.length === 0 ? (
                <p className="hint">Sem espaços de magia disponíveis.</p>
              ) : (
                <>
                  <label className="sf">
                    <span>Conjurar com espaço do círculo</span>
                    <select
                      aria-label="Círculo da conjuração"
                      value={picked ?? cast.options[0]!.circle}
                      onChange={(e) => setPicked(Number(e.target.value))}
                    >
                      {cast.options.map((o) => (
                        <option key={o.circle} value={o.circle}>
                          {o.circle}º círculo ({o.left} restantes)
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      cast.onCast(
                        cast.options.some((o) => o.circle === picked)
                          ? picked!
                          : cast.options[0]!.circle,
                      );
                      onClose();
                    }}
                  >
                    Conjurar
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}
