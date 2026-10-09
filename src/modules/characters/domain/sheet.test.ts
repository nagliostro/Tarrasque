import { describe, expect, it } from 'vitest';
import {
  ALIGNMENTS,
  BACKGROUNDS,
  CLASSES,
  FIGHTING_STYLES,
  RACES,
  WEAPONS,
  abilityModifier,
  defaultSheet,
  formatBonus,
  getPath,
  levelForXp,
  normalizeSheet,
  classicTotal,
  droppedIndex,
  proficiencyBonus,
  rollClassic,
  resolve,
  setPath,
  sheetSchema,
  summarize,
  type Build,
} from './sheet';

/** Ficha nova com as escolhas dadas como pares [caminho, valor]. */
function build(...choices: [string, unknown][]): Build {
  return resolve(
    choices.reduce((sheet, [path, value]) => setPath(sheet, path, value), defaultSheet()),
  );
}

describe('fórmulas básicas (Livro do Jogador)', () => {
  it('modificador de atributo arredonda para baixo', () => {
    expect([1, 8, 9, 10, 11, 12, 20, 30].map(abilityModifier)).toEqual([
      -5, -1, -1, 0, 0, 1, 5, 10,
    ]);
  });

  it('bônus de proficiência por nível', () => {
    expect([1, 4, 5, 8, 9, 13, 17, 20].map(proficiencyBonus)).toEqual([2, 2, 3, 3, 4, 5, 6, 6]);
    expect(proficiencyBonus('')).toBe(2);
    expect(proficiencyBonus(99)).toBe(6);
  });

  it('formata bônus com sinal tipográfico', () => {
    expect(formatBonus(3)).toBe('+3');
    expect(formatBonus(-2)).toBe('−2');
  });

  it('nível pela tabela de experiência', () => {
    expect([0, 299, 300, 6500, 354999, 355000].map(levelForXp)).toEqual([1, 1, 2, 5, 19, 20]);
  });
});

