'use client';

import { useLayoutEffect, useRef, type CSSProperties } from 'react';

export type RollPhase = 'idle' | 'rolling' | 'settled';

/** Duração da animação de rolagem (curta com `prefers-reduced-motion`). */
export const rollDuration = (): number =>
  matchMedia('(prefers-reduced-motion: reduce)').matches ? 450 : 2050;

const SHAPES: Record<number, string> = {
  4: '<path d="M40 7 73 67H7Z"/><path class="die-facets" d="m40 7 0 41L7 67m33-19 33 19"/>',
  6: '<rect x="13" y="13" width="54" height="54" rx="9"/><path class="die-facets" d="m18 18 7 7m37-7-7 7m-37 37 7-7m37 7-7-7"/>',
  8: '<path d="m40 5 32 35-32 35L8 40Z"/><path class="die-facets" d="m40 5-19 35 19 35 19-35Z"/>',
  10: '<path d="m40 5 32 26-8 32-24 12L16 63 8 31Z"/><path class="die-facets" d="m8 31 14-9 18-17 18 17 14 9M16 63l6-41m42 41-6-41M16 63l24-9 24 9"/>',
  12: '<path d="m40 5 24 10 11 25-11 25-24 10-24-10L5 40l11-25Z"/><path class="die-facets" d="m40 17 22 16-8 26H26l-8-26Zm0-12v12m24-2-2 18m13 7-13-7m2 32-10-6M40 75l14-16m-14 16-14-16m-10 6 10-6M5 40l13-7m-2-18 2 18"/>',
  20: '<path d="m40 5 31 18v34L40 75 9 57V23Z"/><path class="die-facets" d="m40 5-19 23H9m12 0-12 29 20 2 11 16 11-16 20-2-12-29H21m38 0L40 5M29 59h22"/>',
};

const SHADING: Record<number, string> = {
  4: '<path class="die-light" d="M40 7 7 67 40 48Z"/><path class="die-dark" d="m40 7 33 60-33-19Z"/>',
  6: '<path class="die-light" d="M13 22q0-9 9-9h36q9 0 9 9l-9 5H24Z"/><path class="die-dark" d="m58 27 9-5v36q0 9-9 9l-7-9Z"/>',
  8: '<path class="die-light" d="M40 5 8 40h13Z"/><path class="die-dark" d="m40 5 32 35-32 35 19-35Z"/>',
  10: '<path class="die-light" d="M40 5 8 31l14-9Z"/><path class="die-dark" d="m58 22 14 9-8 32-24 12 0-21 24 9Z"/>',
  12: '<path class="die-light" d="m40 5 24 10-2 18-22-16-22 16-2-18Z"/><path class="die-dark" d="m62 33 13 7-11 25-24 10 14-16Z"/>',
  20: '<path class="die-light" d="M40 5 9 23l12 5 38 0Z"/><path class="die-dark" d="m59 28 12-5v34L40 75l11-16Z"/>',
};

function Die({
  sides,
  index,
  value,
  discarded,
}: {
  sides: number;
  index: number;
  value: number | undefined;
  discarded: boolean;
}) {
  const shape = sides === 100 ? 10 : sides;
  const critical = value !== undefined && sides === 20 && (value === 20 || value === 1);
  const hit = critical && value === 20;
  const style = {
    '--delay': (index % 6) * 35 + 'ms',
    '--tilt': (index % 2 ? 1 : -1) * (12 + (index % 4) * 4) + 'deg',
  } as CSSProperties;
  return (
    <div
      className={
        'die' +
        (discarded
          ? ' critical-miss discarded'
          : critical
            ? hit
              ? ' critical-hit'
              : ' critical-miss'
            : '')
      }
      style={style}
    >
      <span className="die-shadow" />
      <div className="die-flight">
        <div className="die-body">
          <svg
            viewBox="0 0 80 80"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: SHAPES[shape]! + SHADING[shape]! }}
          />
          <span className="die-value">{value ?? '·'}</span>
        </div>
      </div>
      <span className="die-caption">
        {discarded
          ? '✕ DESCARTADO'
          : critical
            ? hit
              ? '✦ CRÍTICO'
              : '! ERRO CRÍTICO'
            : 'd' + sides}
      </span>
    </div>
  );
}

interface DiceTrayProps {
  dice: readonly number[];
  /** Faces reveladas (índice = dado); vazio enquanto não há resultado. */
  values: readonly (number | undefined)[];
  phase: RollPhase;
  /** Índice do dado a destacar como descartado (ex.: o menor do 4d6). */
  discarded?: number;
}

/** A mesa de dados animada: os dados correm da esquerda, quicam e revelam o resultado. */
export function DiceTray({ dice, values, phase, discarded }: DiceTrayProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Cada dado parte da borda esquerda da mesa e viaja até o seu lugar.
  useLayoutEffect(() => {
    const tray = ref.current;
    if (phase !== 'rolling' || !tray) return;
    const els = [...tray.querySelectorAll<HTMLElement>('.die')];
    // Zera o valor da rolagem anterior: a animação já está ativa e deslocaria a medição.
    for (const el of els) el.style.setProperty('--travel-from', '0px');
    const left = tray.getBoundingClientRect().left;
    const offsets = els.map((el) => left - el.getBoundingClientRect().left);
    els.forEach((el, i) => el.style.setProperty('--travel-from', offsets[i] + 'px'));
  }, [phase]);

  return (
    <div className="dice-table">
      <div
        ref={ref}
        className={
          'dice-tray' + (phase === 'rolling' ? ' rolling' : phase === 'settled' ? ' settled' : '')
        }
        aria-hidden="true"
      >
        {dice.map((sides, i) => (
          <Die
            key={i}
            sides={sides}
            index={i}
            value={values[i]}
            discarded={phase === 'settled' && discarded === i}
          />
        ))}
      </div>
    </div>
  );
}
