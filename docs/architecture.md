# Arquitetura

Monolito modular: um único deploy Next.js, com módulos de domínio de fronteira explícita.

## Estrutura

```
src/
  app/            rotas finas (compõem módulos); (app)/layout.tsx lê cookies no servidor
  modules/<nome>/ domain/ (puro) → application/ (casos de uso, Server Actions) → infra/ (Prisma) → ui/
                  index.ts = única API pública
  platform/       db.ts (Prisma + adapter-pg), env.ts (Zod)
  styles/         tailwind.css (tokens), theme.css (paletas), globals.css e sheet.css (legado)
  generated/      cliente Prisma (git-ignorado)
prisma/           schema.prisma, migrations/
e2e/              Playwright
legacy/dist/      app estático original (referência)
```

## Regras de dependência (garantidas por ESLint, `eslint.config.mjs`)

| De         | Pode importar                                             |
| ---------- | --------------------------------------------------------- |
| `app`      | `modules` (só `index.ts`), `platform`, `app`              |
| `modules`  | outros `modules` (só `index.ts`), `platform`, `generated` |
| `platform` | `platform`, `generated`                                   |

- Importar `@/modules/x/qualquer/coisa` falha (`no-restricted-imports`); importe `@/modules/x`.
- Toda Server Action: validar com Zod, obter `userId` da sessão e filtrar por ele.
- `domain/` não depende de React, Next nem Prisma.

## Módulos

| Módulo        | Estado    | Responsabilidade                                                                                                                                                |
| ------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shared`      | fase 1 ✅ | casca (sidebar/topbar/drawer), ícones (sprite), dialog, toast, seções e navegação, tema                                                                         |
| `identity`    | fase 2 ✅ | usuário, sessão (Better Auth), perfil e preferências (tema, sidebar)                                                                                            |
| `collections` | fase 2 ✅ | CRUD genérico das 6 coleções `{name, detail}` (campanha, encontros, magias, bestiário, equipamentos, biblioteca)                                                |
| `characters`  | fase 3    | `Character` e ficha D&D (cálculos em `domain/`: proficiência, modificadores, salvaguardas, perícias, CD de magia), salvamento automático com debounce de 500 ms |
| `dice`        | fase 4    | parser/limites/RNG (`crypto.getRandomValues`), mesa animada, histórico das últimas 20 rolagens                                                                  |

## Estado e persistência

- Fonte da verdade das preferências (tema, sidebar, nome de exibição): `User` no banco. O cookie `tarrasque-theme` é só cache para o servidor pintar o `<html>` sem flash; a conta prevalece (o login regrava o cookie, o logout o apaga e o `AppShell` reconcilia o tema se divergir).
- Autenticação: login e cadastro existem **somente como Server Actions** (`identity/application/actions.ts`), com validação Zod e rate limit próprio no Postgres (`RateLimit`, `identity/infra/rate-limit.ts`; login 5/min por e-mail+IP e 20/min por IP, cadastro 10/h por IP). O router HTTP do Better Auth tem `/sign-in/email` e `/sign-up/email` desativados (`disabledPaths`), pois chamadas por `auth.api.*` não passam pelo rate limit nativo dele.
- Coleções: no máximo 500 registros por usuário e tipo (`MAX_ENTRIES_PER_KIND`); a listagem é carregada inteira e filtrada no cliente.
- Postgres: `CollectionEntry` (enum `CollectionKind`), `Character` (`sheet` Json + `name`/`summary` indexáveis), `DiceRoll`.
- `summary` do personagem é derivado da ficha no servidor ("Raça · Classe Nível", antecedente, PV, CA).

## Fases

1. Fundação ✅: projeto, casca visual idêntica, schema, qualidade, `.claude/`.
2. Identity + collections ✅: login e cadastro por e-mail e senha (Better Auth, sessão no Postgres), preferências e perfil no `User`, CRUD das 6 coleções com busca, edição e exclusão. Login social (Google) ficou para depois.
3. Characters.
4. Dice ✅: rolador com grupos de dados, modificador, críticos de d20 natural e histórico persistido.
5. Polimento (inclui checklist de deploy: `BETTER_AUTH_URL` em `https://` para o cookie de sessão sair com `Secure`; `trustedOrigins` e `experimental.serverActions.allowedOrigins` se houver domínios de preview/proxy; confirmar que o proxy sobrescreve `x-forwarded-for`, pois o rate limit depende dele; login social com Google): importador de `localStorage` (chaves `tarrasque-*`; `theme` sem JSON; `rolls` legado sem `dice`), regressão visual (390/820/1440 × 4 temas), a11y, deploy (sugestão: Vercel + Neon).

## Trabalho em paralelo

Após a fase 1, um `module-builder` por módulo em worktrees separados; `prisma-db` consolida migrations em série; `reviewer` revisa antes de fechar cada fase.