describe('atributos', () => {
  it('compra de pontos: 27 pontos, valores de 8 a 15', () => {
    expect(build().pointsLeft).toBe(27);
    const spent = build(
      ['ab.for', 15],
      ['ab.des', 14],
      ['ab.con', 13],
      ['ab.int', 12],
      ['ab.sab', 10],
    );
    expect(spent.pointsLeft).toBe(0);
    expect(spent.abilities.des.total).toBe(14);
  });

  it('compra de pontos acima do orçamento ou do intervalo volta tudo a 8', () => {
    const over = build(['ab.for', 15], ['ab.des', 15], ['ab.con', 15], ['ab.int', 15]);
    expect(over.pointsLeft).toBe(27);
    expect(over.abilities.for.total).toBe(8);
    expect(build(['ab.for', 18]).abilities.for.total).toBe(8);
    expect(build(['ab.for', 7]).abilities.for.total).toBe(8);
  });

  it('valores padrão: cada valor só pode ser usado uma vez', () => {
    const b = build(['abm', 'sa'], ['std.for', 15], ['std.des', 15], ['std.con', 14]);
    expect(b.abilities.for.total).toBe(15);
    expect(b.abilities.des.unassigned).toBe(true);
    expect(b.abilities.con.total).toBe(14);
    expect(b.standardLeft).toEqual([13, 12, 10, 8]);
    expect(b.pending).toContain('Distribua os valores padrão entre os atributos.');
  });

  it('clássico: 4d6 descartando o menor dado', () => {
    expect(classicTotal([6, 5, 4, 1])).toBe(15);
    expect(classicTotal([3, 3, 3, 3])).toBe(9);
    expect(classicTotal([1, 1, 1, 1])).toBe(3);
    expect(droppedIndex([4, 2, 6, 2])).toBe(1);
    let n = 0;
    const rolls = rollClassic(() => n++);
    expect(rolls).toHaveLength(6);
    expect(rolls.every((r) => r.length === 4 && r.every((d) => d >= 1 && d <= 6))).toBe(true);
  });

  it('clássico: atribui cada rolagem a um atributo, uma única vez', () => {
    const dr = [
      [6, 5, 4, 1],
      [6, 6, 6, 6],
      [3, 3, 2, 1],
      [4, 4, 4, 4],
      [5, 5, 1, 1],
      [2, 2, 2, 2],
    ];
    const sem = build(['abm', 'cl']);
    expect(sem.pending).toContain('Role os dados dos atributos.');
    expect(sem.abilities.for.unassigned).toBe(true);

    const b = build(['abm', 'cl'], ['dr', dr], ['da.for', 1], ['da.des', 1], ['da.con', 0]);
    expect(b.abilities.for.total).toBe(18);
    expect(b.abilities.des.unassigned).toBe(true);
    expect(b.abilities.con.total).toBe(15);
    expect(b.classicLeft).toEqual([2, 3, 4, 5]);
    expect(b.pending).toContain('Distribua os valores rolados entre os atributos.');

    const full = build(
      ['abm', 'cl'],
      ['dr', dr],
      ...(['for', 'des', 'con', 'int', 'sab', 'car'] as const).map(
        (k, i) => [`da.${k}`, i] as [string, unknown],
      ),
    );
    expect(full.classicLeft).toEqual([]);
    expect(full.pending).not.toContain('Distribua os valores rolados entre os atributos.');
    expect(full.abilities.car.total).toBe(6);
  });

  it('clássico: rolagens adulteradas são descartadas', () => {
    const bad = build(['abm', 'cl'], ['dr', [[7, 1, 1, 1]]], ['da.for', 0]);
    expect(bad.classicRolls).toBeUndefined();
    expect(bad.sheet.dr).toBeUndefined();
    expect(bad.pending).toContain('Role os dados dos atributos.');
  });

  it('bônus raciais entram automaticamente (Alto Elfo: DES +2, INT +1)', () => {
    const b = build(['rc', 'elfo'], ['sr', 'alto'], ['ab.des', 14], ['ab.int', 12]);
    expect(b.abilities.des.total).toBe(16);
    expect(b.abilities.int.total).toBe(13);
    expect(b.abilities.des.racial).toBe(2);
  });

  it('Humano soma +1 em todos os atributos', () => {
    const b = build(['rc', 'humano']);
    expect(Object.values(b.abilities).map((a) => a.total)).toEqual([9, 9, 9, 9, 9, 9]);
  });

  it('Meio-Elfo: CAR +2 e dois outros atributos +1, distintos e nunca CAR', () => {
    const b = build(['rc', 'meio-elfo'], ['rb.0', 'des'], ['rb.1', 'des']);
    expect(b.abilities.car.total).toBe(10);
    expect(b.abilities.des.total).toBe(9);
    expect(b.pending).toContain('Escolha os atributos do bônus racial.');
    expect(build(['rc', 'meio-elfo'], ['rb.0', 'car']).abilities.car.total).toBe(10);
  });

  it('sub-raça é obrigatória quando a raça tem sub-raças', () => {
    expect(build(['rc', 'anao']).pending).toContain('Escolha a sub-raça.');
    expect(build(['rc', 'humano']).pending).not.toContain('Escolha a sub-raça.');
    expect(build(['rc', 'humano'], ['sr', 'colina']).subrace).toBeUndefined();
  });

  it('Aumento de Atributo: +1 duas vezes por nível, máximo 20', () => {
    const b = build(
      ['cl', 'barbaro'],
      ['rc', 'draconato'],
      ['lvl', 8],
      ['ab.for', 15],
      ['asi.4.a', 'for'],
      ['asi.4.b', 'for'],
      ['asi.8.a', 'for'],
      ['asi.8.b', 'for'],
    );
    expect(b.abilities.for.total).toBe(20);
    expect(b.abilities.for.increase).toBe(3);
    expect(b.pending).toContain('Escolha o Aumento de Atributo do nível 8.');
  });

  it('só há Aumento de Atributo nos níveis certos (Guerreiro tem 6 e 14; Ladino, 10)', () => {
    expect(build(['cl', 'guerreiro'], ['lvl', 14]).asiLevels).toEqual([4, 6, 8, 12, 14]);
    expect(build(['cl', 'ladino'], ['lvl', 10]).asiLevels).toEqual([4, 8, 10]);
    expect(build(['cl', 'mago'], ['lvl', 3], ['asi.4.a', 'int']).abilities.int.increase).toBe(0);
  });
});

