---
name: new-collection
description: Adiciona uma nova coleção genérica {name, detail} (como Campanha ou Bestiário) ao app. Use quando o usuário pedir uma nova seção de lista simples.
---

# Nova coleção

Argumento: slug (ex.: `viloes`), título, ícone, textos.

1. Em `src/modules/shared/sections.ts`, adicione a `Section` (slug, title, icon, description, list, action, field, placeholder) e inclua o slug em um grupo de `NAV_GROUPS`.
2. Se precisar de ícone novo, adicione o `<symbol>` em `src/modules/shared/ui/sprite.tsx` e o nome em `IconName`.
3. Peça ao agent `prisma-db` para adicionar o valor ao enum `CollectionKind` (migration nova).
4. O CRUD é genérico: nenhuma rota nova é necessária, pois `src/app/(app)/[slug]/page.tsx` usa `SECTIONS`.
5. Valide em `/<slug>` (menu, título da aba, estado vazio) e rode `pnpm typecheck && pnpm lint && pnpm test`.
