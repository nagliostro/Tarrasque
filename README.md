# Tarrasque

Aplicação web para organizar personagens, campanhas e recursos de RPG, com interface inspirada no guia visual Odysseus.

## Executar

Abra `dist/index.html` no navegador. Não requer instalação de dependências ou compilação. Para servir por HTTP, execute na pasta do projeto:

```sh
python3 -m http.server 8080 --directory dist
```

Depois acesse `http://localhost:8080`.

## Funcionalidades

- Personagem, Campanha, Encontros, Magias, Bestiário, Equipamentos e Biblioteca: coleções pessoais com criação, edição e busca.
- Dados: combine d4, d6, d8, d10, d12, d20 e d100 na mesma rolagem, até 10 de cada tipo, com modificador aplicado uma vez ao total.
- Animação de rolagem com perspectiva simulada, quiques, sombras e revelação dos resultados ao final.
- Destaques de 1 e 20 naturais nos d20 e histórico das últimas 20 rolagens.
- Sidebar retrátil, layout responsivo, perfil editável e temas Original, Light, Forest e Terminal.
- Respeita a preferência de movimento reduzido.

Os dados ficam no `localStorage` do navegador. Não há backend, autenticação própria ou sincronização entre dispositivos. O catálogo oficial do D&D Beyond não está incluído; Encontros é uma coleção de preparação, não um rastreador de combate.

## Estrutura

- `dist/index.html`: estrutura da interface.
- `dist/style.css`: estilos e animações.
- `dist/app.js`: navegação, coleções e rolador.
- `dist/theme.js`: paletas e preferência de tema.
- `dist/fonts/`: fonte local Fira Code e sua licença.
- `.openai/hosting.json`: identificação da hospedagem original no Sites; não é necessária para executar localmente.

Para outras hospedagens estáticas, publique a pasta `dist`.

## Referências

- Organização de ferramentas: [D&D Beyond](https://www.dndbeyond.com/en/dnd-campaigns).
- Princípios de movimento: [Animation Mentor](https://www.animationmentor.com/blog/tutorial-bouncing-ball-physics/).
- Tipografia: [Fira Code](https://github.com/tonsky/FiraCode), distribuída sob a SIL Open Font License.