describe('classe, vida e defesa', () => {
  it('PV: dado máximo no 1º nível e valor médio nos seguintes, com CON', () => {
    // Mago d6, CON 14 (+2), nível 3: 6+2 + 2×(4+2) = 20
    expect(build(['cl', 'mago'], ['lvl', 3], ['ab.con', 14]).hpMax).toBe(20);
    // Bárbaro d12, CON 8 (−1), nível 1: 12−1
    expect(build(['cl', 'barbaro'], ['ab.con', 8]).hpMax).toBe(11);
    expect(build(['cl', 'barbaro'], ['lvl', 5]).hitDice).toBe('5d12');
    expect(build().hpMax).toBeNull();
  });

  it('PV: Anão da Colina ganha +1 por nível', () => {
    const plain = build(['cl', 'guerreiro'], ['lvl', 4], ['rc', 'anao'], ['sr', 'montanha']);
    const hill = build(['cl', 'guerreiro'], ['lvl', 4], ['rc', 'anao'], ['sr', 'colina']);
    expect(hill.hpMax! - plain.hpMax!).toBe(4);
  });

  it('PV atuais nunca passam do máximo', () => {
    const b = build(['cl', 'mago'], ['hpc', 99]);
    expect(b.sheet.hpc).toBe(b.hpMax);
    expect(build(['cl', 'mago'], ['hpc', 4]).sheet.hpc).toBe(4);
  });

  it('CA: armadura, limite de Destreza, escudo e bônus mágico', () => {
    const base: [string, unknown][] = [
      ['cl', 'guerreiro'],
      ['rc', 'humano'],
      ['ab.des', 15],
    ]; // DES 16 (+3)
    expect(build(...base).ac).toBe(13);
    expect(build(...base, ['ar', 'couro']).ac).toBe(14);
    expect(build(...base, ['ar', 'meia-armadura']).ac).toBe(17); // DES limitado a +2
    expect(build(...base, ['ar', 'placas']).ac).toBe(18);
    expect(build(...base, ['ar', 'placas'], ['sh', true], ['arb', 1], ['shb', 2]).ac).toBe(23);
    expect(build(...base, ['ar', 'placas'], ['fs', 'defesa']).ac).toBe(19);
    expect(build(...base, ['fs', 'defesa']).ac).toBe(13); // Defesa só vale com armadura
  });

  it('CA sem armadura: Bárbaro soma CON, Monge soma SAB (sem escudo)', () => {
    expect(build(['cl', 'barbaro'], ['ab.des', 14], ['ab.con', 15]).ac).toBe(14);
    const monk: [string, unknown][] = [
      ['cl', 'monge'],
      ['ab.des', 14],
      ['ab.sab', 15],
    ];
    expect(build(...monk).ac).toBe(14);
    expect(build(...monk, ['sh', true]).ac).toBe(14); // 10 + DES + escudo 2
  });

  it('deslocamento: raça, Força insuficiente e anões', () => {
    expect(build(['rc', 'humano']).speed).toBe('9 m');
    expect(build(['rc', 'anao'], ['sr', 'colina']).speed).toBe('7,5 m');
    expect(build(['rc', 'elfo'], ['sr', 'floresta']).speed).toBe('10,5 m');
    const noStrength: [string, unknown][] = [
      ['cl', 'guerreiro'],
      ['ar', 'placas'],
    ];
    expect(build(['rc', 'humano'], ...noStrength).speed).toBe('6 m');
    expect(build(['rc', 'anao'], ['sr', 'colina'], ...noStrength).speed).toBe('7,5 m');
  });

  it('salvaguardas: só as duas da classe recebem proficiência', () => {
    const b = build(['cl', 'mago'], ['lvl', 5], ['ab.int', 15]);
    expect(b.saveProficient).toEqual({
      for: false,
      des: false,
      con: false,
      int: true,
      sab: true,
      car: false,
    });
    expect(b.saves.int).toBe(2 + 3);
    expect(b.saves.for).toBe(-1);
  });

  it('classe, subclasse e nível inválidos são corrigidos', () => {
    expect(normalizeSheet({ cl: 'ninja', lvl: 99 }).cl).toBe('');
    expect(normalizeSheet({ cl: 'ninja', lvl: 99 }).lvl).toBe(20);
    expect(build(['cl', 'mago'], ['lvl', 1], ['sb', 'evocacao']).sheet.sb).toBe('');
    expect(build(['cl', 'mago'], ['lvl', 2], ['sb', 'evocacao']).sheet.sb).toBe('evocacao');
    expect(build(['cl', 'clerigo'], ['lvl', 1], ['sb', 'vida']).sheet.sb).toBe('vida');
    expect(build(['cl', 'clerigo'], ['lvl', 1], ['sb', 'evocacao']).sheet.sb).toBe('');
  });

  it('fichas antigas com texto livre são reconhecidas pelo nome', () => {
    const s = normalizeSheet({
      cl: 'Mago',
      rc: 'Elfo',
      bg: 'Sábio',
      al: 'Leal e Bom',
      sk: { 3: 2 },
      hpm: 99,
    });
    expect([s.cl, s.rc, s.bg, s.al]).toEqual(['mago', 'elfo', 'sabio', 'lb']);
    expect(s.sk).toBeUndefined();
    expect(s.hpm).toBeUndefined();
    expect(normalizeSheet({ cl: 'Maga' }).cl).toBe('');
  });
});

