import { ABILITY_KEYS, getPath, intIn, type Sheet } from './core';

/** Método clássico (Livro do Jogador, cap. 1): 4d6 por atributo, descartando o menor dado. */
export const CLASSIC_DICE = 4;
export const CLASSIC_ROLLS = ABILITY_KEYS.length;

/** Os quatro dados de uma rolagem (1–6), na ordem em que saíram. */
export type ClassicRoll = readonly number[];

/** Índice do dado descartado: o menor; no empate, o primeiro. */
export function droppedIndex(roll: ClassicRoll): number {
  return roll.indexOf(Math.min(...roll));
}

export function classicTotal(roll: ClassicRoll): number {
  return roll.reduce((sum, d) => sum + d, 0) - Math.min(...roll);
}

/** Sorteio sem viés (rejeição) de 1 a `sides` a partir de inteiros de 32 bits. */
function rollDie(sides: number, random32: () => number): number {
  const limit = Math.floor(4294967296 / sides) * sides;
  let n: number;
  do n = random32();
  while (n >= limit);
  return (n % sides) + 1;
}

/** Uma rolagem: 4d6. */
export function rollClassicDice(random32: () => number): ClassicRoll {
  return Array.from({ length: CLASSIC_DICE }, () => rollDie(6, random32));
}

export function rollClassic(random32: () => number): ClassicRoll[] {
  return Array.from({ length: CLASSIC_ROLLS }, () => rollClassicDice(random32));
}

/** As rolagens guardadas na ficha, só se forem 6 grupos de 4 dados válidos; senão, nenhuma. */
export function readClassicRolls(raw: Sheet): ClassicRoll[] | undefined {
  const value = raw.dr;
  if (!Array.isArray(value) || value.length !== CLASSIC_ROLLS) return undefined;
  const rolls: ClassicRoll[] = [];
  for (const entry of value as unknown[]) {
    if (!Array.isArray(entry) || entry.length !== CLASSIC_DICE) return undefined;
    const dice = (entry as unknown[]).map((d) => intIn(d, 1, 6));
    if (dice.some((d) => d === undefined)) return undefined;
    rolls.push(dice as number[]);
  }
  return rolls;
}

/** Atribuição atributo → índice da rolagem; cada rolagem só pode ser usada uma vez. */
export function readClassicAssignment(raw: Sheet): Record<string, number | ''> {
  const used = new Set<number>();
  const out: Record<string, number | ''> = {};
  for (const k of ABILITY_KEYS) {
    const i = intIn(getPath(raw, 'da.' + k), 0, CLASSIC_ROLLS - 1);
    if (i !== undefined && !used.has(i)) {
      used.add(i);
      out[k] = i;
    } else out[k] = '';
  }
  return out;
}
