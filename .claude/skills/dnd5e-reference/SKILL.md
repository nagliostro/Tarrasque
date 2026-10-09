---
name: dnd5e-reference
description: Tabelas e regras de referência de D&D 5ª edição (Livro do Jogador, Livro do Mestre, Livro dos Monstros) para conferir cálculos, listas e terminologia do Tarrasque. Use ao implementar ou revisar qualquer regra de jogo (ficha, dados, monstros, encontros).
---

# Referência D&D 5e (edição 2014)

Base de conferência dos agentes `regras-jogador`, `regras-mestre`, `regras-monstros` e `auditor-regras-dnd`.

## Edição adotada

O projeto segue a **edição 2014** (PHB, DMG, MM em pt-BR pela Galápagos): lista de 18 perícias, moeda "Electro", bônus de proficiência por nível `ceil(nível/4)+1`, Exaustão com 6 níveis. Os livros revisados de **2024** mudam várias regras (antecedentes dão atributos, Exaustão, maestrias de arma, espécies no lugar de raças, etc.). Se o código misturar as duas edições, isso é um achado, não um detalhe.

## Arquivos

- [jogador.md](references/jogador.md): Livro do Jogador (atributos, perícias, classes, raças, equipamento, magia, combate, condições, descanso).
- [mestre.md](references/mestre.md): Livro do Mestre (CDs, orçamento de encontro, XP, tesouro, itens mágicos, criação de monstros por ND).
- [monstros.md](references/monstros.md): Livro dos Monstros (estrutura do bloco de estatísticas, tipos, tamanhos, PV por dado, ações lendárias).
- [glossario-ptbr.md](references/glossario-ptbr.md): termos oficiais em português e abreviações da ficha.

## Como usar

1. Leia só o arquivo do livro relevante, não todos.
2. Compare **fórmula, tabela e lista** do código com a referência, valor por valor.
3. Cite sempre a fonte (livro + capítulo/tabela) ao reportar. Quando a referência marcar "conferir no livro", diga que não foi possível confirmar em vez de afirmar.
4. Os livros são material protegido: a referência resume regras e números, não copia texto. Para texto de magias, itens e monstros específicos use o SRD 5.1 (licença CC-BY-4.0) ou o livro físico do usuário.
