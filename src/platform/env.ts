import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
});

let cached: z.infer<typeof schema> | undefined;

/** Validação preguiçosa: só falha quando o valor é realmente usado. */
export function env() {
  return (cached ??= schema.parse(process.env));
}
