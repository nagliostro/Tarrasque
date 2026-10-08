export const THEMES = {
  dark: { label: 'Original · Odysseus', bg: '#282c34' },
  light: { label: 'Claro', bg: '#f0ebe3' },
  forest: { label: 'Floresta', bg: '#1b2a1b' },
  terminal: { label: 'Terminal', bg: '#000000' },
} as const;

export type ThemeName = keyof typeof THEMES;

export const THEME_COOKIE = 'tarrasque-theme';

export function parseTheme(value: string | undefined): ThemeName {
  return value && value in THEMES ? (value as ThemeName) : 'dark';
}

export function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'AV'
  );
}
