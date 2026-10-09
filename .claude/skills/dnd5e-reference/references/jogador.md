# Livro do Jogador (PHB 2014): referência de conferência

## Atributos

- Seis: Força (FOR), Destreza (DES), Constituição (CON), Inteligência (INT), Sabedoria (SAB), Carisma (CAR). Valores de 1 a 30 (personagem jogador: máximo 20, salvo itens/benefícios que digam o contrário).
- Modificador = `floor((valor − 10) / 2)`. 8–9 → −1; 10–11 → 0; 12–13 → +1; 1 → −5; 20 → +5; 30 → +10.
- Geração: valores padrão 15, 14, 13, 12, 10, 8; compra de pontos com 27 pontos, valor entre 8 e 15 antes de bônus (custo 8:0, 9:1, 10:2, 11:3, 12:4, 13:5, 14:7, 15:9); rolagem 4d6 descartando o menor.

## Bônus de proficiência

| Nível | 1–4 | 5–8 | 9–12 | 13–16 | 17–20 |
| ----- | --- | --- | ---- | ----- | ----- |
| Bônus | +2  | +3  | +4   | +5    | +6    |

Fórmula: `ceil(nível / 4) + 1`. Nunca soma duas vezes o mesmo bônus no mesmo teste. **Especialização** dobra o bônus (Bardo nv 3, Ladino nv 1). **Pau pra Toda Obra** (Bardo): metade do bônus, arredondada para baixo, em testes sem proficiência (inclui iniciativa). **Atleta Extraordinário** (Guerreiro Campeão): metade arredondada para cima em FOR/DES/CON sem proficiência.

## Perícias (18) e atributo-base

Acrobacia DES · Adestrar Animais SAB · Arcanismo INT · Atletismo FOR · Atuação CAR · Enganação CAR · Furtividade DES · História INT · Intimidação CAR · Intuição SAB · Investigação INT · Medicina SAB · Natureza INT · Percepção SAB · Persuasão CAR · Prestidigitação DES · Religião INT · Sobrevivência SAB.

- Bônus da perícia = mod do atributo + bônus de proficiência (×2 com especialização).
- Percepção passiva = 10 + bônus de Percepção (+5 com vantagem, −5 com desvantagem). Intuição e Investigação passivas seguem a mesma fórmula.
- Testes de resistência: mod + proficiência quando a classe concede. Cada classe concede exatamente 2.

## Valores derivados

- **Iniciativa**: teste de DES (mod de DES + bônus que a ficha tiver, ex.: Alerta +5, Pau pra Toda Obra).
- **CA** sem armadura: 10 + mod DES. Bárbaro (Defesa sem Armadura): 10 + DES + CON. Monge: 10 + DES + SAB. Armadura leve: base + DES. Média: base + DES (máx. +2). Pesada: base, sem DES. Escudo: +2. Armadura Arcana/Mage Armor: 13 + DES.
- **PV**: nível 1 = dado de vida máximo + mod CON. Níveis seguintes: rolar o dado de vida ou valor médio fixo (d6:4, d8:5, d10:6, d12:7) + mod CON, mínimo 1 por nível. Anão Colina: +1 por nível. Constituição retroativa se o mod mudar.
- **Dados de vida**: Bárbaro d12; Guerreiro, Paladino, Patrulheiro d10; Bardo, Clérigo, Druida, Monge, Ladino, Bruxo d8; Feiticeiro, Mago d6. Total = nível. Descanso longo recupera metade do total (mínimo 1).
- **PV temporários**: não somam entre si (fica o maior), não curam, absorvem dano primeiro, somem no descanso longo.
- **Testes de morte**: com 0 PV, CD 10, sem modificadores; 3 sucessos estabiliza, 3 falhas morre; 20 natural = volta com 1 PV; 1 natural = 2 falhas. Dano com 0 PV = 1 falha (acerto crítico = 2). **Morte instantânea**: dano restante ≥ máximo de PV.
- **Capacidade de carga**: FOR × 7 kg (15 lb). Empurrar/arrastar/levantar: FOR × 15 kg (30 lb). Regra opcional de carga: sobrecarregado acima de FOR × 2,5 kg (5 lb), muito sobrecarregado acima de FOR × 5 kg (10 lb).
- **Magia**: CD de resistência = 8 + proficiência + mod do atributo de conjuração; ataque de magia = proficiência + mod. Atributo: Bardo/Feiticeiro/Bruxo/Paladino = CAR; Clérigo/Druida/Patrulheiro = SAB; Mago/Cavaleiro Místico/Trapaceiro Arcano = INT.
- **Ataque com arma**: mod FOR (corpo a corpo) ou DES (à distância; acuidade permite escolher) + proficiência se proficiente. Dano = dado da arma + mod; o mod **não** vai no dano da mão secundária (exceto se negativo ou com Estilo de Luta Duas Armas).
- **Acerto crítico**: 20 natural (ou margem ampliada), dobra todos os dados de dano (não os modificadores).
- **Vantagem/desvantagem**: rola 2d20; várias fontes não se acumulam; uma de cada anula tudo.
- **Cobertura**: meia +2 CA e salvaguarda de DES; três quartos +5; total não pode ser alvo direto.

