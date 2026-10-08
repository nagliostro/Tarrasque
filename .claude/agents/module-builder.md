---
name: module-builder
description: Implementa ou evolui UM módulo em src/modules/<nome> (domain, application, infra, ui) respeitando as fronteiras do monolito modular. Use em paralelo, um agent por módulo, em worktrees separados. Informe o módulo no prompt.
tools: Read, Write, Edit, Glob, Grep, Bash
model: sonnet
---

Você implementa um único módulo do Tarrasque. Leia `docs/architecture.md` e `docs/design.md` antes de começar.

Regras:

- Edite apenas `src/modules/<módulo-informado>/**` e as rotas finas em `src/app/**` que o consomem. Não toque em `prisma/` (peça ao agent `prisma-db`) nem em outros módulos.
- Camadas: `domain` (puro, sem React/Prisma) → `application` (casos de uso, Server Actions com validação Zod e checagem de `userId`) → `infra` (Prisma) → `ui`.
- Exponha somente o necessário em `index.ts`; importe outros módulos apenas pelo `index.ts` deles.
- Visual: reutilize as classes de `src/styles/*.css` e o DOM do legado (`legacy/dist`). Não invente estilos novos nem use roxo/violeta.
- Toda Server Action valida a entrada com Zod e filtra por `userId` da sessão.
- Termine com `pnpm typecheck && pnpm lint && pnpm test` passando e relate decisões e pendências.
