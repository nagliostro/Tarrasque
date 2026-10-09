import { describe, expect, it } from 'vitest';
import {
  criticals,
  expandDice,
  nextAvailable,
  notation,
  overLimit,
  rollDie,
  rollInputSchema,
} from './dice';

describe('dice', () => {
  it('formata a notação com sinal do modificador', () => {
    const groups = [
      { quantity: 2, sides: 6 },
      { quantity: 1, sides: 20 },
    ];
    expect(notation(groups, 3)).toBe('2d6 + 1d20+3');
    expect(notation(groups, -2)).toBe('2d6 + 1d20-2');
    expect(notation(groups, 0)).toBe('2d6 + 1d20+0');
    expect(expandDice(groups)).toEqual([6, 6, 20]);
  });

  it('limita 10 dados por tipo somando os grupos', () => {
    expect(
      overLimit([
        { quantity: 6, sides: 6 },
        { quantity: 5, sides: 6 },
      ]),
    ).toBe(6);
    expect(
      overLimit([
        { quantity: 10, sides: 6 },
        { quantity: 10, sides: 8 },
      ]),
    ).toBeUndefined();
  });

  it('sugere o próximo tipo livre na ordem do legado', () => {
    expect(nextAvailable([{ quantity: 1, sides: 20 }])).toBe(6);
    expect(nextAvailable([{ quantity: 10, sides: 6 }])).toBe(4);
  });

  it('rollDie cobre 1..n e descarta o viés', () => {
    expect(rollDie(20, () => 0)).toBe(1);
    expect(rollDie(20, () => 19)).toBe(20);
    const limit = Math.floor(4294967296 / 6) * 6;
    const seq = [limit, limit + 1, 2];
    expect(rollDie(6, () => seq.shift()!)).toBe(3);
  });

  it('crítico considera só o d20 natural', () => {
    expect(criticals([20, 6, 20, 20], [20, 20, 1, 7])).toEqual({ hits: 1, misses: 1 });
    expect(criticals([6], [1])).toEqual({ hits: 0, misses: 0 });
  });

  it('valida a entrada', () => {
    const ok = { groups: [{ quantity: 1, sides: 20 }], modifier: 0 };
    expect(rollInputSchema.safeParse(ok).success).toBe(true);
    expect(rollInputSchema.safeParse({ ...ok, modifier: 1001 }).success).toBe(false);
    expect(rollInputSchema.safeParse({ ...ok, groups: [{ quantity: 1, sides: 7 }] }).success).toBe(
      false,
    );
    expect(rollInputSchema.safeParse({ ...ok, groups: [{ quantity: 11, sides: 6 }] }).success).toBe(
      false,
    );
  });
});
