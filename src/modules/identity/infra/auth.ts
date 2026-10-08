import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { env } from '@/platform/env';
import { prisma } from '@/platform/db';

export const auth = betterAuth({
  baseURL: env().BETTER_AUTH_URL,
  secret: env().BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true, minPasswordLength: 8, maxPasswordLength: 128 },
  // Login e cadastro só existem como Server Actions (validação Zod + rate limit próprio).
  // O router HTTP ignora estes caminhos; auth.api.* segue funcionando por dentro.
  disabledPaths: ['/sign-up/email', '/sign-in/email'],
  user: {
    // Preferências ficam em User; input:false impede que o cliente as defina no cadastro.
    additionalFields: {
      displayName: { type: 'string', required: false, input: false },
      theme: { type: 'string', required: false, input: false },
      sidebarCollapsed: { type: 'boolean', required: false, input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Atômico com a criação: o nome de exibição nasce igual ao nome informado.
        before: async (user) => ({ data: { ...user, displayName: user.name.slice(0, 32) } }),
      },
    },
  },
  // nextCookies precisa ser o último plugin: grava os cookies de sessão em Server Actions.
  plugins: [nextCookies()],
});
