import { describe, expect, it } from 'vitest';
import { collectionKindFor, entryInputSchema } from './collection';

describe('collectionKindFor', () => {
  it('mapeia as coleções genéricas', () => {
    expect(collectionKindFor('campanha')).toBe('CAMPANHA');
    expect(collectionKindFor('bestiario')).toBe('BESTIARIO');
    expect(collectionKindFor('biblioteca')).toBe('BIBLIOTECA');
  });
  it('ignora personagem, dados e slugs desconhecidos', () => {
    expect(collectionKindFor('personagem')).toBeUndefined();
    expect(collectionKindFor('dados')).toBeUndefined();
    expect(collectionKindFor('toString')).toBeUndefined();
  });
});

describe('entryInputSchema', () => {
  it('aplica trim e detail padrão', () => {
    expect(entryInputSchema.parse({ name: '  Elmo  ' })).toEqual({ name: 'Elmo', detail: '' });
  });
  it('rejeita nome vazio com a mensagem do legado', () => {
    const r = entryInputSchema.safeParse({ name: '   ' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.message).toBe('Digite um nome.');
  });
  it('respeita os limites', () => {
    expect(entryInputSchema.safeParse({ name: 'a'.repeat(80) }).success).toBe(true);
    expect(entryInputSchema.safeParse({ name: 'a'.repeat(81) }).success).toBe(false);
    expect(entryInputSchema.safeParse({ name: 'a', detail: 'b'.repeat(6000) }).success).toBe(true);
    expect(entryInputSchema.safeParse({ name: 'a', detail: 'b'.repeat(6001) }).success).toBe(false);
  });
});
