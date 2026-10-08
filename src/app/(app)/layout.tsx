import { cookies } from 'next/headers';
import {
  AppShell,
  DEFAULT_PROFILE,
  PROFILE_COOKIE,
  SIDEBAR_COOKIE,
  Sprite,
  THEME_COOKIE,
  parseTheme,
} from '@/modules/shared';

function decode(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return undefined;
  }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  return (
    <>
      <Sprite />
      <AppShell
        initialTheme={parseTheme(jar.get(THEME_COOKIE)?.value)}
        initialCollapsed={jar.get(SIDEBAR_COOKIE)?.value === 'true'}
        initialProfile={decode(jar.get(PROFILE_COOKIE)?.value)?.slice(0, 32) || DEFAULT_PROFILE}
      >
        {children}
      </AppShell>
    </>
  );
}
