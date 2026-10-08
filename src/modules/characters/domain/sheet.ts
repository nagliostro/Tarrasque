import { z } from 'zod';

/** Ficha D&D 5e: objeto aninhado, endereçado por caminhos (`ab.for`, `at.0.n`), como no legado. */
export type Sheet = Record<string, unknown>;

export const ABILITIES = [
  ['for', 'Força'],
  ['des', 'Destreza'],
  ['con', 'Constituição'],
  ['int', 'Inteligência'],
  ['sab', 'Sabedoria'],
  ['car', 'Carisma'],
] as const;
export type AbilityKey = (typeof ABILITIES)[number][0];

export const SKILLS: readonly (readonly [string, AbilityKey])[] = [
  ['Acrobacia', 'des'],
  ['Adestrar Animais', 'sab'],
  ['Arcanismo', 'int'],
  ['Atletismo', 'for'],
  ['Atuação', 'car'],
  ['Enganação', 'car'],
  ['Furtividade', 'des'],
  ['História', 'int'],
  ['Intimidação', 'car'],
  ['Intuição', 'sab'],
  ['Investigação', 'int'],
  ['Medicina', 'sab'],
  ['Natureza', 'int'],
  ['Percepção', 'sab'],
  ['Persuasão', 'car'],
  ['Prestidigitação', 'des'],
  ['Religião', 'int'],
  ['Sobrevivência', 'sab'],
];
export const PERCEPTION_INDEX = 13;

/** Linhas de magia por nível (1–9). */
export const SPELL_LINES: Record<number, number> = {
  1: 13,
  2: 13,
  3: 13,
  4: 13,
  5: 9,
  6: 9,
  7: 9,
  8: 7,
  9: 7,
};
export const CANTRIP_LINES = 8;

export const COINS = [
  ['pc', 'PC', 'Cobre'],
  ['pp', 'PP', 'Prata'],
  ['pe', 'PE', 'Electro'],
  ['po', 'PO', 'Ouro'],
  ['pl', 'PL', 'Platina'],
] as const;

export const PROF_LABELS = ['sem proficiência', 'proficiente', 'especialista'] as const;
export const PROF_SYMBOLS = ['○', '●', '◆'] as const;

export const MIN_ATTACK_ROWS = 3;
export const MAX_ATTACK_ROWS = 30;
export const MAX_CHARACTERS_PER_USER = 200;
/** Limite do JSON serializado da ficha (as 3 páginas cheias ficam muito abaixo disso). */
export const MAX_SHEET_BYTES = 200_000;
export const QUOTA_MESSAGE =
  'Você atingiu o limite de ' + MAX_CHARACTERS_PER_USER + ' personagens.';

export function defaultSheet(): Sheet {
  return { ab: Object.fromEntries(ABILITIES.map(([k]) => [k, 10])), lvl: 1, atN: MIN_ATTACK_ROWS };
}

export function getPath(sheet: Sheet, path: string): unknown {
  let cur: unknown = sheet;
  for (const key of path.split('.')) {
    if (cur === null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

/** Devolve uma cópia com o valor gravado em `path` (imutável, para uso em estado React). */
export function setPath(sheet: Sheet, path: string, value: unknown): Sheet {
  const [head, ...rest] = path.split('.') as [string, ...string[]];
  if (head === '__proto__' || head === 'constructor' || head === 'prototype') return sheet;
  if (rest.length === 0) return { ...sheet, [head]: value };
  const child = sheet[head];
  const base = child !== null && typeof child === 'object' ? (child as Sheet) : {};
  return { ...sheet, [head]: setPath(base, rest.join('.'), value) };
}

export const toNumber = (v: unknown): number => {
  if (v === '' || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const abilityModifier = (score: number): number => Math.floor((score - 10) / 2);

/** +N / −N (com sinal de menos tipográfico, como no legado). */
export const formatBonus = (n: number): string => (n >= 0 ? '+' : '−') + Math.abs(n);

export const clampLevel = (lvl: unknown): number => Math.min(20, Math.max(1, toNumber(lvl) || 1));
export const proficiencyBonus = (lvl: unknown): number => Math.ceil(clampLevel(lvl) / 4) + 1;

export interface Derived {
  proficiency: number;
  mods: Record<AbilityKey, number>;
  saves: Record<AbilityKey, number>;
  skills: number[];
  passivePerception: number;
  initiative: number;
  spellDc: number | null;
  spellAttack: number | null;
}

export function derive(sheet: Sheet): Derived {
  const pb = proficiencyBonus(sheet.lvl);
  const mods = {} as Record<AbilityKey, number>;
  const saves = {} as Record<AbilityKey, number>;
  for (const [k] of ABILITIES) {
    mods[k] = abilityModifier(toNumber(getPath(sheet, 'ab.' + k)));
    saves[k] = mods[k] + (toNumber(getPath(sheet, 'sv.' + k)) ? pb : 0);
  }
  const skills = SKILLS.map(([, a], i) => mods[a] + pb * toNumber(getPath(sheet, 'sk.' + i)));
  const sa = sheet.sa;
  const spellMod =
    typeof sa === 'string' && Object.hasOwn(mods, sa) ? mods[sa as AbilityKey] : null;
  return {
    proficiency: pb,
    mods,
    saves,
    skills,
    passivePerception: 10 + (skills[PERCEPTION_INDEX] ?? 0),
    initiative: mods.des,
    spellDc: spellMod === null ? null : 8 + pb + spellMod,
    spellAttack: spellMod === null ? null : pb + spellMod,
  };
}

export const characterName = (sheet: Sheet): string =>
  (typeof sheet.nm === 'string' ? sheet.nm.trim() : '') || 'Personagem sem nome';

const hasValue = (v: unknown) => v !== undefined && v !== null && v !== '';
const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

/** Resumo do cartão: "Raça · Classe Nível", antecedente, PV e CA (uma informação por linha). */
export function summarize(sheet: Sheet): string {
  const lvl = toNumber(sheet.lvl) || 1;
  const cl = text(sheet.cl);
  const identity = [text(sheet.rc), cl && cl + ' ' + lvl].filter(Boolean).join(' · ');
  const hp = hasValue(sheet.hpm)
    ? 'PV ' + (hasValue(sheet.hpc) ? sheet.hpc : sheet.hpm) + '/' + sheet.hpm
    : '';
  const ac = hasValue(sheet.ca) ? 'CA ' + sheet.ca : '';
  return [identity, text(sheet.bg), hp, ac].filter(Boolean).join('\n') || 'Ficha em branco.';
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
