import { CLASSES, FIGHTING_STYLES, type ClassDef, type SubclassDef } from './classes';
import {
  ABILITY_KEYS,
  ALL_SKILLS,
  PERCEPTION_INDEX,
  SKILLS,
  abilityModifier,
  clampInt,
  clampLevel,
  findBy,
  getPath,
  intIn,
  isAbility,
  proficiencyBonus,
  toNumber,
  type AbilityKey,
  type Sheet,
} from './core';
import {
  ARMORS,
  MAX_MAGIC_BONUS,
  SHIELD_AC,
  WEAPONS,
  isMonkWeapon,
  type ArmorDef,
  type WeaponDef,
} from './equipment';
import {
  ALIGNMENTS,
  BACKGROUNDS,
  RACES,
  type BackgroundDef,
  type RaceDef,
  type SubraceDef,
} from './lineage';
import { classicTotal, readClassicAssignment, readClassicRolls, type ClassicRoll } from './classic';
import { bonusPrepared, cantripsKnown, spellSlots, spellsKnown } from './magic';
import { spellListOf, type SpellClass } from './spells';

export const STANDARD_ARRAY: readonly number[] = [15, 14, 13, 12, 10, 8];
export const POINT_BUY_BUDGET = 27;
const POINT_COST: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
/** Custo em pontos de cada valor da compra de pontos (Livro do Jogador, cap. 1). */
export const pointCost = (value: number): number => POINT_COST[value] ?? 0;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;
export const ABILITY_CAP = 20;
export const MIN_ATTACK_ROWS = 3;
export const MAX_ATTACK_ROWS = 30;
const MAX_TEXT = 60;

/** Linhas de magia por círculo (1–9): é o espaço da folha, não uma regra. */
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

export interface AbilityBreakdown {
  base: number;
  racial: number;
  increase: number;
  total: number;
  mod: number;
  /** Só nos métodos de distribuição (padrão e clássico): ainda sem valor atribuído. */
  unassigned: boolean;
}

export interface AttackRow {
  weapon: WeaponDef;
  bonus: number;
  proficient: boolean;
  damage: string;
}

export interface SpellBuild {
  className: string;
  /** Lista de magias da classe (ou da subclasse conjuradora); sem ela, vale qualquer magia. */
  list: SpellClass | undefined;
  ability: AbilityKey;
  mode: 'known' | 'prepared' | 'book';
  dc: number;
  attack: number;
  cantrips: number;
  slots: Record<number, number>;
  /** Maior círculo de magia disponível (no Bruxo, o círculo dos espaços de Pacto). */
  maxCircle: number;
  /** Quantas magias a lista pode ter (conhecidas, preparadas + de domínio, ou o grimório). */
  spellLimit: number;
  /** Só no Mago: quantas das magias do grimório ficam preparadas. */
  preparedLimit: number;
}

export interface SkillChoices {
  classOptions: readonly number[];
  classCount: number;
  raceCount: number;
  substituteCount: number;
  expertiseCount: number;
  /** Perícias já proficientes (origem + escolhas), base da especialização. */
  proficient: readonly number[];
}

export interface Build {
  /** A ficha com todas as escolhas inválidas removidas. */
  sheet: Sheet;
  cls: ClassDef | undefined;
  subclass: SubclassDef | undefined;
  race: RaceDef | undefined;
  subrace: SubraceDef | undefined;
  background: BackgroundDef | undefined;
  level: number;
  proficiency: number;
  method: 'pb' | 'sa' | 'cl';
  pointsLeft: number;
  standardLeft: number[];
  /** Método clássico: as rolagens feitas (ou nenhuma) e os índices ainda sem atributo. */
  classicRolls: ClassicRoll[] | undefined;
  classicLeft: number[];
  abilities: Record<AbilityKey, AbilityBreakdown>;
  asiLevels: number[];
  racialChoices: number;
  saves: Record<AbilityKey, number>;
  saveProficient: Record<AbilityKey, boolean>;
  skillLevel: number[];
  skills: number[];
  skillChoices: SkillChoices;
  passivePerception: number;
  initiative: number;
  fightingStyles: readonly { id: string; name: string }[];
  hpMax: number | null;
  hitDice: string;
  ac: number | null;
  speed: string;
  armor: ArmorDef | undefined;
  armorUntrained: boolean;
  attacks: (AttackRow | null)[];
  attackRows: number;
  spell: SpellBuild | null;
  /** Mensagens do que ainda falta escolher na ficha. */
  pending: string[];
}

