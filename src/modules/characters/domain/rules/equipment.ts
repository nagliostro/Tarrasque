import type { ArmorCategory } from './classes';
import type { Named } from './core';

export interface ArmorDef extends Named {
  category: Exclude<ArmorCategory, 'escudo'>;
  /** CA base (o valor antes de somar Destreza). */
  ac: number;
  strength?: number;
  stealthDisadvantage?: boolean;
}

export const ARMORS: readonly ArmorDef[] = [
  { id: 'acolchoada', name: 'Acolchoada', category: 'leve', ac: 11, stealthDisadvantage: true },
  { id: 'couro', name: 'Couro', category: 'leve', ac: 11 },
  { id: 'couro-batido', name: 'Couro Batido', category: 'leve', ac: 12 },
  { id: 'gibao-de-peles', name: 'Gibão de Peles', category: 'media', ac: 12 },
  { id: 'camisao-de-malha', name: 'Camisão de Malha', category: 'media', ac: 13 },
  { id: 'brunea', name: 'Brunea', category: 'media', ac: 14, stealthDisadvantage: true },
  { id: 'peitoral', name: 'Peitoral', category: 'media', ac: 14 },
  {
    id: 'meia-armadura',
    name: 'Meia-Armadura',
    category: 'media',
    ac: 15,
    stealthDisadvantage: true,
  },
  {
    id: 'cota-de-aneis',
    name: 'Cota de Anéis',
    category: 'pesada',
    ac: 14,
    stealthDisadvantage: true,
  },
  {
    id: 'cota-de-malha',
    name: 'Cota de Malha',
    category: 'pesada',
    ac: 16,
    strength: 13,
    stealthDisadvantage: true,
  },
  {
    id: 'cota-de-talas',
    name: 'Cota de Talas',
    category: 'pesada',
    ac: 17,
    strength: 15,
    stealthDisadvantage: true,
  },
  {
    id: 'placas',
    name: 'Placas',
    category: 'pesada',
    ac: 18,
    strength: 15,
    stealthDisadvantage: true,
  },
];

export const SHIELD_AC = 2;
/** Bônus mágico de armadura ou escudo: +1 a +3 (DMG, itens mágicos). */
export const MAX_MAGIC_BONUS = 3;

export type DamageType = 'cortante' | 'contundente' | 'perfurante';
export type WeaponProperty =
  | 'acuidade'
  | 'leve'
  | 'pesada'
  | 'alcance'
  | 'arremesso'
  | 'municao'
  | 'recarga'
  | 'duas-maos'
  | 'versatil'
  | 'especial';

export interface WeaponDef extends Named {
  category: 'simples' | 'marcial';
  ranged: boolean;
  /** Dado de dano; `[0, 0]` com `flat` = dano fixo (golpe desarmado). */
  dice: readonly [count: number, faces: number];
  flat?: number;
  type: DamageType;
  properties: readonly WeaponProperty[];
  /** Faces do dado quando empunhada com duas mãos (propriedade versátil). */
  versatile?: number;
}

const w = (
  id: string,
  name: string,
  category: WeaponDef['category'],
  ranged: boolean,
  dice: readonly [number, number],
  type: DamageType,
  properties: readonly WeaponProperty[] = [],
  versatile?: number,
): WeaponDef => ({
  id,
  name,
  category,
  ranged,
  dice,
  type,
  properties,
  ...(versatile ? { versatile } : {}),
});

export const UNARMED: WeaponDef = {
  id: 'desarmado',
  name: 'Golpe Desarmado',
  category: 'simples',
  ranged: false,
  dice: [0, 0],
  flat: 1,
  type: 'contundente',
  properties: [],
};

