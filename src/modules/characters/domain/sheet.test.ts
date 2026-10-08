import { describe, expect, it } from 'vitest';
import {
  abilityModifier,
  defaultSheet,
  derive,
  formatBonus,
  getPath,
  proficiencyBonus,
  setPath,
  sheetSchema,
  summarize,
} from './sheet';

describe('cálculos da ficha', () => {
  it('modificador de atributo arredonda para baixo', () => {
    expect([1, 8, 9, 10, 11, 12, 20, 30].map(abilityModifier)).toEqual([-5, -1, -1, 0, 0, 1, 5, 10]);
  });

  it('bônus de proficiência por nível', () => {
    expect([1, 4, 5, 8, 9, 13, 17, 20].map(proficiencyBonus)).toEqual([2, 2, 3, 3, 4, 5, 6, 6]);
    expect(proficiencyBonus('')).toBe(2);
    expect(proficiencyBonus(99)).toBe(6);
  });

  it('formata bônus com sinal tipográfico', () => {
    expect(formatBonus(3)).toBe('+3');
    expect(formatBonus(0)).toBe('+0');
    expect(formatBonus(-2)).toBe('−2');
  });

  it('deriva salvaguardas, perícias, percepção passiva, iniciativa e magia', () => {
    let s = setPath(defaultSheet(), 'lvl', 5); // proficiência +3
    s = setPath(s, 'ab.des', 14); // +2
    s = setPath(s, 'ab.sab', 16); // +3
    s = setPath(s, 'sv.des', 1);
    s = setPath(s, 'sk.13', 2); // Percepção, especialista
    s = setPath(s, 'sk.0', 1); // Acrobacia, proficiente
    s = setPath(s, 'sa', 'sab');
    const d = derive(s);
    expect(d.proficiency).toBe(3);
    expect(d.saves.des).toBe(5);
    expect(d.saves.for).toBe(0);
    expect(d.skills[0]).toBe(5);
    expect(d.skills[13]).toBe(9);
    expect(d.passivePerception).toBe(19);
    expect(d.initiative).toBe(2);
    expect(d.spellDc).toBe(14);
    expect(d.spellAttack).toBe(6);
  });

  it('sem atributo de conjuração não há CD nem bônus', () => {
    const d = derive(defaultSheet());
    expect(d.spellDc).toBeNull();
    expect(d.spellAttack).toBeNull();
  });

  it('resumo segue o legado', () => {
    expect(summarize({})).toBe('Ficha em branco.');
    expect(summarize({ rc: 'Elfo', cl: 'Mago', lvl: 3, bg: 'Sábio', hpm: 18, hpc: 12, ca: 13 })).toBe(
      'Elfo · Mago 3\nSábio\nPV 12/18\nCA 13',
    );
    expect(summarize({ hpm: 10 })).toBe('PV 10/10');
  });
});

describe('caminhos', () => {
  it('setPath é imutável e cria níveis intermediários', () => {
    const base = defaultSheet();
    const next = setPath(base, 'at.2.n', 'Espada');
    expect(getPath(next, 'at.2.n')).toBe('Espada');
    expect(getPath(base, 'at.2.n')).toBeUndefined();
  });

  it('ignora chaves perigosas', () => {
    const base = defaultSheet();
    expect(setPath(base, '__proto__.x', 1)).toBe(base);
    expect(({} as Record<string, unknown>).x).toBeUndefined();
  });
});

describe('sheetSchema', () => {
  it('rejeita fichas enormes', () => {
    expect(sheetSchema.safeParse({ nm: 'x'.repeat(300_000) }).success).toBe(false);
    expect(sheetSchema.safeParse(defaultSheet()).success).toBe(true);
  });
});