## Moedas e equipamento

- Câmbio: 1 PL (platina) = 10 PO (ouro) = 20 PE (electro) = 100 PP (prata) = 1.000 PC (cobre). Logo 1 PO = 2 PE = 10 PP = 100 PC, e 1 PE = 5 PP = 50 PC. Ordem usual na ficha: PC, PP, PE, PO, PL. Cinquenta moedas de qualquer tipo pesam 0,5 kg (1 lb).
- Cada armadura tem CA base, requisito de FOR (pesada), desvantagem em Furtividade e peso: conferir na tabela de armaduras do cap. 5.
- Armas: simples ou marciais; corpo a corpo ou à distância; propriedades (acuidade, leve, pesada, alcance, arremesso, munição, recarga, duas mãos, versátil, especial). Conferir dado e propriedade na tabela de armas do cap. 5.

## Descanso

- Curto: 1 hora (pode gastar dados de vida: rola o dado + mod CON). Longo: 8 horas (6 de sono + 2 de atividade leve), no máximo um por 24 horas, exige ao menos 1 PV. Recupera todos os PV e metade dos dados de vida (mín. 1), reduz Exaustão em 1.

## Condições (15)

Apêndice A do PHB. Em inglês: Blinded, Charmed, Deafened, Exhaustion, Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious. Em português (conferir grafia exata no livro): Cego, Encantado, Surdo, Exaustão, Amedrontado, Agarrado, Incapacitado, Invisível, Paralisado, Petrificado, Envenenado, Caído, Impedido/Contido, Atordoado, Inconsciente.

**Exaustão (2014)**: 1 desvantagem em testes de atributo · 2 deslocamento pela metade · 3 desvantagem em ataques e salvaguardas · 4 PV máximos pela metade · 5 deslocamento 0 · 6 morte. (Em 2024: −2 por nível em testes d20.)

## Tipos de dano (13)

Ácido, Contundente, Cortante, Elétrico (relâmpago), Energético (força), Frio, Fogo, Necrótico, Perfurante, Psíquico, Radiante, Trovejante, Venenoso.

## Níveis e experiência (PE)

| Nv  | PE    | Nv  | PE     | Nv  | PE      | Nv  | PE      |
| --- | ----- | --- | ------ | --- | ------- | --- | ------- |
| 1   | 0     | 6   | 14.000 | 11  | 85.000  | 16  | 195.000 |
| 2   | 300   | 7   | 23.000 | 12  | 100.000 | 17  | 225.000 |
| 3   | 900   | 8   | 34.000 | 13  | 120.000 | 18  | 265.000 |
| 4   | 2.700 | 9   | 48.000 | 14  | 140.000 | 19  | 305.000 |
| 5   | 6.500 | 10  | 64.000 | 15  | 165.000 | 20  | 355.000 |

## Classes (12)

| Classe      | Dado | Salvaguardas | Perícias (escolhe) | Atributo de magia  |
| ----------- | ---- | ------------ | ------------------ | ------------------ |
| Bárbaro     | d12  | FOR, CON     | 2                  | —                  |
| Bardo       | d8   | DES, CAR     | 3 (qualquer)       | CAR                |
| Bruxo       | d8   | SAB, CAR     | 2                  | CAR                |
| Clérigo     | d8   | SAB, CAR     | 2                  | SAB                |
| Druida      | d8   | INT, SAB     | 2                  | SAB                |
| Feiticeiro  | d6   | CON, CAR     | 2                  | CAR                |
| Guerreiro   | d10  | FOR, CON     | 2                  | INT (Cav. Místico) |
| Ladino      | d8   | DES, INT     | 4                  | INT (Trap. Arcano) |
| Mago        | d6   | INT, SAB     | 2                  | INT                |
| Monge       | d8   | FOR, DES     | 2                  | —                  |
| Paladino    | d10  | SAB, CAR     | 2                  | CAR                |
| Patrulheiro | d10  | FOR, DES     | 3                  | SAB                |

- Aumento de Atributo: níveis 4, 8, 12, 16, 19 (Guerreiro também 6 e 14; Ladino também 10). +2 em um atributo ou +1 em dois, máximo 20; ou uma Talento (feat) no lugar.
- Subclasse: nível 1 (Clérigo, Feiticeiro, Bruxo), nível 2 (Druida, Mago), nível 3 (demais).
- Ataque Extra: nível 5 (Bárbaro, Guerreiro, Monge, Paladino, Patrulheiro); Guerreiro ganha 3 ataques no 11 e 4 no 20.
- Conjuração: Paladino e Patrulheiro a partir do nível 2; Cavaleiro Místico e Trapaceiro Arcano a partir do nível 3. Bruxo usa Magia de Pacto.

