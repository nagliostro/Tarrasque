---
name: audit-dnd-rules
description: Auditoria das regras de D&D 5e aplicadas no Tarrasque (Livro do Jogador, do Mestre e dos Monstros): regras erradas, sobrepostas, sem uso ou inventadas. Use antes de fechar uma fase, após mexer em ficha/dados/coleções, ou quando o usuário pedir para conferir as regras.
---

# Auditar regras de D&D 5e

1. **Escopo**: defina o que auditar (padrão: o repositório inteiro; ou só o diff, `git diff --name-only main`). Se o escopo tocar só um livro, rode só o especialista dele.
2. **Em paralelo**, dispare num único turno: `regras-jogador`, `regras-mestre`, `regras-monstros` e `auditor-regras-dnd`, cada um com o escopo no prompt e a instrução de devolver o relatório no formato do próprio agent.
3. **Consolide** os quatro relatórios:
   - elimine duplicatas (o mesmo achado visto por dois agentes entra uma vez);
   - se dois agentes discordam do livro, releia o ponto em `.claude/skills/dnd5e-reference/references/` e decida; se a referência não resolver, marque "não confirmado" e pergunte ao usuário se ele tem o livro à mão;
   - ordene por gravidade: Errado, Duvidoso, Sobreposição, Sem uso, Faltando.
4. **Entregue** ao usuário: tabela de achados (arquivo:linha, regra, livro/capítulo, correção), o que foi verificado e estava certo, e decisões de mesa que dependem dele (2014 × 2024, regras opcionais).
5. **Corrigir é outro passo**: só altere código se o usuário pedir. Ao corrigir, o teste de domínio afirma o valor do livro (não o do código antigo) e o `reviewer` roda depois.
6. Se a própria referência (`dnd5e-reference`) estiver errada, corrija-a no mesmo passo: ela é a fonte dos agentes.

Referência: skill `dnd5e-reference`.
