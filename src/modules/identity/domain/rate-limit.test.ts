import { describe, expect, it } from 'vitest';
import { AUTH_LIMITS, clientIp, rateLimitKey } from './rate-limit';

describe('clientIp', () => {
  it('usa o primeiro IP da cadeia', () => {
    expect(clientIp('203.0.113.7, 10.0.0.1')).toBe('203.0.113.7');
  });
  it('cai para unknown sem cabeçalho, vazio ou absurdamente longo', () => {
    expect(clientIp(null)).toBe('unknown');
    expect(clientIp('  ')).toBe('unknown');
    expect(clientIp('x'.repeat(65))).toBe('unknown');
  });
});

describe('rateLimitKey', () => {
  it('separa escopo e partes', () => {
    expect(rateLimitKey('login', '1.2.3.4', 'a@b.co')).toBe('login:1.2.3.4:a@b.co');
  });
  it('limita o tamanho da chave (entrada controlada pelo cliente)', () => {
    expect(rateLimitKey('login', 'x'.repeat(500)).length).toBe(200);
  });
});

describe('AUTH_LIMITS', () => {
  it('login por e-mail é mais restrito que por IP', () => {
    expect(AUTH_LIMITS.loginPerEmail.limit).toBeLessThan(AUTH_LIMITS.loginPerIp.limit);
  });
});