const OBSOLETE = ['sk', 'sv', 'sa', 'sc', 'hpm', 'hd', 'ca', 'spd'] as const;

const zeroAbilities = (): Record<AbilityKey, number> => ({
  for: 0,
  des: 0,
  con: 0,
  int: 0,
  sab: 0,
  car: 0,
});

const feet = (ft: number) => (Math.round(ft * 3) / 10).toString().replace('.', ',') + ' m';

function indexed<T>(values: Record<number, T>): Record<string, T> {
  return { ...values };
}

/**
 * Resolve a ficha segundo as regras do Livro do Jogador: descarta escolhas inválidas, aplica
 * raça, classe e antecedente, e calcula tudo o que é derivado. O jogador só guarda *escolhas*;
 * números como PV máximos, CA e bônus não são digitados.
 */
export function resolve(raw: Sheet): Build {
  const out: Sheet = { ...raw };
  for (const key of OBSOLETE) delete out[key];
  const pending: string[] = [];

  // Identidade
  const cls = findBy(CLASSES, raw.cl);
  out.cl = cls?.id ?? '';
  const level = clampLevel(raw.lvl);
  out.lvl = level;
  const race = findBy(RACES, raw.rc);
  out.rc = race?.id ?? '';
  const subrace = race ? findBy(race.subraces, raw.sr) : undefined;
  out.sr = subrace?.id ?? '';
  const background = findBy(BACKGROUNDS, raw.bg);
  out.bg = background?.id ?? '';
  out.al = findBy(ALIGNMENTS, raw.al)?.id ?? '';
  const subclass = cls && level >= cls.subclassLevel ? findBy(cls.subclasses, raw.sb) : undefined;
  out.sb = subclass?.id ?? '';
  out.xp = intIn(raw.xp, 0, 9_999_999) ?? '';

  if (!cls) pending.push('Escolha a classe.');
  else if (level >= cls.subclassLevel && !subclass)
    pending.push('Escolha ' + cls.subclassLabel + '.');
  if (!race) pending.push('Escolha a raça.');
  else if (race.subraces.length > 0 && !subrace) pending.push('Escolha a sub-raça.');
  if (!background) pending.push('Escolha o antecedente.');
  const pb = proficiencyBonus(level);

  // Valores-base: compra de pontos (27), valores padrão ou rolagem clássica (4d6)
  const method = raw.abm === 'sa' || raw.abm === 'cl' ? raw.abm : 'pb';
  out.abm = method;
  const base = zeroAbilities();
  const unassigned = zeroAbilities();
  let pointsLeft = POINT_BUY_BUDGET;
  let standardLeft: number[] = [];
  const pointBuy = ABILITY_KEYS.map((k) =>
    intIn(getPath(raw, 'ab.' + k), POINT_BUY_MIN, POINT_BUY_MAX),
  );
  const cost = pointBuy.reduce<number>((sum, v) => sum + (v === undefined ? 0 : POINT_COST[v]!), 0);
  const pointBuyValid = pointBuy.every((v) => v !== undefined) && cost <= POINT_BUY_BUDGET;
  out.ab = Object.fromEntries(
    ABILITY_KEYS.map((k, i) => [k, pointBuyValid ? pointBuy[i] : POINT_BUY_MIN]),
  );
  const left = [...STANDARD_ARRAY];
  const standard: Record<string, number | ''> = {};
  for (const k of ABILITY_KEYS) {
    const v = intIn(getPath(raw, 'std.' + k), 8, 15);
    const at = v === undefined ? -1 : left.indexOf(v);
    if (v !== undefined && at >= 0) {
      left.splice(at, 1);
      standard[k] = v;
    } else standard[k] = '';
  }
  out.std = standard;
  const classicRolls = readClassicRolls(raw);
  const assignment = classicRolls ? readClassicAssignment(raw) : undefined;
  if (classicRolls) out.dr = classicRolls.map((r) => [...r]);
  else delete out.dr;
  if (assignment) out.da = assignment;
  else delete out.da;
  let classicLeft: number[] = [];
  if (method === 'pb') {
    for (const k of ABILITY_KEYS) base[k] = (out.ab as Record<string, number>)[k]!;
    pointsLeft = POINT_BUY_BUDGET - (pointBuyValid ? cost : 0);
  } else if (method === 'sa') {
    standardLeft = left;
    for (const k of ABILITY_KEYS) {
      const v = standard[k];
      base[k] = v === '' || v === undefined ? POINT_BUY_MIN : v;
      unassigned[k] = v === '' ? 1 : 0;
    }
    if (left.length > 0) pending.push('Distribua os valores padrão entre os atributos.');
  } else {
    if (!classicRolls || !assignment) {
      for (const k of ABILITY_KEYS) {
        base[k] = POINT_BUY_MIN;
        unassigned[k] = 1;
      }
      pending.push('Role os dados dos atributos.');
    } else {
      const used = Object.values(assignment);
      classicLeft = classicRolls.map((_, i) => i).filter((i) => !used.includes(i));
      for (const k of ABILITY_KEYS) {
        const i = assignment[k];
        base[k] = i === '' || i === undefined ? POINT_BUY_MIN : classicTotal(classicRolls[i]!);
        unassigned[k] = i === '' ? 1 : 0;
      }
      if (classicLeft.length > 0) pending.push('Distribua os valores rolados entre os atributos.');
    }
  }

  // Bônus raciais
  const racial = zeroAbilities();
  for (const source of [race?.asi, subrace?.asi]) {
    for (const [k, n] of Object.entries(source ?? {})) racial[k as AbilityKey] += n;
  }
  const racialChoices = race?.asiChoice?.count ?? 0;
  const chosen: AbilityKey[] = [];
  const rb: Record<number, AbilityKey> = {};
  for (let i = 0; i < racialChoices; i++) {
    const v = getPath(raw, 'rb.' + i);
    if (isAbility(v) && !race!.asiChoice!.exclude.includes(v) && !chosen.includes(v)) {
      chosen.push(v);
      rb[i] = v;
      racial[v] += 1;
    } else pending.push('Escolha os atributos do bônus racial.');
  }
  out.rb = indexed(rb);

  // Aumentos de Atributo por nível (+2 em um, ou +1 em dois; máximo 20)
  const asiLevels = [4, 8, 12, 16, 19, ...(cls?.extraAsiLevels ?? [])]
    .filter((l) => l <= level)
    .sort((a, b) => a - b);
  const increase = zeroAbilities();
  const asi: Record<number, Record<string, AbilityKey>> = {};
  for (const l of asiLevels) {
    for (const slot of ['a', 'b']) {
      const v = getPath(raw, `asi.${l}.${slot}`);
      if (isAbility(v) && base[v] + racial[v] + increase[v] + 1 <= ABILITY_CAP) {
        increase[v] += 1;
        (asi[l] ??= {})[slot] = v;
      } else pending.push(`Escolha o Aumento de Atributo do nível ${l}.`);
    }
  }
  out.asi = indexed(asi);

  const abilities = {} as Record<AbilityKey, AbilityBreakdown>;
  for (const k of ABILITY_KEYS) {
    const total = Math.min(ABILITY_CAP, base[k] + racial[k] + increase[k]);
    abilities[k] = {
      base: base[k],
      racial: racial[k],
      increase: increase[k],
      total,
      mod: abilityModifier(total),
      unassigned: unassigned[k] === 1,
    };
  }
  const mod = (k: AbilityKey) => abilities[k].mod;

  // Salvaguardas
  const saves = {} as Record<AbilityKey, number>;
  const saveProficient = {} as Record<AbilityKey, boolean>;
  for (const k of ABILITY_KEYS) {
    saveProficient[k] = cls?.saves.includes(k) ?? false;
    saves[k] = mod(k) + (saveProficient[k] ? pb : 0);
  }

  // Perícias: antecedente e raça concedem; classe escolhe; duplicatas viram substitutas
  const granted: number[] = [...(background?.skills ?? []), ...(race?.skills ?? [])];
  const classOptions = cls?.skills ?? [];
  const classCount = cls?.skillCount ?? 0;
  const raceCount = race?.skillChoices ?? 0;
  const pickSkills = (
    prefix: string,
    count: number,
    allowed: readonly number[],
    taken: Set<number>,
  ) => {
    const picks: Record<number, number> = {};
    for (let i = 0; i < count; i++) {
      const v = intIn(getPath(raw, `${prefix}.${i}`), 0, SKILLS.length - 1);
      if (v !== undefined && allowed.includes(v) && !taken.has(v)) {
        picks[i] = v;
        taken.add(v);
      }
    }
    return picks;
  };
  const classPicks = pickSkills('csk', classCount, classOptions, new Set());
  const racePicks = pickSkills('rsk', raceCount, ALL_SKILLS, new Set());
  const acquired = [...granted, ...Object.values(classPicks), ...Object.values(racePicks)];
  const owned = new Set(acquired);
  const substituteCount = acquired.length - owned.size;
  const substitutes = pickSkills('ssk', substituteCount, ALL_SKILLS, owned);
  const missing =
    classCount -
    Object.keys(classPicks).length +
    raceCount -
    Object.keys(racePicks).length +
    substituteCount -
    Object.keys(substitutes).length;
  if (missing > 0) pending.push('Escolha as perícias que faltam.');
  const proficient = [...owned];
  const expertiseCount = 2 * (cls?.expertise.filter((l) => l <= level).length ?? 0);
  const expertise = pickSkills('exp', expertiseCount, proficient, new Set());
  if (Object.keys(expertise).length < expertiseCount)
    pending.push('Escolha as perícias de especialização.');
  out.csk = indexed(classPicks);
  out.rsk = indexed(racePicks);
  out.ssk = indexed(substitutes);
  out.exp = indexed(expertise);
  const expert = new Set(Object.values(expertise));
  const skillLevel = ALL_SKILLS.map((i) => (expert.has(i) ? 2 : owned.has(i) ? 1 : 0));
  const skills = SKILLS.map(([, a], i) => mod(a) + pb * skillLevel[i]!);

  // Estilo de luta
  const style =
    cls?.fightingStyle && level >= cls.fightingStyle.from ? cls.fightingStyle : undefined;
  const fightingStyles = style ? FIGHTING_STYLES.filter((s) => style.options.includes(s.id)) : [];
  const fs = fightingStyles.find((s) => s.id === raw.fs)?.id ?? '';
  out.fs = fs;
  if (style && !fs) pending.push('Escolha o estilo de luta.');

  // Armadura e CA
  const armor = findBy(ARMORS, raw.ar);
  // `nenhuma` é a escolha explícita de ficar sem armadura; vazio = ainda não escolheu.
  out.ar = armor?.id ?? (raw.ar === 'nenhuma' ? 'nenhuma' : '');
  const shield = raw.sh === true;
  out.sh = shield;
  out.arb = armor ? (intIn(raw.arb, 0, MAX_MAGIC_BONUS) ?? 0) : 0;
  out.shb = shield ? (intIn(raw.shb, 0, MAX_MAGIC_BONUS) ?? 0) : 0;
  const trained = (category: 'leve' | 'media' | 'pesada' | 'escudo') =>
    Boolean(cls?.armor.includes(category) || subrace?.armor?.includes(category));
  const armorUntrained = Boolean(
    cls && ((armor && !trained(armor.category)) || (shield && !trained('escudo'))),
  );
  let ac: number | null = null;
  if (cls) {
    if (armor) {
      const dex =
        armor.category === 'leve'
          ? mod('des')
          : armor.category === 'media'
            ? Math.min(mod('des'), 2)
            : 0;
      ac = armor.ac + dex + (out.arb as number);
    } else {
      ac = 10 + mod('des');
      if (cls.unarmored === 'con') ac += mod('con');
      if (cls.unarmored === 'sab' && !shield) ac += mod('sab');
      if (subclass?.id === 'linhagem-draconica') ac = Math.max(ac, 13 + mod('des'));
    }
    if (shield) ac += SHIELD_AC + (out.shb as number);
    if (armor && fs === 'defesa') ac += 1;
  }

  // Deslocamento
  let speedFt = subrace?.speed ?? race?.speed ?? 0;
  if (race) {
    if (cls?.id === 'barbaro' && level >= 5 && armor?.category !== 'pesada') speedFt += 10;
    if (cls?.id === 'monge' && level >= 2 && !armor && !shield)
      speedFt += 5 * (1 + Math.floor((level + 2) / 4));
    if (armor?.strength && abilities.for.total < armor.strength && !race.ignoresHeavyArmorSlow)
      speedFt -= 10;
  }
  const speed = race ? feet(speedFt) : '—';

  // Pontos de vida: dado de vida máximo no 1º nível, valor médio nos seguintes (mínimo 1 por nível)
  let hpMax: number | null = null;
  if (cls) {
    const average = cls.hitDie / 2 + 1;
    hpMax =
      Math.max(1, cls.hitDie + mod('con')) +
      (level - 1) * Math.max(1, average + mod('con')) +
      level * ((subrace?.hpPerLevel ?? 0) + (subclass?.id === 'linhagem-draconica' ? 1 : 0));
  }
  const hpc = hpMax === null ? undefined : clampInt(raw.hpc, 0, hpMax);
  out.hpc = hpc ?? '';
  out.hpt = intIn(raw.hpt, 0, 9999) ?? '';

  // Ataques: arma da lista, bônus mágico +0 a +3
  const attackRows = Math.min(
    MAX_ATTACK_ROWS,
    Math.max(MIN_ATTACK_ROWS, Math.trunc(toNumber(raw.atN))),
  );
  out.atN = attackRows;
  const attackData: Record<number, { w: string; m: number }> = {};
  const attacks = Array.from({ length: attackRows }, (_, i): AttackRow | null => {
    const weapon = findBy(WEAPONS, getPath(raw, `at.${i}.w`));
    if (!weapon) return null;
    const magic = intIn(getPath(raw, `at.${i}.m`), 0, MAX_MAGIC_BONUS) ?? 0;
    attackData[i] = { w: weapon.id, m: magic };
    return attackFor(weapon, magic);
  });
  out.at = indexed(attackData);

  function attackFor(weapon: WeaponDef, magic: number): AttackRow {
    const monk = cls?.id === 'monge' && isMonkWeapon(weapon);
    const finesse = weapon.properties.includes('acuidade') || monk;
    const key: AbilityKey = weapon.ranged
      ? 'des'
      : finesse
        ? mod('des') > mod('for')
          ? 'des'
          : 'for'
        : 'for';
    const proficient =
      weapon.id === 'desarmado' ||
      Boolean(
        cls?.weapons.includes(weapon.category) ||
        cls?.weapons.includes(weapon.id) ||
        race?.weapons.includes(weapon.id) ||
        subrace?.weapons?.includes(weapon.id),
      );
    const bonus =
      mod(key) + (proficient ? pb : 0) + magic + (fs === 'arquearia' && weapon.ranged ? 2 : 0);
    const twoHanded =
      weapon.properties.includes('duas-maos') || weapon.properties.includes('pesada');
    const dueling = fs === 'duelismo' && !weapon.ranged && !twoHanded ? 2 : 0;
    const flat = mod(key) + magic + dueling;
    if (weapon.flat !== undefined) {
      // Golpe desarmado: 1 + modificador; o Monge usa o dado de Artes Marciais.
      if (cls?.id !== 'monge')
        return { weapon, bonus, proficient, damage: `${weapon.flat + flat} ${weapon.type}` };
      const die = level >= 17 ? 10 : level >= 11 ? 8 : level >= 5 ? 6 : 4;
      return { weapon, bonus, proficient, damage: withFlat(`1d${die}`, flat, weapon.type) };
    }
    const dice = `${weapon.dice[0]}d${weapon.dice[1]}`;
    const versatile = weapon.versatile ? ` (1d${weapon.versatile})` : '';
    return { weapon, bonus, proficient, damage: withFlat(dice + versatile, flat, weapon.type) };
  }

  // Conjuração
  const spell = buildSpell();
  function buildSpell(): SpellBuild | null {
    const caster = subclass?.caster ?? cls?.caster;
    const casterId = subclass?.caster ? subclass.id : (cls?.id ?? '');
    const extraCantrips = subrace?.extraCantrips ?? 0;
    const slots = caster ? spellSlots(caster.kind, level) : {};
    const known = spellsKnown(casterId, level);
    const cantrips = (caster ? cantripsKnown(casterId, level) : 0) + extraCantrips;
    if (!cls || (Object.keys(slots).length === 0 && cantrips === 0)) return null;
    const ability: AbilityKey = caster?.ability ?? 'int';
    const prep = (n: number) => Math.max(1, n);
    let mode: SpellBuild['mode'] = 'known';
    let spellLimit = known ?? 0;
    let preparedLimit = 0;
    if (cls.id === 'clerigo' || cls.id === 'druida') {
      mode = 'prepared';
      spellLimit = prep(mod(ability) + level) + bonusPrepared(cls.id, out.sb as string, level);
    } else if (cls.id === 'paladino') {
      mode = 'prepared';
      spellLimit =
        level < 2
          ? 0
          : prep(mod(ability) + Math.floor(level / 2)) +
            bonusPrepared(cls.id, out.sb as string, level);
    } else if (cls.id === 'mago') {
      mode = 'book';
      spellLimit = 6 + 2 * (level - 1);
      preparedLimit = prep(mod(ability) + level);
    }
    const noSlots = Object.keys(slots).length === 0;
    return {
      className: cls.name,
      list: spellListOf(casterId),
      ability,
      mode,
      dc: 8 + pb + mod(ability),
      attack: pb + mod(ability),
      cantrips,
      slots,
      maxCircle: Math.max(0, ...Object.keys(slots).map(Number)),
      spellLimit: noSlots ? 0 : spellLimit,
      preparedLimit: noSlots ? 0 : preparedLimit,
    };
  }
  normalizeSpells(out, raw, spell);

  // Números simples
  const coins = Object.fromEntries(
    ['pc', 'pp', 'pe', 'po', 'pl'].map((k) => [
      k,
      intIn(getPath(raw, 'co.' + k), 0, 999_999_999) ?? '',
    ]),
  );
  out.co = coins;

  return {
    sheet: out,
    cls,
    subclass,
    race,
    subrace,
    background,
    level,
    proficiency: pb,
    method,
    pointsLeft,
    standardLeft,
    classicRolls,
    classicLeft,
    abilities,
    asiLevels,
    racialChoices,
    saves,
    saveProficient,
    skillLevel,
    skills,
    skillChoices: {
      classOptions,
      classCount,
      raceCount,
      substituteCount,
      expertiseCount,
      proficient,
    },
    passivePerception: 10 + (skills[PERCEPTION_INDEX] ?? 0),
    initiative: mod('des'),
    fightingStyles,
    hpMax,
    hitDice: cls ? `${level}d${cls.hitDie}` : '—',
    ac,
    speed,
    armor,
    armorUntrained,
    attacks,
    attackRows,
    spell,
    pending: [...new Set(pending)],
  };
}