describe('perícias', () => {
  it('antecedente e raça concedem perícias; a classe só oferece as suas', () => {
    const b = build(['cl', 'mago'], ['bg', 'sabio'], ['rc', 'elfo'], ['sr', 'alto'], ['lvl', 1]);
    expect(b.skillLevel[2]).toBe(1); // Arcanismo (antecedente)
    expect(b.skillLevel[7]).toBe(1); // História (antecedente)
    expect(b.skillLevel[13]).toBe(1); // Percepção (elfo)
    expect(b.skillChoices.classCount).toBe(2);
    expect(build(['cl', 'mago'], ['csk.0', 3]).sheet.csk).toEqual({}); // Atletismo não é de Mago
  });

  it('perícia repetida entre fontes vira uma substituta à escolha', () => {
    const picks: [string, unknown][] = [
      ['cl', 'mago'],
      ['bg', 'sabio'],
      ['csk.0', 2],
      ['csk.1', 10],
    ];
    const dup = build(...picks);
    expect(dup.skillChoices.substituteCount).toBe(1);
    expect(dup.pending).toContain('Escolha as perícias que faltam.');
    const fixed = build(...picks, ['ssk.0', 11]);
    expect(fixed.skillChoices.substituteCount).toBe(1);
    expect(fixed.pending).not.toContain('Escolha as perícias que faltam.');
    expect(fixed.skillLevel[11]).toBe(1);
    expect(build(...picks, ['ssk.0', 2]).sheet.ssk).toEqual({}); // já proficiente
  });

  it('bônus de perícia = modificador + proficiência; Percepção passiva = 10 + bônus', () => {
    const b = build(
      ['cl', 'patrulheiro'],
      ['lvl', 5],
      ['rc', 'humano'],
      ['ab.sab', 15],
      ['csk.0', 13],
    );
    // SAB 16 (+3), proficiência +3
    expect(b.skills[13]).toBe(6);
    expect(b.passivePerception).toBe(16);
    expect(b.skills[1]).toBe(3);
  });

  it('especialização do Ladino (2 no 1º nível, +2 no 6º) só entre perícias proficientes', () => {
    const base: [string, unknown][] = [
      ['cl', 'ladino'],
      ['csk.0', 6],
      ['csk.1', 13],
      ['csk.2', 8],
      ['csk.3', 5],
    ];
    expect(build(...base).skillChoices.expertiseCount).toBe(2);
    expect(build(...base, ['lvl', 6]).skillChoices.expertiseCount).toBe(4);
    const b = build(...base, ['exp.0', 6], ['exp.1', 0]);
    expect(b.skillLevel[6]).toBe(2);
    expect(b.sheet.exp).toEqual({ 0: 6 }); // Acrobacia não é proficiente
    expect(b.skills[6]).toBe(-1 + 4);
  });
});

