/** Classes que têm lista de magias no Livro do Jogador. */
export const SPELL_CLASSES = {
  ba: 'Bardo',
  bx: 'Bruxo',
  cl: 'Clérigo',
  dr: 'Druida',
  fe: 'Feiticeiro',
  ma: 'Mago',
  pa: 'Paladino',
  pt: 'Patrulheiro',
} as const;
export type SpellClass = keyof typeof SPELL_CLASSES;

export const SCHOOLS = {
  abj: 'Abjuração',
  adi: 'Adivinhação',
  con: 'Conjuração',
  enc: 'Encantamento',
  evo: 'Evocação',
  ilu: 'Ilusão',
  nec: 'Necromancia',
  tra: 'Transmutação',
} as const;
export type School = keyof typeof SCHOOLS;

export interface Spell {
  id: string;
  name: string;
  /** 0 = truque. */
  circle: number;
  school: School;
  time: string;
  range: string;
  components: string;
  duration: string;
  ritual: boolean;
  concentration: boolean;
  classes: readonly SpellClass[];
  /** Resumo das regras (texto próprio, não a transcrição do livro). */
  text: string;
  /** Efeito ao conjurar em círculo maior (ou em níveis mais altos, nos truques). */
  higher?: string;
}

/** Linha de dados: nome, escola, tempo, alcance, componentes, duração, classes (separadas por espaço), resumo e, se houver, efeito em círculo maior. */
export type SpellRow = readonly [
  name: string,
  school: School,
  time: string,
  range: string,
  components: string,
  duration: string,
  classes: string,
  text: string,
  higher?: string,
];
