---
name: new-module
description: Cria o esqueleto de um novo módulo do monolito modular em src/modules/<nome> (domain, application, infra, ui, index.ts). Use quando surgir um novo domínio de negócio.
---

# Novo módulo

Argumento: nome do módulo em minúsculas (ex.: `campaigns`).

1. Crie `src/modules/<nome>/` com `domain/`, `application/`, `infra/`, `ui/` e `index.ts`.
2. `index.ts` exporta apenas a API pública (casos de uso, componentes e tipos usados por outros módulos ou rotas). Nunca exporte `infra/`.
3. `domain/` é puro: sem React, Next ou Prisma. Escreva ao menos um teste `*.test.ts`.
4. `application/` contém casos de uso e Server Actions (`'use server'`): validar com Zod, obter `userId` da sessão, delegar ao domínio e à infra.
5. `infra/` usa `prisma` de `@/platform/db`. Se precisar de modelo novo, acione o agent `prisma-db`.
6. Rota fina em `src/app/(app)/...` apenas compõe componentes do módulo.
7. Atualize a tabela de módulos em `docs/architecture.md`.
8. Valide com `pnpm lint` (as regras de fronteira falham em import indevido), `pnpm typecheck` e `pnpm test`.
