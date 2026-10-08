import { z } from 'zod';

export const THEMES = ['dark', 'light', 'forest', 'terminal'] as const;

const email = z.string().trim().toLowerCase().pipe(z.email('Digite um e-mail válido.'));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Digite sua senha.').max(128),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(1, 'Digite seu nome.').max(32, 'Use até 32 caracteres no nome.'),
  email,
  password: z
    .string()
    .min(8, 'A senha precisa ter ao menos 8 caracteres.')
    .max(128, 'A senha pode ter no máximo 128 caracteres.'),
});

/** Mesmo comportamento do legado: corta em 32 caracteres e cai para "Aventureiro" se vazio. */
export const displayNameSchema = z
  .string()
  .trim()
  .transform((value) => value.slice(0, 32).trim() || 'Aventureiro');

export const preferencesSchema = z.object({
  theme: z.enum(THEMES).optional(),
  sidebarCollapsed: z.boolean().optional(),
});

/** Primeira mensagem de validação, para exibir no formulário. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Dados inválidos.';
}

const AUTH_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'E-mail ou senha incorretos.',
  INVALID_EMAIL: 'Digite um e-mail válido.',
  USER_ALREADY_EXISTS: 'Já existe uma conta com este e-mail.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Já existe uma conta com este e-mail.',
  PASSWORD_TOO_SHORT: 'A senha precisa ter ao menos 8 caracteres.',
  PASSWORD_TOO_LONG: 'A senha pode ter no máximo 128 caracteres.',
};

/** Traduz um código de erro do Better Auth; desconhecidos viram uma mensagem genérica. */
export function authErrorMessage(code: string | undefined): string {
  return (code && AUTH_MESSAGES[code]) || 'Não foi possível concluir. Tente novamente.';
}
