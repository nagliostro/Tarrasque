import { skills, type AbilityKey, type Named } from './core';
import type { ArmorCategory } from './classes';

type Bonuses = Partial<Record<AbilityKey, number>>;

export interface SubraceDef extends Named {
  asi: Bonuses;
  /** Substitui o deslocamento da raça (em pés). */
  speed?: number;
  weapons?: readonly string[];
  armor?: readonly ArmorCategory[];
  /** PV extra por nível (Anão da Colina). */
  hpPerLevel?: number;
  /** Truques extras (Alto Elfo). */
  extraCantrips?: number;
}

export interface RaceDef extends Named {
  /** Deslocamento em pés; a ficha mostra em metros (30 pés = 9 m). */
  speed: number;
  asi: Bonuses;
  /** Atributos escolhidos pelo jogador, +1 cada, exceto os listados (Meio-Elfo). */
  asiChoice?: { count: number; exclude: readonly AbilityKey[] };
  skills: readonly number[];
  /** Perícias à escolha (Meio-Elfo). */
  skillChoices?: number;
  weapons: readonly string[];
  /** Anões não perdem deslocamento com armadura pesada. */
  ignoresHeavyArmorSlow?: boolean;
  subraceLabel?: string;
  subraces: readonly SubraceDef[];
}

const ELF_WEAPONS = ['espada-longa', 'espada-curta', 'arco-curto', 'arco-longo'];

export const RACES: readonly RaceDef[] = [
  {
    id: 'anao',
    name: 'Anão',
    speed: 25,
    asi: { con: 2 },
    skills: [],
    weapons: ['machado-de-batalha', 'machadinha', 'martelo-leve', 'martelo-de-guerra'],
    ignoresHeavyArmorSlow: true,
    subraceLabel: 'Sub-raça',
    subraces: [
      { id: 'colina', name: 'Anão da Colina', asi: { sab: 1 }, hpPerLevel: 1 },
      { id: 'montanha', name: 'Anão da Montanha', asi: { for: 2 }, armor: ['leve', 'media'] },
    ],
  },
  {
    id: 'elfo',
    name: 'Elfo',
    speed: 30,
    asi: { des: 2 },
    skills: skills('Percepção'),
    weapons: [],
    subraceLabel: 'Sub-raça',
    subraces: [
      { id: 'alto', name: 'Alto Elfo', asi: { int: 1 }, weapons: ELF_WEAPONS, extraCantrips: 1 },
      {
        id: 'floresta',
        name: 'Elfo da Floresta',
        asi: { sab: 1 },
        speed: 35,
        weapons: ELF_WEAPONS,
      },
      {
        id: 'drow',
        name: 'Elfo Negro (Drow)',
        asi: { car: 1 },
        weapons: ['rapieira', 'espada-curta', 'besta-de-mao'],
      },
    ],
  },
  {
    id: 'halfling',
    name: 'Halfling',
    speed: 25,
    asi: { des: 2 },
    skills: [],
    weapons: [],
    subraceLabel: 'Sub-raça',
    subraces: [
      { id: 'pes-leves', name: 'Halfling Pés Leves', asi: { car: 1 } },
      { id: 'robusto', name: 'Halfling Robusto', asi: { con: 1 } },
    ],
  },
  {
    id: 'humano',
    name: 'Humano',
    speed: 30,
    asi: { for: 1, des: 1, con: 1, int: 1, sab: 1, car: 1 },
    skills: [],
    weapons: [],
    subraces: [],
  },
  {
    id: 'draconato',
    name: 'Draconato',
    speed: 30,
    asi: { for: 2, car: 1 },
    skills: [],
    weapons: [],
    subraces: [],
  },
  {
    id: 'gnomo',
    name: 'Gnomo',
    speed: 25,
    asi: { int: 2 },
    skills: [],
    weapons: [],
    subraceLabel: 'Sub-raça',
    subraces: [
      { id: 'floresta', name: 'Gnomo da Floresta', asi: { des: 1 } },
      { id: 'rochas', name: 'Gnomo das Rochas', asi: { con: 1 } },
    ],
  },
  {
    id: 'meio-elfo',
    name: 'Meio-Elfo',
    speed: 30,
    asi: { car: 2 },
    asiChoice: { count: 2, exclude: ['car'] },
    skills: [],
    skillChoices: 2,
    weapons: [],
    subraces: [],
  },
  {
    id: 'meio-orc',
    name: 'Meio-Orc',
    speed: 30,
    asi: { for: 2, con: 1 },
    skills: skills('Intimidação'),
    weapons: [],
    subraces: [],
  },
  {
    id: 'tiefling',
    name: 'Tiefling',
    speed: 30,
    asi: { car: 2, int: 1 },
    skills: [],
    weapons: [],
    subraces: [],
  },
];

export interface BackgroundDef extends Named {
  skills: readonly number[];
}

export const BACKGROUNDS: readonly BackgroundDef[] = [
  { id: 'acolito', name: 'Acólito', skills: skills('Intuição', 'Religião') },
  { id: 'artesao-de-guilda', name: 'Artesão de Guilda', skills: skills('Intuição', 'Persuasão') },
  { id: 'artista', name: 'Artista', skills: skills('Acrobacia', 'Atuação') },
  { id: 'charlatao', name: 'Charlatão', skills: skills('Enganação', 'Prestidigitação') },
  { id: 'criminoso', name: 'Criminoso', skills: skills('Enganação', 'Furtividade') },
  { id: 'eremita', name: 'Eremita', skills: skills('Medicina', 'Religião') },
  { id: 'forasteiro', name: 'Forasteiro', skills: skills('Atletismo', 'Sobrevivência') },
  {
    id: 'heroi-do-povo',
    name: 'Herói do Povo',
    skills: skills('Adestrar Animais', 'Sobrevivência'),
  },
  { id: 'marinheiro', name: 'Marinheiro', skills: skills('Atletismo', 'Percepção') },
  { id: 'nobre', name: 'Nobre', skills: skills('História', 'Persuasão') },
  { id: 'orfao', name: 'Órfão', skills: skills('Furtividade', 'Prestidigitação') },
  { id: 'sabio', name: 'Sábio', skills: skills('Arcanismo', 'História') },
  { id: 'soldado', name: 'Soldado', skills: skills('Atletismo', 'Intimidação') },
];

export const ALIGNMENTS: readonly Named[] = [
  { id: 'lb', name: 'Leal e Bom' },
  { id: 'nb', name: 'Neutro e Bom' },
  { id: 'cb', name: 'Caótico e Bom' },
  { id: 'ln', name: 'Leal e Neutro' },
  { id: 'nn', name: 'Neutro' },
  { id: 'cn', name: 'Caótico e Neutro' },
  { id: 'lm', name: 'Leal e Mau' },
  { id: 'nm', name: 'Neutro e Mau' },
  { id: 'cm', name: 'Caótico e Mau' },
];
