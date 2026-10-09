import type { CasterKind } from './classes';

/** Espaços por círculo (1º, 2º, ...), indexados pelo nível de conjurador menos 1 (Livro do Jogador). */
const FULL: readonly (readonly number[])[] = [
  [2],
  [3],
  [4, 2],
  [4, 3],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];
const HALF: readonly (readonly number[])[] = [
  [],
  [2],
  [3],
  [3],
  [4, 2],
  [4, 2],
  [4, 3],
  [4, 3],
  [4, 3, 2],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2],
];
const THIRD: readonly (readonly number[])[] = [
  [],
  [],
  [2],
  [3],
  [3],
  [3],
  [4, 2],
  [4, 2],
  [4, 2],
  [4, 3],
  [4, 3],
  [4, 3],
  [4, 3, 2],
  [4, 3, 2],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 1],
];
/** Magia de Pacto do Bruxo: [quantidade, círculo], todos do mesmo círculo. */
const PACT: readonly (readonly [number, number])[] = [
  [1, 1],
  [2, 1],
  [2, 2],
  [2, 2],
  [2, 3],
  [2, 3],
  [2, 4],
  [2, 4],
  [2, 5],
  [2, 5],
  [3, 5],
  [3, 5],
  [3, 5],
  [3, 5],
  [3, 5],
  [3, 5],
  [4, 5],
  [4, 5],
  [4, 5],
  [4, 5],
];

/** Espaços de magia por círculo: `{ 1: 4, 2: 3 }`. */
export function spellSlots(kind: CasterKind, level: number): Record<number, number> {
  const i = Math.min(20, Math.max(1, level)) - 1;
  if (kind === 'pact') {
    const [count, circle] = PACT[i]!;
    return { [circle]: count };
  }
  const row = (kind === 'full' ? FULL : kind === 'half' ? HALF : THIRD)[i]!;
  return Object.fromEntries(row.map((n, c) => [c + 1, n]));
}

const step = (level: number, ...levels: number[]) => levels.filter((l) => level >= l).length;

/** Truques conhecidos por classe (ou subclasse conjuradora) e nível. */
export function cantripsKnown(id: string, level: number): number {
  switch (id) {
    case 'bardo':
    case 'bruxo':
    case 'druida':
      return 2 + step(level, 4, 10);
    case 'clerigo':
    case 'mago':
      return 3 + step(level, 4, 10);
    case 'feiticeiro':
      return 4 + step(level, 4, 10);
    case 'cavaleiro-mistico':
      return level >= 3 ? 2 + step(level, 10) : 0;
    case 'trapaceiro-arcano':
      return level >= 3 ? 3 + step(level, 10) : 0;
    default:
      return 0;
  }
}

const BARD = [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22];
const SORCERER = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];
const WARLOCK = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
const RANGER = [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11];
const THIRD_KNOWN = [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13];

/** Magias conhecidas, para as classes que escolhem uma lista fixa. */
export function spellsKnown(id: string, level: number): number | undefined {
  const i = Math.min(20, Math.max(1, level)) - 1;
  switch (id) {
    case 'bardo':
      return BARD[i];
    case 'feiticeiro':
      return SORCERER[i];
    case 'bruxo':
      return WARLOCK[i];
    case 'patrulheiro':
      return RANGER[i];
    case 'cavaleiro-mistico':
    case 'trapaceiro-arcano':
      return THIRD_KNOWN[i];
    default:
      return undefined;
  }
}

/** Magias de domínio, juramento ou círculo, sempre preparadas e fora do limite de preparo. */
export function bonusPrepared(classId: string, subclassId: string, level: number): number {
  if (!subclassId) return 0;
  if (classId === 'clerigo') return 2 * step(level, 1, 3, 5, 7, 9);
  if (classId === 'paladino') return 2 * step(level, 3, 5, 9, 13, 17);
  if (classId === 'druida' && subclassId === 'terra') return 2 * step(level, 3, 5, 7, 9);
  return 0;
}