## Espaços de magia (conjuradores plenos: Bardo, Clérigo, Druida, Feiticeiro, Mago)

| Nv    | 1º  | 2º  | 3º  | 4º  | 5º  | 6º  | 7º  | 8º  | 9º  |
| ----- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1     | 2   |     |     |     |     |     |     |     |     |
| 2     | 3   |     |     |     |     |     |     |     |     |
| 3     | 4   | 2   |     |     |     |     |     |     |     |
| 4     | 4   | 3   |     |     |     |     |     |     |     |
| 5     | 4   | 3   | 2   |     |     |     |     |     |     |
| 6     | 4   | 3   | 3   |     |     |     |     |     |     |
| 7     | 4   | 3   | 3   | 1   |     |     |     |     |     |
| 8     | 4   | 3   | 3   | 2   |     |     |     |     |     |
| 9     | 4   | 3   | 3   | 3   | 1   |     |     |     |     |
| 10    | 4   | 3   | 3   | 3   | 2   |     |     |     |     |
| 11–12 | 4   | 3   | 3   | 3   | 2   | 1   |     |     |     |
| 13–14 | 4   | 3   | 3   | 3   | 2   | 1   | 1   |     |     |
| 15–16 | 4   | 3   | 3   | 3   | 2   | 1   | 1   | 1   |     |
| 17    | 4   | 3   | 3   | 3   | 2   | 1   | 1   | 1   | 1   |
| 18    | 4   | 3   | 3   | 3   | 3   | 1   | 1   | 1   | 1   |
| 19    | 4   | 3   | 3   | 3   | 3   | 2   | 1   | 1   | 1   |
| 20    | 4   | 3   | 3   | 3   | 3   | 2   | 2   | 1   | 1   |

- Meio-conjuradores (Paladino, Patrulheiro) usam a tabela da própria classe (nível 2: 2 espaços de 1º; máximo 5º círculo no nível 17+). Terços (Cav. Místico, Trap. Arcano): nível 3 = 2 de 1º; máximo 4º círculo.
- **Multiclasse**: nível de conjurador = níveis plenos + metade (↓) dos meio-conjuradores + um terço (↓) dos terços; consulta a tabela acima. Magias de Bruxo (Magia de Pacto) ficam separadas.
- **Magia de Pacto (Bruxo)**: espaços (qtd × círculo): nv1 1×1º; nv2 2×1º; nv3–4 2×2º; nv5–6 2×3º; nv7–8 2×4º; nv9–10 2×5º; nv11–16 3×5º; nv17–20 4×5º. Recuperam em descanso curto ou longo.
- **Truques** não gastam espaço. Número de truques/magias conhecidas/preparadas varia por classe: conferir na tabela da classe. Preparadas (Clérigo, Druida, Paladino) = mod do atributo + nível (Paladino: + metade do nível); Mago prepara mod INT + nível.
- Conjurar em círculo superior só quando a magia permite ("Em Círculos Superiores"). Só uma magia com ação bônus por turno: se conjurar uma magia com ação bônus, a outra só pode ser truque de 1 ação.
- Concentração: uma por vez; teste de resistência de CON com CD = máx(10, dano/2) ao sofrer dano.

## Raças (9) e bônus de atributo

Anão (CON +2; Colina SAB +1; Montanha FOR +2) · Elfo (DES +2; Alto INT +1; Floresta SAB +1; Drow CAR +1) · Halfling (DES +2; Pés Leves CAR +1; Robusto CON +1) · Humano (todos +1; Variante: dois atributos +1, uma perícia, um talento) · Draconato (FOR +2, CAR +1) · Gnomo (INT +2; Floresta DES +1; Rochas CON +1) · Meio-Elfo (CAR +2, dois outros +1) · Meio-Orc (FOR +2, CON +1) · Tiefling (CAR +2, INT +1).

## Antecedentes (13 do PHB)

Acólito, Artesão de Guilda, Artista, Charlatão, Criminoso, Eremita, Forasteiro, Herói do Povo, Marinheiro, Nobre, Órfão, Sábio, Soldado. Cada um concede 2 perícias, proficiências em ferramentas/idiomas, equipamento e uma característica; a ficha tem Traços de Personalidade, Ideais, Vínculos e Defeitos.

## Alinhamentos (9)

Leal/Neutro/Caótico × Bom/Neutro/Mau. Neutro absoluto é "Neutro".

## Inspiração

Binária (tem ou não tem); concedida pelo Mestre; gasta para ganhar vantagem em uma jogada.
