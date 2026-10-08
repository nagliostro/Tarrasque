---
name: db-migrate
description: Fluxo seguro para alterar o banco com Prisma (schema, migration, revisão do SQL, generate, seed). Use em qualquer mudança de modelo.
---

# Migration segura

1. Confirme o Postgres: `pnpm db:up` (Docker Desktop precisa estar aberto) e `DATABASE_URL` em `.env` (copie de `.env.example`).
2. Edite `prisma/schema.prisma`.
3. `pnpm db:migrate --name <descricao-curta>` cria e aplica a migration em dev.
4. Leia o SQL gerado em `prisma/migrations/<timestamp>_<nome>/migration.sql`. Atenção a `DROP`, mudança de tipo e colunas `NOT NULL` sem default em tabelas com dados.
5. `pnpm exec prisma generate` atualiza `src/generated/prisma`.
6. Ajuste `prisma/seed.ts` se necessário e rode `pnpm typecheck`.
7. Nunca edite migrations existentes. Para corrigir, crie outra. Reset/force são bloqueados pelo hook `guard`; peça confirmação ao usuário.
