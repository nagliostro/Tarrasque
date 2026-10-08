import { prisma } from '@/platform/db';
import type { Limit } from '../domain/rate-limit';

/**
 * Conta uma tentativa na janela da chave, de forma atômica (um único UPSERT), e informa
 * se ainda está dentro do limite. Funciona com várias instâncias porque o estado está no Postgres.
 */
export async function hit(key: string, { limit, windowSec }: Limit): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "rate_limit" ("key", "count", "windowStart")
    VALUES (${key}, 1, now())
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "rate_limit"."windowStart" < now() - make_interval(secs => ${windowSec}::double precision)
        THEN 1 ELSE "rate_limit"."count" + 1 END,
      "windowStart" = CASE
        WHEN "rate_limit"."windowStart" < now() - make_interval(secs => ${windowSec}::double precision)
        THEN now() ELSE "rate_limit"."windowStart" END
    RETURNING "count"`;

  // Limpeza oportunista de janelas antigas (evita tabela crescendo sem cron).
  if (Math.random() < 0.02) {
    await prisma.rateLimit.deleteMany({
      where: { windowStart: { lt: new Date(Date.now() - 86_400_000) } },
    });
  }
  return (rows[0]?.count ?? 1) <= limit;
}
