import { describe, expect, it } from 'vitest';
import { DICE } from './dice-geometry';

// [vértices, arestas] de cada sólido.
const EXPECTED: Record<string, [number, number]> = {
  d4: [4, 6],
  d6: [8, 12],
  d8: [6, 12],
  d10: [12, 20],
  d12: [20, 30],
  d20: [12, 30],
};

describe('DICE', () => {
  it.each(DICE)('$name tem vértices e arestas corretos', ({ name, vertices, edges }) => {
    expect([vertices.length, edges.length]).toEqual(EXPECTED[name]);
  });
});
