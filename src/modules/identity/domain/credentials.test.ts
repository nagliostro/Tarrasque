import { describe, expect, it } from 'vitest';
import {
  authErrorMessage,
  displayNameSchema,
  firstIssue,
  preferencesSchema,
  signInSchema,
  signUpSchema,
} from './credentials';

describe('signUpSchema', () => {
  it('normaliza e-mail e nome', () => {
    const parsed = signUpSchema.parse({
      name: '  Ana ',
      email: '  ANA@Exemplo.com ',
      password: '12345678',
    });
    expect(parsed).toEqual({ name: 'Ana', email: 'ana@exemplo.com', password: '12345678' });
  });

  it('rejeita senha curta com mensagem em português', () => {
    const result = signUpSchema.safeParse({ name: 'Ana', email: 'a@b.co', password: '1234567' });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(firstIssue(result.error)).toBe('A senha precisa ter ao menos 8 caracteres.');
  });

  it('limita o nome a 32 caracteres', () => {
    const result = signUpSchema.safeParse({
      name: 'x'.repeat(33),
      email: 'a@b.co',
      password: '12345678',
    });
    expect(result.success).toBe(false);
  });
});

describe('signInSchema', () => {
  it('rejeita e-mail inválido', () => {
    expect(signInSchema.safeParse({ email: 'nao-e-email', password: 'x' }).success).toBe(false);
  });
});

describe('displayNameSchema', () => {
  it('usa Aventureiro quando vazio', () => {
    expect(displayNameSchema.parse('   ')).toBe('Aventureiro');
  });
  it('corta espaços das pontas', () => {
    expect(displayNameSchema.parse('  Lia  ')).toBe('Lia');
  });
});

describe('preferencesSchema', () => {
  it('aceita só temas conhecidos', () => {
    expect(preferencesSchema.safeParse({ theme: 'forest' }).success).toBe(true);
    expect(preferencesSchema.safeParse({ theme: 'roxo' }).success).toBe(false);
  });
});

describe('authErrorMessage', () => {
  it('traduz códigos conhecidos', () => {
    expect(authErrorMessage('INVALID_EMAIL_OR_PASSWORD')).toBe('E-mail ou senha incorretos.');
  });
  it('não vaza códigos desconhecidos', () => {
    expect(authErrorMessage('ALGO_ESTRANHO')).toBe('Não foi possível concluir. Tente novamente.');
    expect(authErrorMessage(undefined)).toBe('Não foi possível concluir. Tente novamente.');
  });
});
