# Livro dos Monstros (MM 2014): referência de conferência

## Bloco de estatísticas (ordem oficial)

1. Nome · 2. Tamanho, tipo (e etiquetas), tendência · 3. Classe de Armadura (com a fonte entre parênteses) · 4. Pontos de Vida (média e dados, ex.: `45 (6d8 + 18)`) · 5. Deslocamento (caminhada, escavar, escalar, voo [pairar], natação) · 6. Os seis atributos com modificador · 7. Testes de resistência · 8. Perícias · 9. Vulnerabilidades, resistências e imunidades a dano · 10. Imunidades a condição · 11. Sentidos (visão no escuro, visão cega, sentido sísmico, visão verdadeira, **Percepção passiva**) · 12. Idiomas · 13. Desafio (ND e PE; bônus de proficiência no ND) · Características · Ações (inclui Ataques Múltiplos) · Reações · Ações Lendárias · Ações de Covil e efeitos regionais.

## Tamanhos, espaço e dado de vida

| Tamanho | Espaço         | Dado de vida |
| ------- | -------------- | ------------ |
| Miúdo   | 0,75 m (2½ ft) | d4           |
| Pequeno | 1,5 m (5 ft)   | d6           |
| Médio   | 1,5 m (5 ft)   | d8           |
| Grande  | 3 m (10 ft)    | d10          |
| Enorme  | 4,5 m (15 ft)  | d12          |
| Imenso  | 6 m (20 ft)    | d20          |

PV médio = `floor(qtd × (faces + 1) / 2) + qtd × mod(CON)`. Quantidade de dados vem do PV desejado; o dado segue o tamanho.

## Tipos de criatura (14)

Aberração, Besta, Celestial, Construto, Dragão, Elemental, Fada, Ínfero, Gigante, Humanoide, Monstruosidade, Limo, Planta, Morto-vivo.

## Regras de cálculo

- **Bônus de proficiência por ND**: 0–4 → +2 · 5–8 → +3 · 9–12 → +4 · 13–16 → +5 · 17–20 → +6 · 21–24 → +7 · 25–28 → +8 · 29–30 → +9.
- **Ataque** = mod do atributo + proficiência. **CD** de habilidade/magia = 8 + proficiência + mod. Teste de resistência listado = mod + proficiência (mod puro quando não listado).
- **Perícia listada** = mod + proficiência (dobrada se especialista); não listada = mod puro.
- **Percepção passiva** = 10 + bônus de Percepção.
- **Dano médio** de uma arma/ataque: média do dado arredondada para baixo, ex.: `7 (1d8 + 3)`; `2d6 + 4` = 11.
- **ND** = média de ND defensivo (PV e CA, ajustado por resistências/imunidades e CA efetiva) e ND ofensivo (dano/rodada e bônus de ataque ou CD). Tabela em [mestre.md](mestre.md).
- **Recarga X–6** (ou Recarga 6): rola 1d6 no início de cada turno do monstro; recarrega se igual ou maior que X.
- **X/dia**: usos por dia. **Resistência Lendária (3/dia)**: transforma falha em sucesso.
- **Ações lendárias**: normalmente 3 por rodada, só no fim do turno de outra criatura, recuperam no início do turno do monstro; custo de 1 a 3.
- **Conjuração** (por espaços, como classe) × **Conjuração Inata** (sem espaços, sem componentes materiais, usos por dia/à vontade).
- **Ataques Múltiplos**: ação que agrupa ataques; cada ataque listado separadamente em Ações.
- **Deslocamentos de voo**: "pairar" quando a criatura não cai ao ficar incapacitada.
- **Sentidos**: alcance em pés/metros; visão cega não depende de luz; sentido sísmico exige contato com o solo.
- Condições e tipos de dano seguem a lista do PHB ([jogador.md](jogador.md)).

## Conferência de dados de monstro no app

- Atributos, modificadores e proficiência coerentes com o ND declarado.
- PV médio bate com a expressão de dados e com o dado do tamanho.
- PE bate com o ND (tabela do mestre.md) e o bônus de proficiência bate com o ND.
- Tipo, tamanho e tendência pertencem às listas oficiais; nenhum tipo inventado.
- Campos usados na UI (CA, PV, ND, deslocamento, sentidos) existem no bloco oficial; campos que não existem no bloco oficial devem ser identificados como extensão do app.
