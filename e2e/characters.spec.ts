import { registerUser, expect, test } from './support';

test('criar, calcular, salvar automaticamente, reabrir e excluir uma ficha', async ({ page }) => {
  await registerUser(page);
  await page.goto('/personagem');
  await expect(page.getByRole('heading', { name: /Uma ficha em branco/ })).toBeVisible();

  await page.getByRole('button', { name: 'Novo personagem' }).first().click();
  await expect(page.locator('.sheet-status')).toHaveText('Novo personagem');

  await page.getByLabel('Nome do personagem').fill('Elara');
  await page.getByLabel('Classe', { exact: true }).fill('Maga');
  await page.getByLabel('Raça').fill('Elfa');
  await page.getByLabel('Nível').fill('5');
  await page.getByLabel('Valor de Inteligência').fill('16');
  await page.getByLabel('Pontos de vida máximos').fill('24');

  // cálculos: INT 16 = +3, proficiência nível 5 = +3
  await expect(page.getByLabel('Modificador de Inteligência')).toHaveText('+3');
  await page.getByRole('button', { name: 'Proficiência em Arcanismo' }).click();
  await expect(page.locator('li', { hasText: 'Arcanismo' }).locator('output')).toHaveText('+6');

  await expect(page.locator('.sheet-status')).toHaveText('Salvo automaticamente');

  // magias: CD = 8 + 3 + 3
  await page.getByRole('tab', { name: 'Magias' }).click();
  await page.getByLabel('Atributo de conjuração').selectOption('int');
  await expect(page.locator('.sf', { hasText: 'CD de resistência' }).locator('output')).toHaveText('14');

  await page.getByRole('button', { name: 'Meus personagens' }).click();
  await expect(page.locator('article.card h2')).toHaveText('Elara');
  await expect(page.locator('article.card p')).toContainText('Elfa · Maga 5');

  // reabrir pelo banco
  await page.reload();
  await page.getByRole('button', { name: 'Abrir / editar' }).click();
  await expect(page.getByLabel('Nome do personagem')).toHaveValue('Elara');
  await expect(page.getByLabel('Valor de Inteligência')).toHaveValue('16');
  await expect(page.getByRole('button', { name: 'Proficiência em Arcanismo' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await page.getByRole('button', { name: 'Excluir' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Excluir' }).click();
  await expect(page.locator('#toast')).toHaveText('Personagem excluído.');
  await expect(page.getByRole('heading', { name: /Uma ficha em branco/ })).toBeVisible();
});
