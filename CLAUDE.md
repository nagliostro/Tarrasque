# CLAUDE.md

Orientação para o Claude Code neste repositório.

## Projeto

Tarrasque (pt-BR) organiza personagens, campanhas e recursos de RPG D&D 5e. Está sendo migrado de uma SPA estática (`legacy/dist`, só `localStorage`) para um **monolito modular em Next.js (App Router) + PostgreSQL + Prisma**, mantendo o visual idêntico. O estado por fases está em `docs/architecture.md`. Fases só avançam quando o usuário pede.

## Comandos

```sh
pnpm install
pnpm db:up          # Postgres via docker compose (precisa do Docker Desktop)
pnpm db:migrate     # prisma migrate dev
pnpm dev            # http://localhost:3000
pnpm typecheck      # next typegen && tsc --noEmit
pnpm lint           # ESLint (inclui regras de fronteira entre módulos)
pnpm test           # Vitest (domínio)
pnpm e2e            # Playwright
pnpm build
```

Copie `.env.example` para `.env` (segredos nunca vão para o git; o hook `guard` bloqueia edição de `.env*`).

## Arquitetura (resumo; detalhes em `docs/architecture.md`)

- `src/app/`: rotas finas, só compõem módulos. `(app)/layout.tsx` lê cookies (tema, sidebar, perfil) no servidor.
- `src/modules/<nome>/`: um domínio por pasta, camadas `domain → application → infra → ui`, API pública só em `index.ts`. **Módulos importam outros módulos apenas pelo `index.ts`** (lint falha caso contrário). Hoje existe `shared` (casca, ícones, dialog, toast, seções, tema).
- `src/platform/`: `db.ts` (Prisma + `@prisma/adapter-pg`), `env.ts` (Zod). Não importa módulos.
- `src/generated/prisma`: cliente gerado (ignorado pelo git; `pnpm build` roda `prisma generate`; use `pnpm exec prisma generate` após mexer no schema).
- `prisma/schema.prisma`: modelos `User/Session/Account/Verification` (Better Auth), `CollectionEntry`, `Character` (`sheet` Json), `DiceRoll`.

## Visual (fonte de verdade: `docs/design.md`)

- O CSS do legado foi copiado quase literal para `src/styles/` (`globals.css`, `sheet.css`). Paletas ficam em `theme.css` por `data-theme`, definido no servidor a partir do cookie `tarrasque-theme`. Fira Code via `next/font/local`.
- Tailwind v4 está instalado só com `theme` e `utilities` (sem preflight) e tokens mapeados em `tailwind.css`; use apenas em telas novas. Não reescreva o CSS existente em utilitários.
- `legacy/dist` é a referência visual e funcional; consulte com `Grep` (arquivos densos) ao portar telas.

## Ambiente Claude (`.claude/`)

- Agents: `module-builder` (um por módulo, em worktrees), `prisma-db` (único dono de `prisma/`), `ui-fidelity`, `test-writer`, `reviewer`.
- Skills: `new-module`, `new-collection`, `port-legacy-screen`, `db-migrate`.
- Hooks (`settings.json`): `guard` (bloqueia `.env*`, migrations aplicadas, `migrate reset`/`db push --force`), `format` (Prettier + ESLint por arquivo editado), `check` (typecheck + testes no Stop), `session-start`.

## Armadilhas conhecidas

- Mantenha `typescript` em 6.x: o typescript-eslint ainda não suporta TS 7.
- Prisma 7 declara suporte a Node até 24; funciona no Node 26 local (verificado), mas atenção em CI.
- Escreva arquivos JSON/config sem BOM (um `package.json` com BOM quebra o build).
- Ao trocar o tema no servidor, lembre do `<meta name="theme-color">` (já tratado em `generateViewport`).