describe('armas e ataques', () => {
  const fighter: [string, unknown][] = [
    ['cl', 'guerreiro'],
    ['rc', 'humano'],
    ['ab.for', 15],
    ['ab.des', 15],
  ]; // 16 e 16

  it('ataque = modificador + proficiência; dano = dado + modificador', () => {
    const b = build(...fighter, ['at.0.w', 'espada-longa']);
    expect(b.attacks[0]).toMatchObject({
      bonus: 5,
      proficient: true,
      damage: '1d8 (1d10) + 3 cortante',
    });
  });

  it('sem proficiência, o bônus não entra', () => {
    const b = build(['cl', 'mago'], ['rc', 'humano'], ['ab.for', 15], ['at.0.w', 'espada-longa']);
    expect(b.attacks[0]).toMatchObject({ bonus: 3, proficient: false });
  });

  it('acuidade usa o melhor entre FOR e DES; armas à distância usam DES', () => {
    const b = build(
      ['cl', 'guerreiro'],
      ['ab.des', 15],
      ['at.0.w', 'rapieira'],
      ['at.1.w', 'arco-longo'],
    );
    expect(b.attacks[0]).toMatchObject({ bonus: 4 }); // DES 15 (+2) + 2
    expect(b.attacks[1]).toMatchObject({ bonus: 4 });
  });

  it('estilos de luta: Arquearia (+2 ataque à distância) e Duelismo (+2 dano corpo a corpo)', () => {
    const arch = build(...fighter, ['fs', 'arquearia'], ['at.0.w', 'arco-longo']);
    expect(arch.attacks[0]!.bonus).toBe(7);
    const duel = build(
      ...fighter,
      ['fs', 'duelismo'],
      ['at.0.w', 'espada-longa'],
      ['at.1.w', 'espada-grande'],
    );
    expect(duel.attacks[0]!.damage).toBe('1d8 (1d10) + 5 cortante');
    expect(duel.attacks[1]!.damage).toBe('2d6 + 3 cortante');
  });

  it('bônus mágico soma no ataque e no dano, de +0 a +3', () => {
    const b = build(...fighter, ['at.0.w', 'maca'], ['at.0.m', 2]);
    expect(b.attacks[0]).toMatchObject({ bonus: 7, damage: '1d6 + 5 contundente' });
    expect(build(...fighter, ['at.0.w', 'maca'], ['at.0.m', 4]).attacks[0]!.bonus).toBe(5);
  });

  it('golpe desarmado: 1 + FOR; Monge usa dado de Artes Marciais', () => {
    expect(
      build(['cl', 'guerreiro'], ['ab.for', 14], ['at.0.w', 'desarmado']).attacks[0]!.damage,
    ).toBe('3 contundente');
    const monk = build(['cl', 'monge'], ['lvl', 5], ['ab.des', 15], ['at.0.w', 'desarmado']);
    expect(monk.attacks[0]).toMatchObject({ bonus: 5, damage: '1d6 + 2 contundente' });
  });

  it('arma desconhecida é ignorada', () => {
    expect(build(...fighter, ['at.0.w', 'bazuca']).attacks[0]).toBeNull();
  });
});

