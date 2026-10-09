import { z } from 'zod';

export const SIDES = [4, 6, 8, 10, 12, 20, 100] as const;
export type Sides = (typeof SIDES)[number];

/** Ordem em que "Adicionar tipo de dado" procura o próximo tipo livre (como no legado). */
export const ADD_ORDER: readonly Sides[] = [6, 4, 8, 10, 12, 20, 100];

export const MAX_PER_TYPE = 10;
export const MAX_GROUPS = 70;
export const MAX_MODIFIER = 1000;
export const HISTORY_SIZE = 20;

export interface Group {
  quantity: number;
  sides: number;
}

export const rollInputSchema = z.object({
  groups: z
    .array(
      z.object({
        quantity: z.number().int().min(1).max(MAX_PER_TYPE),
        sides: z.number().refine((n) => (SIDES as readonly number[]).includes(n)),
      }),
    )
    .min(1)
    .max(MAX_GROUPS),
  modifier: z.number().int().min(-MAX_MODIFIER).max(MAX_MODIFIER),
});

export type RollInput = z.input<typeof rollInputSchema>;

export interface RollView {
  id: string;
  notation: string;
  total: number;
  values: number[];
  dice: number[];
  createdAt: string;
}

export type RollResult = { ok: true; roll: RollView } | { ok: false; error: string };

export function typeTotals(groups: Group[]): Record<number, number> {
  const totals: Record<number, number> = {};
  for (const g of groups) totals[g.sides] = (totals[g.sides] ?? 0) + g.quantity;
  return totals;
}

/** Primeiro tipo que passou de 10 dados somando os grupos, se houver. */
export function overLimit(groups: Group[]): number | undefined {
  const totals = typeTotals(groups);
  return SIDES.find((s) => (totals[s] ?? 0) > MAX_PER_TYPE);
}

export function limitMessage(sides: number): string {
  return 'Use no máximo ' + MAX_PER_TYPE + ' dados d' + sides + ', somando todos os grupos.';
}

/** Primeiro tipo que ainda não atingiu o limite; undefined se todos estiverem cheios. */
export function nextAvailable(groups: Group[]): Sides | undefined {
  const totals = typeTotals(groups);
  return ADD_ORDER.find((s) => (totals[s] ?? 0) < MAX_PER_TYPE);
}

export function expandDice(groups: Group[]): number[] {
  return groups.flatMap((g) => Array.from({ length: g.quantity }, () => g.sides));
}

export function expression(groups: Group[]): string {
  return groups.map((g) => g.quantity + 'd' + g.sides).join(' + ');
}

export function notation(groups: Group[], modifier: number): string {
  return expression(groups) + (modifier >= 0 ? '+' : '') + modifier;
}

/** Sorteio sem viés (rejeição) a partir de uma fonte de inteiros de 32 bits. */
export function rollDie(sides: number, random32: () => number): number {
  const limit = Math.floor(4294967296 / sides) * sides;
  let n: number;
  do n = random32();
  while (n >= limit);
  return (n % sides) + 1;
}

/** Só d20 naturais contam; total e modificador nunca. */
export function criticals(dice: number[], values: number[]): { hits: number; misses: number } {
  let hits = 0;
  let misses = 0;
  dice.forEach((sides, i) => {
    if (sides !== 20) return;
    if (values[i] === 20) hits++;
    else if (values[i] === 1) misses++;
  });
  return { hits, misses };
}

export function details(dice: number[], values: number[]): string {
  return values.map((v, i) => 'd' + dice[i] + ': ' + v).join(', ');
}
