import { registerUser, expect, test } from './support';

test('criar, calcular, salvar automaticamente, reabrir e excluir uma ficha', async ({ page }) => {
  await registerUser(page);
  await page.goto('/personagem');
  await expect(page.getByRole('heading', { name: /Uma ficha em branco/ })).toBeVisible();

  await page.getByRole('button', { name: 'Novo personagem' }).first().click();
  await expect(page.locator('.sheet-status')).toHaveText('Novo personagem');

  await page.getByLabel('Nome do personagem').fill('Elara');
  await page.getByLabel('Classe', { exact: true }).selectOption('mago');
  await page.getByLabel('Raça', { exact: true }).selectOption('humano');
  await page.getByLabel('Antecedente').selectOption('sabio');
  await page.getByLabel('Nível', { exact: true }).selectOption('5');
  await page.getByLabel('Valor base de Inteligência').selectOption('15');
  await expect(page.locator('.ab-left')).toHaveText('18');

  // cálculos: INT 15 + 1 (humano) = 16 → +3; proficiência nível 5 = +3
  await expect(page.getByLabel('Valor total de Inteligência')).toHaveText('16');
  await expect(page.getByLabel('Modificador de Inteligência')).toHaveText('+3');
  // Sábio concede Arcanismo: +3 +3
  await expect(page.locator('li', { hasText: 'Arcanismo' }).locator('output')).toHaveText('+6');
  await expect(page.getByRole('img', { name: 'Arcanismo: proficiente' })).toBeVisible();
  // PV: d6 máx. no 1º nível, média nos seguintes, CON 9 (−1): 5 + 4 × 3
  await expect(page.getByLabel('Pontos de vida máximos')).toHaveText('17');
  await expect(page.getByLabel('Dados de vida')).toHaveText('5d6');

  await expect(page.locator('.sheet-status')).toHaveText('Salvo automaticamente');

  // magias: CD = 8 + 3 + 3, tudo derivado da classe
  await page.getByRole('tab', { name: 'Magias' }).click();
  await expect(page.getByLabel('CD de resistência')).toHaveText('14');
  await expect(page.getByLabel('Espaços totais do círculo 3')).toHaveText('2');

  // escolhe uma magia do Livro do Jogador no seletor e abre os detalhes no modal
  await page.getByLabel('Magia 1 de círculo 1').selectOption('Mísseis Mágicos');
  await page.getByRole('button', { name: 'Detalhes de Mísseis Mágicos' }).click();
  const info = page.getByRole('dialog', { name: 'Mísseis Mágicos' });
  await expect(info).toContainText('1º círculo de evocação');
  await expect(info).toContainText('36 metros');
  await info.getByRole('button', { name: 'Fechar', exact: true }).last().click();
  await expect(info).toBeHidden();
  // conjurar exige magia preparada e gasta um espaço; o descanso longo devolve
  const cast = page.getByRole('button', { name: 'Conjurar' }).first();
  await expect(cast).toBeDisabled();
  await page.getByLabel('Preparada').first().check();
  await cast.click();
  await expect(page.getByLabel('Espaços gastos do círculo 1')).toHaveText('1');
  await page.getByRole('button', { name: 'Descanso longo' }).click();
  await expect(page.getByLabel('Espaços gastos do círculo 1')).toHaveText('0');
  // o Mago não tem Curar Ferimentos na lista
  await expect(
    page.getByLabel('Magia 1 de círculo 1').locator('option', { hasText: 'Curar Ferimentos' }),
  ).toHaveCount(0);

  await page.getByRole('button', { name: 'Meus personagens' }).click();
  await expect(page.locator('article.card h2')).toHaveText('Elara');
  await expect(page.locator('article.card p')).toContainText('Humano · Mago 5');

  // reabrir pelo banco
  await page.reload();
  await page.getByRole('button', { name: 'Abrir / editar' }).click();
  await expect(page.getByLabel('Nome do personagem')).toHaveValue('Elara');
  await expect(page.getByLabel('Classe', { exact: true })).toHaveValue('mago');
  await expect(page.getByLabel('Valor base de Inteligência')).toHaveValue('15');
  await expect(page.getByRole('img', { name: 'Arcanismo: proficiente' })).toBeVisible();

  await page.getByRole('button', { name: 'Excluir' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Excluir' }).click();
  await expect(page.locator('#toast')).toHaveText('Personagem excluído.');
  await expect(page.getByRole('heading', { name: /Uma ficha em branco/ })).toBeVisible();
});

test('método clássico: rola 4d6 no modal e distribui os valores', async ({ page }) => {
  await registerUser(page);
  await page.goto('/personagem');
  await page.getByRole('button', { name: 'Novo personagem' }).first().click();

  await page.getByLabel('Tipo de distribuição').selectOption('cl');
  const dialog = page.getByRole('dialog', { name: 'Rolar atributos' });
  await expect(dialog).toBeVisible();
  // uma rolagem por atributo: seis cliques, cada um com a mesa de dados animada
  for (let n = 1; n <= 6; n++) {
    await dialog.getByRole('button', { name: `Rolar atributo ${n} de 6` }).click();
    await expect(dialog.locator('.dice-tray.rolling .die')).toHaveCount(4);
    await expect(dialog.locator('.classic-row')).toHaveCount(n, { timeout: 10_000 });
    // ao final, o menor dado fica destacado como descartado
    await expect(dialog.locator('.dice-tray.settled .die.discarded')).toHaveCount(1);
  }
  await expect(dialog.getByRole('button', { name: /Rolar atributo/ })).toHaveCount(0);
  await expect(dialog.locator('.classic-row').first().locator('.dropped')).toHaveCount(1);
  await dialog.getByRole('button', { name: 'Concluir' }).click();
  await expect(dialog).toBeHidden();

  // cada valor rolado só pode ser usado uma vez
  const forca = page.getByLabel('Valor base de Força');
  await forca.selectOption({ index: 1 });
  await expect(page.getByLabel('Valor base de Destreza').locator('option')).toHaveCount(6);
});
