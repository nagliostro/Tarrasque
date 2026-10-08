# Design

Fonte de verdade visual do Tarrasque. O visual vem do app original ("Odysseus") e **não muda** na migração; tokens e classes vivem em `src/styles/`. Referência executável: `legacy/dist`.

## Paletas

Quatro temas, definidos em `src/styles/theme.css` por `[data-theme]` (cookie `tarrasque-theme`, aplicado no servidor).

| Tema            | bg        | fg        | panel     | border    | accent    |
| --------------- | --------- | --------- | --------- | --------- | --------- |
| dark (Original) | `#282c34` | `#9cdef2` | `#111111` | `#355a66` | `#e06c75` |
| light           | `#f0ebe3` | `#5a5248` | `#faf6f0` | `#d4cdc2` | `#c47d5a` |
| forest          | `#1b2a1b` | `#a8d5a2` | `#142414` | `#3d6b3d` | `#7cb871` |
| terminal        | `#000000` | `#00ff41` | `#0a0a0a` | `#003b00` | `#00ff41` |

Derivados: `--muted = color-mix(fg 70%, bg)`; hover/ativo do acento = `color-mix(accent 10%/55%, transparent)`; hover do botão primário = `color-mix(accent 80%, white)`. Críticos dos dados: acerto `#dfb65c`, erro `#f17781` (misturados a 75% com `--fg`). Texto do `.primary`: `#111`.

Decisão de gosto (usuário): este visual prevalece sobre o perfil genérico (Geist/azul-marinho). Sem roxo/violeta.

## Tipografia

Fira Code 400 (local, SIL OFL, via `next/font/local`, variável `--font-fira`), base 13px. Escala em px: 7, 8, 9, 10, 11, 12, 17, 21, 29. `h1` 29px/-1.3px, `h2` 21px/-0.8px; eyebrows em caixa alta com tracking 1.3–2px. Inputs sobem para 16px no mobile (evita zoom no iOS).

## Layout

- `body` flex, `100dvh`, rolagem dentro de `main`. Sidebar 240px (48px recolhida); ≤768px vira drawer (`min(80vw,340px)`) com backdrop e `inert` quando fechado.
- Topbar 61px; `main` com padding `48px 48px 0` (32/26 ≤1000px; 28/20 ≤768px).
- Breakpoints: 1100 (ficha), 1000, 768, altura 660.
- Cards: `repeat(auto-fill, minmax(230px, 1fr))`, gap 16px.

## Formas

Raios: botões/inputs 5px, nav-item/icon-button 6px, cards 8px, dialog 10px, avatar 50%. Alturas: nav-item 42 (44 mobile), botões 36 (44 mobile), inputs 40. Foco: `outline: 2px solid var(--accent)`, offset 4px.

## Componentes

Sidebar (brand, grupos JOGAR/CONSULTAR/FERRAMENTAS, user-row), topbar (toggle, breadcrumb, status), `page-top`, `section-line` com contador, `search-field`, `card`, estado vazio (`emblem` com `orbit`), `dialog` nativo, `primary`/`secondary`/`secondary.danger`/`icon-button`, toast, footer. Ícones: sprite SVG (traço 1.6, viewBox 24) em `src/modules/shared/ui/sprite.tsx`, usados por `<Icon name>`.

## Telas

Personagem (lista + ficha em 3 abas: Ficha, Detalhes, Magias), Campanha, Encontros, Magias, Bestiário, Equipamentos, Biblioteca (coleções genéricas) e Dados (mesa animada, histórico de 20 rolagens). Perfil e Configurações (tema) em diálogo.

## Movimento e acessibilidade

`prefers-reduced-motion` desliga animações (dados a 60% de opacidade). Preservar: `aria-current`, `aria-expanded`, `inert`, `role=tablist`, `aria-live` no resultado, `role=status` no toast, alvos de 44px no mobile, WCAG 2.2 AA.

## Diferenças intencionais em relação ao legado

- Textos que diziam "salva neste navegador" foram removidos (os dados passam a viver no servidor).
