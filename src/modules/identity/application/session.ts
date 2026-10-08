import { cache } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '../infra/auth';

export type ThemeName = 'dark' | 'light' | 'forest' | 'terminal';

export const THEME_NAMES: readonly ThemeName[] = ['dark', 'light', 'forest', 'terminal'];

export interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
  theme: ThemeName;
  sidebarCollapsed: boolean;
}

/** Sessão da requisição atual (memoizada por requisição). */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { user } = session;
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName || user.name,
    theme: THEME_NAMES.includes(user.theme as ThemeName) ? (user.theme as ThemeName) : 'dark',
    sidebarCollapsed: user.sidebarCollapsed ?? false,
  };
});

/** Para páginas e Server Actions: sem sessão, vai para o login. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}
