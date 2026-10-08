'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAPIError } from 'better-auth/api';
import { prisma } from '@/platform/db';
import { THEME_COOKIE } from '@/modules/shared';
import {
  authErrorMessage,
  displayNameSchema,
  firstIssue,
  preferencesSchema,
  signInSchema,
  signUpSchema,
} from '../domain/credentials';
import {
  AUTH_LIMITS,
  TOO_MANY_ATTEMPTS,
  clientIp,
  rateLimitKey,
  type Limit,
} from '../domain/rate-limit';
import { auth } from '../infra/auth';
import { hit } from '../infra/rate-limit';
import { requireUser } from './session';

/** Estado do formulário. `values` devolve o que foi digitado (nunca a senha) para não apagar os campos. */
export interface FormState {
  error?: string;
  values?: { name?: string; email?: string };
}

const COOKIE_OPTIONS = {
  path: '/',
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
} as const;

/** Cookie de tema: só cache para o servidor pintar o <html> sem flash. A fonte da verdade é o User. */
async function writeThemeCookie(theme: string) {
  (await cookies()).set(THEME_COOKIE, theme, COOKIE_OPTIONS);
}

function field(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === 'string' ? value : '';
}

/** Conta a tentativa em cada chave; devolve true se alguma estourou o limite. */
async function isThrottled(checks: [key: string, limit: Limit][]): Promise<boolean> {
  for (const [key, limit] of checks) {
    if (!(await hit(key, limit))) return true;
  }
  return false;
}

async function ipOf(): Promise<string> {
  return clientIp((await headers()).get('x-forwarded-for'));
}

export async function signInAction(_prev: FormState, data: FormData): Promise<FormState> {
  const values = { email: field(data, 'email') };
  const parsed = signInSchema.safeParse({ email: values.email, password: field(data, 'password') });
  if (!parsed.success) return { error: firstIssue(parsed.error), values };

  const ip = await ipOf();
  const throttled = await isThrottled([
    [rateLimitKey('login-ip', ip), AUTH_LIMITS.loginPerIp],
    [rateLimitKey('login', ip, parsed.data.email), AUTH_LIMITS.loginPerEmail],
  ]);
  if (throttled) return { error: TOO_MANY_ATTEMPTS, values };

  let theme: string;
  try {
    const { user } = await auth.api.signInEmail({ body: parsed.data });
    theme = user.theme ?? 'dark';
  } catch (error) {
    return {
      error: authErrorMessage(isAPIError(error) ? String(error.body?.code) : undefined),
      values,
    };
  }
  // A conta prevalece sobre o cookie do navegador (vale entre dispositivos).
  await writeThemeCookie(theme);
  redirect('/');
}

export async function signUpAction(_prev: FormState, data: FormData): Promise<FormState> {
  const values = { name: field(data, 'name'), email: field(data, 'email') };
  const parsed = signUpSchema.safeParse({ ...values, password: field(data, 'password') });
  if (!parsed.success) return { error: firstIssue(parsed.error), values };

  const throttled = await isThrottled([
    [rateLimitKey('signup-ip', await ipOf()), AUTH_LIMITS.signupPerIp],
  ]);
  if (throttled) return { error: TOO_MANY_ATTEMPTS, values };

  try {
    await auth.api.signUpEmail({ body: parsed.data });
  } catch (error) {
    return {
      error: authErrorMessage(isAPIError(error) ? String(error.body?.code) : undefined),
      values,
    };
  }
  await writeThemeCookie('dark'); // conta nova começa no tema padrão, não no do usuário anterior
  redirect('/');
}

export async function signOutAction(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  (await cookies()).delete(THEME_COOKIE); // próximo usuário deste navegador não herda o tema
  redirect('/login');
}

/** Salva tema e/ou estado da sidebar no usuário; o cookie de tema acompanha. */
export async function savePreferencesAction(input: {
  theme?: string;
  sidebarCollapsed?: boolean;
}): Promise<{ ok: boolean }> {
  const user = await requireUser();
  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  await prisma.user.update({ where: { id: user.id }, data: parsed.data });
  if (parsed.data.theme) await writeThemeCookie(parsed.data.theme);
  return { ok: true };
}

export async function saveDisplayNameAction(name: string): Promise<{ ok: boolean; name: string }> {
  const user = await requireUser();
  const parsed = displayNameSchema.safeParse(name);
  if (!parsed.success) return { ok: false, name: user.displayName };
  await prisma.user.update({ where: { id: user.id }, data: { displayName: parsed.data } });
  return { ok: true, name: parsed.data };
}
