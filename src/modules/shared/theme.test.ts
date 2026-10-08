import { describe, expect, it } from 'vitest';
import { initials, parseTheme } from './theme';

describe('parseTheme', () => {
  it('aceita temas conhecidos', () => {
    expect(parseTheme('forest')).toBe('forest');
  });
  it('cai para dark em valores inválidos ou ausentes', () => {
    expect(parseTheme('roxo')).toBe('dark');
    expect(parseTheme(undefined)).toBe('dark');
  });
});

describe('initials', () => {
  it('usa as duas primeiras palavras em maiúsculas', () => {
    expect(initials('ana maria souza')).toBe('AM');
  });
  it('usa AV quando o nome está vazio', () => {
    expect(initials('   ')).toBe('AV');
  });
});
