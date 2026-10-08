# Tarrasque

Aplicação web para organizar personagens, campanhas e recursos de RPG D&D 5e, com interface inspirada no guia visual Odysseus.

Stack: Next.js (App Router) · TypeScript · PostgreSQL · Prisma · Better Auth · Zod · Vitest · Playwright. Monolito modular (ver `docs/architecture.md`).

## Executar

Pré-requisitos: Node 22+, pnpm e Docker Desktop (para o Postgres local).

```sh
pnpm install
cp .env.example .env     # ajuste BETTER_AUTH_SECRET (32+ caracteres)
pnpm db:up
pnpm db:migrate
pnpm dev                 # http://localhost:3000
```

Qualidade: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm e2e`.

## Estado

A migração é feita por fases (detalhes em `docs/architecture.md`):

1. **Fundação** (concluída): projeto, casca visual idêntica ao original (sidebar, topbar, temas, diálogos), schema Prisma, ambiente de agents/hooks.
2. Identidade e coleções (próxima).
3. Ficha de personagem.
4. Dados.
5. Polimento, importador do `localStorage` e deploy.

Até a fase 2, listas, busca e criação de registros ainda não estão ativas; o app original completo permanece em `legacy/dist` e pode ser aberto direto no navegador.

## Estrutura

- `src/app`: rotas. `src/modules`: domínios. `src/platform`: banco e ambiente. `src/styles`: CSS (herdado do legado).
- `prisma/`: schema e migrations. `docs/`: design e arquitetura. `.claude/`: agents, skills e hooks.
- `legacy/dist`: app estático original (referência visual e funcional). `.openai/hosting.json` é só a identificação da hospedagem original.

## Referências

- Organização de ferramentas: [D&D Beyond](https://www.dndbeyond.com/en/dnd-campaigns).
- Princípios de movimento: [Animation Mentor](https://www.animationmentor.com/blog/tutorial-bouncing-ball-physics/).
- Tipografia: [Fira Code](https://github.com/tonsky/FiraCode), distribuída sob a SIL Open Font License (`src/app/fonts/LICENSE`).
