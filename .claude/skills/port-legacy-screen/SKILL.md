---
name: port-legacy-screen
description: Procedimento para migrar uma tela do app estático (legacy/dist) para React/Next mantendo o visual idêntico, com verificação por screenshot. Use ao portar ficha, dados ou qualquer fluxo do legado.
---

# Portar tela do legado

1. Localize o markup em `legacy/dist/index.html` e a lógica em `app.js`/`sheet.js` (arquivos densos: use Grep).
2. Reproduza o DOM e as classes em componentes React no módulo dono da tela. O CSS já está em `src/styles/` (copiado literalmente do legado).
3. Troque `innerHTML`/`localStorage` por estado React + Server Actions. Mantenha textos e acessibilidade (`role`, `aria-*`, foco, `inert`).
4. Lógica de cálculo vai para `domain/` com testes (portar fórmulas com exatidão; ver `docs/architecture.md`).
5. Verificação visual: servir `legacy/dist` (HTTP estático) e `next start`; com Playwright, capturar a mesma tela em 390/820/1440 e temas dark/light e comparar. Liste diferenças intencionais.
6. Rode `pnpm typecheck && pnpm lint && pnpm test`.