function withFlat(dice: string, flat: number, type: string): string {
  return dice + (flat === 0 ? '' : flat > 0 ? ` + ${flat}` : ` − ${Math.abs(flat)}`) + ' ' + type;
}

const text = (v: unknown) => (typeof v === 'string' ? v.slice(0, MAX_TEXT) : '');

/** Limita truques, magias, preparo e espaços ao que a classe e o nível permitem. */
function normalizeSpells(out: Sheet, raw: Sheet, spell: SpellBuild | null) {
  delete out.sp;
  delete out.sl;
  if (!spell) return;
  const sp: Record<number, Record<number, { n: string; p?: boolean }>> = {};
  const lines = (circle: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const name = text(getPath(raw, `sp.${circle}.${i}.n`));
      if (name.trim() !== '') (sp[circle] ??= {})[i] = { n: name };
    }
  };
  // Truques
  lines(0, CANTRIP_LINES);
  const cantrips = Object.keys(sp[0] ?? {}).map(Number);
  for (const i of cantrips.slice(spell.cantrips)) delete sp[0]![i];
  // Magias de cada círculo disponível, até o limite total
  let used = 0;
  let prepared = 0;
  for (let circle = 1; circle <= spell.maxCircle; circle++) {
    lines(circle, SPELL_LINES[circle] ?? 0);
    for (const key of Object.keys(sp[circle] ?? {}).map(Number)) {
      const entry = sp[circle]![key]!;
      if (used >= spell.spellLimit) delete sp[circle]![key];
      else {
        used += 1;
        if (
          spell.mode === 'book' &&
          getPath(raw, `sp.${circle}.${key}.p`) === true &&
          prepared < spell.preparedLimit
        ) {
          entry.p = true;
          prepared += 1;
        }
      }
    }
  }
  out.sp = sp;
  const sl: Record<number, { t: number; e: number }> = {};
  for (const [circle, total] of Object.entries(spell.slots)) {
    sl[Number(circle)] = { t: total, e: clampInt(getPath(raw, `sl.${circle}.e`), 0, total) ?? 0 };
  }
  out.sl = sl;
}

export const normalizeSheet = (sheet: Sheet): Sheet => resolve(sheet).sheet;