describe('conjuração', () => {
  it('CD, ataque, espaços e truques do Mago', () => {
    const b = build(['cl', 'mago'], ['lvl', 3], ['rc', 'humano'], ['ab.int', 15]); // INT 16 (+3)
    expect(b.spell).toMatchObject({
      ability: 'int',
      dc: 13,
      attack: 5,
      cantrips: 3,
      slots: { 1: 4, 2: 2 },
      maxCircle: 2,
      mode: 'book',
      spellLimit: 10,
      preparedLimit: 6,
    });
  });

  it('classes sem magia não têm ficha de magias; meio-conjuradores começam no 2º nível', () => {
    expect(build(['cl', 'guerreiro']).spell).toBeNull();
    expect(build(['cl', 'paladino'], ['lvl', 1]).spell).toBeNull();
    expect(build(['cl', 'paladino'], ['lvl', 2]).spell?.slots).toEqual({ 1: 2 });
    expect(build(['cl', 'patrulheiro'], ['lvl', 5]).spell?.slots).toEqual({ 1: 4, 2: 2 });
  });

  it('subclasses conjuradoras: Cavaleiro Místico e Trapaceiro Arcano usam INT a partir do 3º nível', () => {
    expect(build(['cl', 'guerreiro'], ['lvl', 3]).spell).toBeNull();
    const ek = build(['cl', 'guerreiro'], ['lvl', 3], ['sb', 'cavaleiro-mistico']);
    expect(ek.spell).toMatchObject({ ability: 'int', cantrips: 2, slots: { 1: 2 }, spellLimit: 3 });
    expect(build(['cl', 'ladino'], ['lvl', 7], ['sb', 'trapaceiro-arcano']).spell?.slots).toEqual({
      1: 4,
      2: 2,
    });
  });

  it('Bruxo: espaços de Pacto todos no mesmo círculo', () => {
    const w = build(['cl', 'bruxo'], ['lvl', 5]);
    expect(w.spell).toMatchObject({
      slots: { 3: 2 },
      maxCircle: 3,
      cantrips: 3,
      spellLimit: 6,
      mode: 'known',
    });
    expect(build(['cl', 'bruxo'], ['lvl', 17]).spell?.slots).toEqual({ 5: 4 });
  });

  it('Clérigo prepara modificador + nível, fora as magias de domínio', () => {
    const b = build(['cl', 'clerigo'], ['lvl', 3], ['sb', 'vida'], ['ab.sab', 15]); // SAB 15 (+2)
    expect(b.spell).toMatchObject({ mode: 'prepared', spellLimit: 5 + 4 });
  });

  it('Alto Elfo ganha um truque de Mago, mesmo sem classe conjuradora', () => {
    const b = build(['cl', 'guerreiro'], ['rc', 'elfo'], ['sr', 'alto']);
    expect(b.spell).toMatchObject({ cantrips: 1, ability: 'int', spellLimit: 0 });
  });

  it('limita truques, magias, preparo e espaços gastos', () => {
    const names = (circle: number, n: number): [string, unknown][] =>
      Array.from({ length: n }, (_, i) => [`sp.${circle}.${i}.n`, `Magia ${i}`]);
    const b = build(
      ['cl', 'mago'],
      ...names(0, 6),
      ...names(1, 9),
      ...names(2, 2),
      ['sl.1.e', 9],
      ['sp.1.0.p', true],
      ['sp.1.1.p', true],
      ['sp.1.2.p', true],
      ['sp.1.3.p', true],
    );
    const sp = b.sheet.sp as Record<number, Record<number, { p?: boolean }>>;
    expect(Object.keys(sp[0]!)).toHaveLength(3); // truques do nível 1
    expect(Object.keys(sp[1]!)).toHaveLength(6); // grimório do nível 1
    expect(sp[2]).toBeUndefined(); // sem espaços de 2º círculo
    expect(Object.values(sp[1]!).filter((e) => e.p)).toHaveLength(1); // INT 8 (−1) + nível 1, mínimo de 1
    expect(getPath(b.sheet, 'sl.1.e')).toBe(2);
    expect(getPath(b.sheet, 'sl.2')).toBeUndefined();
  });

  it('classe sem conjuração perde magias gravadas', () => {
    expect(build(['cl', 'guerreiro'], ['sp.1.0.n', 'Mísseis']).sheet.sp).toBeUndefined();
  });
});

