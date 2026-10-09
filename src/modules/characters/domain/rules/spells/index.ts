import { C0 } from './c0';
import { C1 } from './c1';
import { C2 } from './c2';
import { C3 } from './c3';
import { C4 } from './c4';
import { C5 } from './c5';
import { C6 } from './c6';
import { C7 } from './c7';
import { C8 } from './c8';
import { C9 } from './c9';
import type { Spell, SpellClass, SpellRow } from './types';

export { SCHOOLS, SPELL_CLASSES, type School, type Spell, type SpellClass } from './types';

const slug = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const make = (circle: number, rows: readonly SpellRow[]): Spell[] =>
  rows.map(([name, school, time, range, components, duration, classes, text, higher]) => ({
    id: slug(name),
    name,
    circle,
    school,
    time,
    range,
    components,
    duration,
    ritual: time.includes('ritual'),
    concentration: duration.startsWith('Concentração'),
    classes: classes.split(' ') as SpellClass[],
    text,
    higher,
  }));

/** Todas as magias do Livro do Jogador (edição 2014), em ordem de círculo e nome. */
export const SPELLS: readonly Spell[] = [C0, C1, C2, C3, C4, C5, C6, C7, C8, C9].flatMap(
  (rows, i) => make(i, rows).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
);

const BY_NAME = new Map(SPELLS.map((s) => [s.name.toLowerCase(), s]));

export const findSpell = (name: string): Spell | undefined =>
  BY_NAME.get(name.trim().toLowerCase());

/** Magias de um círculo na lista da classe. */
export const spellsFor = (list: SpellClass, circle: number): Spell[] =>
  SPELLS.filter((s) => s.circle === circle && s.classes.includes(list));

/** Lista de magias usada pela classe (as subclasses conjuradoras usam a do Mago). */
export function spellListOf(classId: string): SpellClass | undefined {
  switch (classId) {
    case 'bardo':
      return 'ba';
    case 'bruxo':
      return 'bx';
    case 'clerigo':
      return 'cl';
    case 'druida':
      return 'dr';
    case 'feiticeiro':
      return 'fe';
    case 'mago':
    case 'cavaleiro-mistico':
    case 'trapaceiro-arcano':
      return 'ma';
    case 'paladino':
      return 'pa';
    case 'patrulheiro':
      return 'pt';
    default:
      return undefined;
  }
}
