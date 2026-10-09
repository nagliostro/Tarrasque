/** Ficha D&D 5e: objeto aninhado, endereçado por caminhos (`ab.for`, `at.0.w`), como no legado. */
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
export const ABILITY_KEYS: readonly AbilityKey[] = ABILITIES.map(([k]) => k);
export const abilityName = (k: AbilityKey): string => ABILITIES.find(([key]) => key === k)![1];
export const isAbility = (v: unknown): v is AbilityKey => ABILITY_KEYS.includes(v as AbilityKey);

/** Perícias do Livro do Jogador e o atributo-base de cada uma (a ordem define o índice gravado). */
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
export const ALL_SKILLS: readonly number[] = SKILLS.map((_, i) => i);

/** Índices das perícias pelo nome; quebra cedo se um nome dos dados de regra estiver errado. */
export function skills(...names: string[]): number[] {
  return names.map((name) => {
    const i = SKILLS.findIndex(([n]) => n === name);
    if (i < 0) throw new Error('Perícia desconhecida: ' + name);
    return i;
  });
}

export function getPath(sheet: Sheet, path: string): unknown {
  let cur: unknown = sheet;
  for (const key of path.split('.')) {
    if (cur === null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

export const toNumber = (v: unknown): number => {
  if (v === '' || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Inteiro dentro de [min, max]; `undefined` se vazio ou fora do domínio. */
export function intIn(v: unknown, min: number, max: number): number | undefined {
  if (v === '' || v === null || v === undefined || typeof v === 'boolean') return undefined;
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
}

/** Inteiro limitado a [min, max]; `undefined` se vazio ou não inteiro. */
export function clampInt(v: unknown, min: number, max: number): number | undefined {
  if (v === '' || v === null || v === undefined || typeof v === 'boolean') return undefined;
  const n = Number(v);
  return Number.isInteger(n) ? Math.min(max, Math.max(min, n)) : undefined;
}

export const abilityModifier = (score: number): number => Math.floor((score - 10) / 2);

/** +N / −N (com sinal de menos tipográfico, como no legado). */
export const formatBonus = (n: number): string => (n >= 0 ? '+' : '−') + Math.abs(n);

export const clampLevel = (lvl: unknown): number =>
  Math.min(20, Math.max(1, Math.trunc(toNumber(lvl)) || 1));
export const proficiencyBonus = (lvl: unknown): number => Math.ceil(clampLevel(lvl) / 4) + 1;

/** Tabela de experiência do Livro do Jogador: PE mínimos de cada nível. */
export const XP_BY_LEVEL: readonly number[] = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000,
  195000, 225000, 265000, 305000, 355000,
];
export const levelForXp = (xp: number): number => {
  let level = 1;
  XP_BY_LEVEL.forEach((min, i) => {
    if (xp >= min) level = i + 1;
  });
  return level;
};

export interface Named {
  readonly id: string;
  readonly name: string;
}

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

/** Acha pelo id; aceita também o nome (fichas antigas guardavam o texto livre). */
export function findBy<T extends Named>(list: readonly T[], value: unknown): T | undefined {
  if (typeof value !== 'string' || value === '') return undefined;
  const v = fold(value);
  return list.find((x) => x.id === value) ?? list.find((x) => fold(x.name) === v);
}
