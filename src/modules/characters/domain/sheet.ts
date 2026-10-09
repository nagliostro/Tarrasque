import { z } from 'zod';
import { resolve } from './rules/build';
import { ABILITY_KEYS, type Sheet } from './rules/core';

export * from './rules/core';
export {
  ABILITY_CAP,
  CANTRIP_LINES,
  MAX_ATTACK_ROWS,
  MIN_ATTACK_ROWS,
  POINT_BUY_BUDGET,
  POINT_BUY_MAX,
  POINT_BUY_MIN,
  SPELL_LINES,
  STANDARD_ARRAY,
  normalizeSheet,
  pointCost,
  resolve,
  type AbilityBreakdown,
  type AttackRow,
  type Build,
  type SpellBuild,
} from './rules/build';
export {
  CLASSIC_DICE,
  CLASSIC_ROLLS,
  classicTotal,
  droppedIndex,
  rollClassic,
  rollClassicDice,
  type ClassicRoll,
} from './rules/classic';
export { CLASSES, FIGHTING_STYLES } from './rules/classes';
export { ARMORS, MAX_MAGIC_BONUS, WEAPONS } from './rules/equipment';
export { ALIGNMENTS, BACKGROUNDS, RACES } from './rules/lineage';

export const COINS = [
  ['pc', 'PC', 'Cobre'],
  ['pp', 'PP', 'Prata'],
  ['pe', 'PE', 'Electro'],
  ['po', 'PO', 'Ouro'],
  ['pl', 'PL', 'Platina'],
] as const;

export const PROF_LABELS = ['sem proficiência', 'proficiente', 'especialista'] as const;
export const PROF_SYMBOLS = ['○', '●', '◆'] as const;

export const MAX_CHARACTERS_PER_USER = 200;
/** Limite do JSON serializado da ficha (as 3 páginas cheias ficam muito abaixo disso). */
export const MAX_SHEET_BYTES = 200_000;
export const QUOTA_MESSAGE =
  'Você atingiu o limite de ' + MAX_CHARACTERS_PER_USER + ' personagens.';

/** Ficha nova: compra de pontos com todos os atributos em 8 (nenhum ponto gasto). */
export function defaultSheet(): Sheet {
  return {
    abm: 'pb',
    ab: Object.fromEntries(ABILITY_KEYS.map((k) => [k, 8])),
    lvl: 1,
    atN: 3,
  };
}

export function setPath(sheet: Sheet, path: string, value: unknown): Sheet {
  const [head, ...rest] = path.split('.') as [string, ...string[]];
  if (head === '__proto__' || head === 'constructor' || head === 'prototype') return sheet;
  if (rest.length === 0) return { ...sheet, [head]: value };
  const child = sheet[head];
  const base = child !== null && typeof child === 'object' ? (child as Sheet) : {};
  return { ...sheet, [head]: setPath(base, rest.join('.'), value) };
}

export const characterName = (sheet: Sheet): string =>
  (typeof sheet.nm === 'string' ? sheet.nm.trim() : '') || 'Personagem sem nome';

/** Resumo do cartão: "Raça · Classe Nível", antecedente, PV e CA (uma informação por linha). */
export function summarize(sheet: Sheet): string {
  const b = resolve(sheet);
  const lineage = b.subrace?.name ?? b.race?.name ?? '';
  const identity = [lineage, b.cls && b.cls.name + ' ' + b.level].filter(Boolean).join(' · ');
  const hp =
    b.hpMax === null ? '' : 'PV ' + (b.sheet.hpc === '' ? b.hpMax : b.sheet.hpc) + '/' + b.hpMax;
  const ac = b.ac === null ? '' : 'CA ' + b.ac;
  return [identity, b.background?.name, hp, ac].filter(Boolean).join('\n') || 'Ficha em branco.';
}

export const sheetSchema = z
  .record(z.string().max(40), z.unknown())
  .refine((s) => JSON.stringify(s).length <= MAX_SHEET_BYTES, 'A ficha é grande demais.');

export type ActionResult = { ok: true } | { ok: false; error: string };
export type SaveResult = { ok: true; id: string } | { ok: false; error: string };

export interface CharacterSummary {
  id: string;
  name: string;
  summary: string;
}