export const WEAPONS: readonly WeaponDef[] = [
  UNARMED,
  // Simples, corpo a corpo
  w('adaga', 'Adaga', 'simples', false, [1, 4], 'perfurante', ['acuidade', 'leve', 'arremesso']),
  w('azagaia', 'Azagaia', 'simples', false, [1, 6], 'perfurante', ['arremesso']),
  w('bordao', 'Bordão', 'simples', false, [1, 6], 'contundente', ['versatil'], 8),
  w('clava', 'Clava', 'simples', false, [1, 4], 'contundente', ['leve']),
  w('clava-grande', 'Clava Grande', 'simples', false, [1, 8], 'contundente', ['duas-maos']),
  w('foice-curta', 'Foice Curta', 'simples', false, [1, 4], 'cortante', ['leve']),
  w('lanca', 'Lança', 'simples', false, [1, 6], 'perfurante', ['arremesso', 'versatil'], 8),
  w('machadinha', 'Machadinha', 'simples', false, [1, 6], 'cortante', ['leve', 'arremesso']),
  w('maca', 'Maça', 'simples', false, [1, 6], 'contundente'),
  w('martelo-leve', 'Martelo Leve', 'simples', false, [1, 4], 'contundente', ['leve', 'arremesso']),
  // Simples, à distância
  w('arco-curto', 'Arco Curto', 'simples', true, [1, 6], 'perfurante', ['municao', 'duas-maos']),
  w('besta-leve', 'Besta Leve', 'simples', true, [1, 8], 'perfurante', [
    'municao',
    'recarga',
    'duas-maos',
  ]),
  w('dardo', 'Dardo', 'simples', true, [1, 4], 'perfurante', ['acuidade', 'arremesso']),
  w('funda', 'Funda', 'simples', true, [1, 4], 'contundente', ['municao']),
  // Marciais, corpo a corpo
  w('alabarda', 'Alabarda', 'marcial', false, [1, 10], 'cortante', [
    'pesada',
    'alcance',
    'duas-maos',
  ]),
  w('chicote', 'Chicote', 'marcial', false, [1, 4], 'cortante', ['acuidade', 'alcance']),
  w('cimitarra', 'Cimitarra', 'marcial', false, [1, 6], 'cortante', ['acuidade', 'leve']),
  w('espada-curta', 'Espada Curta', 'marcial', false, [1, 6], 'perfurante', ['acuidade', 'leve']),
  w('espada-grande', 'Espada Grande', 'marcial', false, [2, 6], 'cortante', [
    'pesada',
    'duas-maos',
  ]),
  w('espada-longa', 'Espada Longa', 'marcial', false, [1, 8], 'cortante', ['versatil'], 10),
  w('estrela-da-manha', 'Estrela da Manhã', 'marcial', false, [1, 8], 'perfurante'),
  w('glaive', 'Glaive', 'marcial', false, [1, 10], 'cortante', ['pesada', 'alcance', 'duas-maos']),
  w('lanca-de-montaria', 'Lança de Montaria', 'marcial', false, [1, 12], 'perfurante', [
    'alcance',
    'especial',
  ]),
  w(
    'machado-de-batalha',
    'Machado de Batalha',
    'marcial',
    false,
    [1, 8],
    'cortante',
    ['versatil'],
    10,
  ),
  w('machado-grande', 'Machado Grande', 'marcial', false, [1, 12], 'cortante', [
    'pesada',
    'duas-maos',
  ]),
  w('mangual', 'Mangual', 'marcial', false, [1, 8], 'contundente'),
  w('malho', 'Malho', 'marcial', false, [2, 6], 'contundente', ['pesada', 'duas-maos']),
  w(
    'martelo-de-guerra',
    'Martelo de Guerra',
    'marcial',
    false,
    [1, 8],
    'contundente',
    ['versatil'],
    10,
  ),
  w('picareta-de-guerra', 'Picareta de Guerra', 'marcial', false, [1, 8], 'perfurante'),
  w('pique', 'Pique', 'marcial', false, [1, 10], 'perfurante', ['pesada', 'alcance', 'duas-maos']),
  w('rapieira', 'Rapieira', 'marcial', false, [1, 8], 'perfurante', ['acuidade']),
  w('tridente', 'Tridente', 'marcial', false, [1, 6], 'perfurante', ['arremesso', 'versatil'], 8),
  // Marciais, à distância
  w('arco-longo', 'Arco Longo', 'marcial', true, [1, 8], 'perfurante', [
    'municao',
    'pesada',
    'duas-maos',
  ]),
  w('besta-de-mao', 'Besta de Mão', 'marcial', true, [1, 6], 'perfurante', [
    'municao',
    'leve',
    'recarga',
  ]),
  w('besta-pesada', 'Besta Pesada', 'marcial', true, [1, 10], 'perfurante', [
    'municao',
    'pesada',
    'recarga',
    'duas-maos',
  ]),
];

/** Armas que o Monge usa com Artes Marciais: simples corpo a corpo sem pesada/duas mãos, e a espada curta. */
export const isMonkWeapon = (weapon: WeaponDef): boolean =>
  weapon.id === 'desarmado' ||
  weapon.id === 'espada-curta' ||
  (weapon.category === 'simples' &&
    !weapon.ranged &&
    !weapon.properties.includes('pesada') &&
    !weapon.properties.includes('duas-maos'));
