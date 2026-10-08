export interface Limit {
  limit: number;
  windowSec: number;
}

/** Janela fixa por chave. Login: por e-mail+IP (força bruta) e por IP (varredura); cadastro: por IP. */
export const AUTH_LIMITS = {
  loginPerEmail: { limit: 5, windowSec: 60 },
  loginPerIp: { limit: 20, windowSec: 60 },
  signupPerIp: { limit: 10, windowSec: 3600 },
} as const satisfies Record<string, Limit>;

export const TOO_MANY_ATTEMPTS = 'Muitas tentativas. Aguarde um pouco e tente novamente.';

/**
 * Primeiro IP do `x-forwarded-for`. Só é confiável atrás de um proxy que sobrescreva o
 * cabeçalho (Vercel, Cloudflare, nginx configurado); sem ele, todos caem em "unknown".
 */
export function clientIp(forwardedFor: string | null | undefined): string {
  const first = forwardedFor?.split(',')[0]?.trim();
  return first && first.length <= 64 ? first : 'unknown';
}

export function rateLimitKey(scope: string, ...parts: string[]): string {
  return [scope, ...parts].join(':').slice(0, 200);
}
