'use client';

import { useEffect, useRef, useState } from 'react';
import { DiceTray, Dialog, rollDuration, type RollPhase } from '@/modules/shared';
import {
  CLASSIC_DICE,
  CLASSIC_ROLLS,
  classicTotal,
  droppedIndex,
  rollClassicDice,
  type ClassicRoll,
} from '../domain/sheet';
import type { SheetBinding } from './sheet-fields';

interface Props {
  b: SheetBinding;
  open: boolean;
  onClose: () => void;
}

const random32 = () => crypto.getRandomValues(new Uint32Array(1))[0]!;
const BLANK = Array.from({ length: CLASSIC_DICE }, () => 6);

/**
 * Método clássico: 4d6 para cada atributo, descartando o menor dado. O jogador rola uma vez por
 * atributo (6 rolagens); só depois da sexta as rolagens vão para a ficha, e nunca se rola de novo.
 */
export function ClassicDialog({ b, open, onClose }: Props) {
  const saved = b.build.classicRolls;
  const [partial, setPartial] = useState<ClassicRoll[]>([]);
  const [phase, setPhase] = useState<RollPhase>('idle');
  const [last, setLast] = useState<ClassicRoll | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const rolls = saved ?? partial;
  const busy = phase === 'rolling';
  const shown = last ?? saved?.[saved.length - 1] ?? null;
  const settled = shown !== null && !busy;

  function roll() {
    if (saved || busy) return;
    const next = rollClassicDice(random32);
    setLast(next);
    setPhase('rolling');
    timer.current = setTimeout(() => {
      const all = [...partial, next];
      setPhase('settled');
      setPartial(all);
      if (all.length === CLASSIC_ROLLS) b.set('dr', all);
    }, rollDuration());
  }

  const dropped = shown ? droppedIndex(shown) : undefined;

  return (
    <Dialog
      open={open}
      title="Rolar atributos"
      onClose={onClose}
      onSubmit={onClose}
      submitLabel="Concluir"
      wide
    >
      <p className="hint">
        Role 4d6 para cada atributo (seis rolagens) e o menor dado é descartado. Depois, escolha na
        ficha qual valor vai para qual atributo.
      </p>
      <DiceTray
        dice={BLANK}
        values={settled && shown ? shown : []}
        phase={saved && !busy ? 'settled' : phase}
        discarded={dropped}
      />
      {!saved && (
        <button type="button" className="primary classic-roll" disabled={busy} onClick={roll}>
          {busy ? 'Rolando…' : 'Rolar atributo ' + (partial.length + 1) + ' de ' + CLASSIC_ROLLS}
        </button>
      )}
      <ol className="classic-list" aria-live="polite">
        {rolls.map((r, i) => {
          const drop = droppedIndex(r);
          return (
            <li key={i} className="classic-row">
              <span className="classic-label">Rolagem {i + 1}</span>
              <span className="classic-dice">
                {r.map((d, n) => (
                  <span
                    key={n}
                    className={'classic-die' + (n === drop ? ' dropped' : '')}
                    title={n === drop ? 'Descartado' : undefined}
                  >
                    {d}
                    {n === drop && <span className="sr-only"> (descartado)</span>}
                  </span>
                ))}
              </span>
              <output className="classic-total" aria-label={'Total da rolagem ' + (i + 1)}>
                {classicTotal(r)}
              </output>
            </li>
          );
        })}
      </ol>
      {saved && (
        <p className="hint classic-sum">
          Valores:{' '}
          {saved
            .map(classicTotal)
            .sort((x, y) => y - x)
            .join(' · ')}
        </p>
      )}
    </Dialog>
  );
}
