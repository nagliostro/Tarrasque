'use client';

import { useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import { DiceTray, rollDuration, useToast, type RollPhase, type Section } from '@/modules/shared';
import { rollDice } from '../application/actions';
import {
  HISTORY_SIZE,
  MAX_GROUPS,
  MAX_MODIFIER,
  MAX_PER_TYPE,
  SIDES,
  criticals,
  details,
  expandDice,
  expression,
  limitMessage,
  nextAvailable,
  typeTotals,
  type RollView,
} from '../domain/dice';

interface Props {
  section: Section;
  initialRolls: RollView[];
}

interface Row {
  key: number;
  quantity: string;
  sides: number;
}

const noopSubscribe = () => () => {};

/** Hora local só no cliente: o servidor não conhece o fuso do navegador. */
function Time({ iso }: { iso: string }) {
  const text = useSyncExternalStore(
    noopSubscribe,
    () => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    () => '',
  );
  return <>{text}</>;
}

function CriticalBadges({ roll }: { roll: Pick<RollView, 'dice' | 'values'> }) {
  const { hits, misses } = criticals(roll.dice, roll.values);
  if (!hits && !misses) return null;
  const items = [
    { count: hits, kind: 'hit', label: 'Acerto crítico', symbol: '✦', face: '20' },
    { count: misses, kind: 'miss', label: 'Erro crítico', symbol: '!', face: '1' },
  ].filter((i) => i.count);
  return (
    <span className="critical-badges">
      {items.map((i) => (
        <span key={i.kind} className={'critical-badge critical-' + i.kind}>
          {i.symbol} {i.label}
          {i.count > 1 ? ' ×' + i.count : ''} · {i.face} natural
        </span>
      ))}
    </span>
  );
}

export function DiceView({ section, initialRolls }: Props) {
  const notify = useToast();
  const [rows, setRows] = useState<Row[]>([{ key: 0, quantity: '1', sides: 20 }]);
  const [modifier, setModifier] = useState('0');
  const [phase, setPhase] = useState<RollPhase>('idle');
  const [current, setCurrent] = useState<RollView | null>(null);
  const [rolling, setRolling] = useState('');
  const [history, setHistory] = useState(initialRolls);
  const nextKey = useRef(1);
  const addRef = useRef<HTMLButtonElement>(null);
  const sidesRefs = useRef(new Map<number, HTMLSelectElement>());

  const groups = rows.map((r) => ({ quantity: Number(r.quantity), sides: r.sides }));
  const validQuantities = rows.every((r) => {
    const n = Number(r.quantity);
    return r.quantity.trim() !== '' && Number.isInteger(n) && n >= 1 && n <= MAX_PER_TYPE;
  });
  const totals = typeTotals(groups);
  const withinLimit = Object.values(totals).every((n) => n <= MAX_PER_TYPE);
  const validForm = validQuantities && withinLimit;
  const count = groups.reduce((n, g) => n + (Number.isFinite(g.quantity) ? g.quantity : 0), 0);
  const busy = phase === 'rolling';

  // Dados exibidos: o resultado em tela, ou a pré-visualização do formulário (faces ocultas).
  const shown =
    phase === 'settled' && current
      ? { dice: current.dice, values: current.values as (number | undefined)[] }
      : { dice: validForm ? expandDice(groups) : [], values: [] as (number | undefined)[] };

  function edit(update: () => void) {
    if (busy) return;
    update();
    setPhase('idle');
    setCurrent(null);
  }

  function addRow() {
    const sides = nextAvailable(groups);
    if (sides === undefined) return;
    const key = nextKey.current++;
    edit(() => setRows((r) => [...r, { key, quantity: '1', sides }]));
    requestAnimationFrame(() => sidesRefs.current.get(key)?.focus());
  }

  function removeRow(index: number) {
    if (busy) return;
    const previous = rows[index - 1];
    edit(() => setRows((r) => r.filter((_, i) => i !== index)));
    requestAnimationFrame(() =>
      (previous ? sidesRefs.current.get(previous.key) : addRef.current)?.focus(),
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const mod = Number(modifier);
    if (
      busy ||
      !validForm ||
      modifier.trim() === '' ||
      !Number.isInteger(mod) ||
      Math.abs(mod) > MAX_MODIFIER
    )
      return;
    setCurrent(null);
    setRolling('Rolando ' + expression(groups) + '…');
    setPhase('rolling');
    const duration = rollDuration();
    try {
      const [result] = await Promise.all([
        rollDice({ groups, modifier: mod }),
        new Promise((resolve) => setTimeout(resolve, duration)),
      ]);
      if (!result.ok) {
        notify(result.error);
        setPhase('idle');
        return;
      }
      setCurrent(result.roll);
      setHistory((h) => [result.roll, ...h].slice(0, HISTORY_SIZE));
      setPhase('settled');
    } catch {
      notify('Não foi possível rolar os dados.');
      setPhase('idle');
    }
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
      </div>

      <section id="dice-tool">
        <div className="dice-panel">
          <h2>Rolador de dados</h2>
          <form className="dice-controls mixed-controls" onSubmit={submit}>
            <div className="dice-groups">
              {rows.map((row, i) => {
                const over = (totals[row.sides] ?? 0) > MAX_PER_TYPE;
                return (
                  <div className="dice-group" key={row.key}>
                    <label>
                      Quantidade
                      <input
                        className="dice-quantity"
                        type="number"
                        min={1}
                        max={MAX_PER_TYPE}
                        required
                        disabled={busy}
                        value={row.quantity}
                        ref={(el) => el?.setCustomValidity(over ? limitMessage(row.sides) : '')}
                        onChange={(e) =>
                          edit(() =>
                            setRows((r) =>
                              r.map((x, j) => (j === i ? { ...x, quantity: e.target.value } : x)),
                            ),
                          )
                        }
                      />
                    </label>
                    <label>
                      Dado
                      <select
                        className="dice-sides"
                        disabled={busy}
                        value={row.sides}
                        ref={(el) => {
                          if (el) sidesRefs.current.set(row.key, el);
                          else sidesRefs.current.delete(row.key);
                        }}
                        onChange={(e) =>
                          edit(() =>
                            setRows((r) =>
                              r.map((x, j) =>
                                j === i ? { ...x, sides: Number(e.target.value) } : x,
                              ),
                            ),
                          )
                        }
                      >
                        {SIDES.map((n) => (
                          <option key={n} value={n}>
                            d{n}
                          </option>
                        ))}
                      </select>
                    </label>
                    {i > 0 && (
                      <button
                        type="button"
                        className="secondary remove-dice"
                        aria-label="Remover grupo de dados"
                        disabled={busy}
                        onClick={() => removeRow(i)}
                      >
                        Remover
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              ref={addRef}
              className="secondary"
              type="button"
              disabled={busy || count >= MAX_GROUPS || rows.length >= MAX_GROUPS}
              onClick={addRow}
            >
              + Adicionar tipo de dado
            </button>
            <p className="hint dice-limit">
              Escolha até {MAX_PER_TYPE} dados de cada tipo disponível.
            </p>
            <div className="dice-actions">
              <label>
                Modificador total
                <input
                  type="number"
                  min={-MAX_MODIFIER}
                  max={MAX_MODIFIER}
                  required
                  disabled={busy}
                  value={modifier}
                  onChange={(e) => edit(() => setModifier(e.target.value))}
                />
              </label>
              <button id="roll-button" className="primary" type="submit" disabled={busy}>
                {busy ? 'Rolando…' : phase === 'settled' ? 'Rolar novamente' : 'Rolar dados'}
              </button>
            </div>
          </form>

          <DiceTray dice={shown.dice} values={shown.values} phase={phase} />

          <output id="roll-result" aria-live="polite" aria-atomic="true">
            {phase === 'rolling' && rolling}
            {phase === 'settled' && current && (
              <>
                {current.notation} = {current.total} · Dados:{' '}
                {details(current.dice, current.values)}
                <CriticalBadges roll={current} />
              </>
            )}
          </output>
        </div>

        <div className="section-line">
          <span>Últimas {HISTORY_SIZE} rolagens</span>
        </div>
        <ol className="roll-history">
          {history.map((roll) => (
            <li key={roll.id}>
              <Time iso={roll.createdAt} /> · {roll.notation} = {roll.total} [
              {details(roll.dice, roll.values)}]
              <CriticalBadges roll={roll} />
            </li>
          ))}
          {history.length === 0 && <li>Nenhuma rolagem nesta sessão de aventuras.</li>}
        </ol>
      </section>
    </>
  );
}
