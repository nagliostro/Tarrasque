import { describe, expect, it } from 'vitest';
import {
  SCHOOLS,
  SPELLS,
  SPELL_CLASSES,
  defaultSheet,
  findSpell,
  resolve,
  setPath,
  spellsFor,
} from './sheet';

describe('catálogo de magias do Livro do Jogador', () => {
  it('tem ids e nomes únicos, círculos de 0 a 9 e dados completos', () => {
    expect(new Set(SPELLS.map((s) => s.id)).size).toBe(SPELLS.length);
    expect(new Set(SPELLS.map((s) => s.name)).size).toBe(SPELLS.length);
    for (const s of SPELLS) {
      expect(s.circle, s.name).toBeGreaterThanOrEqual(0);
      expect(s.circle, s.name).toBeLessThanOrEqual(9);
      expect(s.school in SCHOOLS, s.name).toBe(true);
      expect(s.classes.length, s.name).toBeGreaterThan(0);
      for (const c of s.classes) expect(c in SPELL_CLASSES, s.name).toBe(true);
      for (const f of [s.time, s.range, s.components, s.duration, s.text])
        expect(f.trim()).not.toBe('');
    }
  });

  it('cobre todos os círculos e tem o tamanho esperado', () => {
    for (let c = 0; c <= 9; c++)
      expect(
        SPELLS.some((s) => s.circle === c),
        `círculo ${c}`,
      ).toBe(true);
    expect(SPELLS.length).toBeGreaterThan(300);
  });

  it('marca concentração e ritual a partir da duração e do tempo', () => {
    expect(findSpell('Bola de Fogo')).toMatchObject({ circle: 3, concentration: false });
    expect(findSpell('Bênção')).toMatchObject({ circle: 1, concentration: true });
    expect(findSpell('Detectar Magia')).toMatchObject({ ritual: true, concentration: true });
  });

  it('filtra por lista de classe: Mísseis Mágicos é do Mago, não do Clérigo', () => {
    expect(spellsFor('ma', 1).map((s) => s.name)).toContain('Mísseis Mágicos');
    expect(spellsFor('cl', 1).map((s) => s.name)).not.toContain('Mísseis Mágicos');
    expect(spellsFor('ba', 0).map((s) => s.name)).toContain('Zombaria Dolorosa');
  });

  it('o Cavaleiro Místico usa a lista do Mago', () => {
    const sheet = [
      ['cl', 'guerreiro'],
      ['lvl', 3],
      ['sb', 'cavaleiro-mistico'],
    ].reduce((acc, [path, value]) => setPath(acc, path as string, value), defaultSheet());
    expect(resolve(sheet).spell?.list).toBe('ma');
  });
});
