import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { cookies } from 'next/headers';
import { THEMES, THEME_COOKIE, parseTheme } from '@/modules/shared';
import '@/styles/tailwind.css';
import '@/styles/theme.css';
import '@/styles/globals.css';
import '@/styles/sheet.css';

const fira = localFont({
  src: './fonts/FiraCode.woff2',
  weight: '400',
  display: 'swap',
  variable: '--font-fira',
});

export const metadata: Metadata = {
  title: { default: 'Tarrasque', template: '%s · Tarrasque' },
  description: 'Tarrasque — seu espaço para personagens e campanhas de RPG.',
};

export async function generateViewport(): Promise<Viewport> {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);
  return { width: 'device-width', initialScale: 1, themeColor: THEMES[theme].bg };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);
  return (
    <html lang="pt-BR" data-theme={theme} className={fira.variable}>
      <body>{children}</body>
    </html>
  );
}