describe('dados de regra', () => {
  it('ids são únicos', () => {
    for (const list of [CLASSES, RACES, BACKGROUNDS, ALIGNMENTS, WEAPONS, FIGHTING_STYLES]) {
      expect(new Set(list.map((x) => x.id)).size).toBe(list.length);
    }
  });

  it('listas do Livro do Jogador: 12 classes, 9 raças, 13 antecedentes, 9 tendências', () => {
    expect([CLASSES.length, RACES.length, BACKGROUNDS.length, ALIGNMENTS.length]).toEqual([
      12, 9, 13, 9,
    ]);
  });

  it('armas citadas por classes e raças existem', () => {
    const known = new Set(['simples', 'marcial', ...WEAPONS.map((w) => w.id)]);
    const cited = [
      ...CLASSES.flatMap((c) => c.weapons),
      ...RACES.flatMap((r) => [...r.weapons, ...r.subraces.flatMap((s) => s.weapons ?? [])]),
    ];
    expect(cited.filter((w) => !known.has(w))).toEqual([]);
  });

  it('estilos de luta citados existem', () => {
    const ids = FIGHTING_STYLES.map((s) => s.id);
    const cited = CLASSES.flatMap((c) => c.fightingStyle?.options ?? []);
    expect(cited.filter((s) => !ids.includes(s))).toEqual([]);
  });

  it('cada antecedente concede 2 perícias e cada classe tem perícias suficientes', () => {
    expect(BACKGROUNDS.every((b) => b.skills.length === 2)).toBe(true);
    expect(CLASSES.every((c) => c.skills.length >= c.skillCount)).toBe(true);
  });
});

describe('resumo, caminhos e esquema', () => {
  it('resumo usa nomes das listas e valores derivados', () => {
    expect(summarize({})).toBe('Ficha em branco.');
    const sheet = { cl: 'mago', lvl: 3, rc: 'elfo', sr: 'alto', bg: 'sabio' };
    expect(summarize(sheet)).toBe('Alto Elfo · Mago 3\nSábio\nPV 11/11\nCA 10');
    expect(summarize({ ...sheet, hpc: 5 })).toBe('Alto Elfo · Mago 3\nSábio\nPV 5/11\nCA 10');
  });

  it('setPath é imutável e cria níveis intermediários', () => {
    const base = defaultSheet();
    const next = setPath(base, 'at.2.w', 'adaga');
    expect(getPath(next, 'at.2.w')).toBe('adaga');
    expect(getPath(base, 'at.2.w')).toBeUndefined();
  });

  it('setPath ignora chaves perigosas', () => {
    const base = defaultSheet();
    expect(setPath(base, '__proto__.x', 1)).toBe(base);
    expect(({} as Record<string, unknown>).x).toBeUndefined();
  });

  it('rejeita fichas enormes', () => {
    expect(sheetSchema.safeParse({ nm: 'x'.repeat(300_000) }).success).toBe(false);
    expect(sheetSchema.safeParse(defaultSheet()).success).toBe(true);
  });

  it('normalizar é idempotente', () => {
    const once = build(
      ['cl', 'mago'],
      ['rc', 'elfo'],
      ['sr', 'alto'],
      ['lvl', 4],
      ['ab.int', 15],
    ).sheet;
    expect(normalizeSheet(once)).toEqual(once);
  });
});
