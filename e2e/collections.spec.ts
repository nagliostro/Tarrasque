import { registerUser, expect, test } from './support';

test('criar, buscar, editar e excluir um registro', async ({ page }) => {
  await registerUser(page);
  await page.goto('/campanha');
  await expect(page.getByRole('heading', { name: 'Sua coleção começa aqui.' })).toBeVisible();

  // criar
  await page.getByRole('button', { name: 'Nova campanha' }).first().click();
  await page.getByLabel('Nome').fill('Maldição de Strahd');
  await page.getByLabel('Cenário ou sistema').fill('Gótico · D&D 5e');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.locator('#toast')).toHaveText('Registro salvo.');
  await expect(page.locator('article.card h2')).toHaveText('Maldição de Strahd');
  await expect(page.locator('.section-line b')).toHaveText('1');

  // sobrevive ao recarregar (veio do banco)
  await page.reload();
  await expect(page.locator('article.card h2')).toHaveText('Maldição de Strahd');

  // buscar por termo do detalhe (insensível a maiúsculas)
  await page.getByLabel('Buscar nesta coleção').fill('GÓTICO');
  await expect(page.locator('article.card')).toHaveCount(1);
  await page.getByLabel('Buscar nesta coleção').fill('inexistente');
  await expect(page.getByRole('heading', { name: 'Nenhum resultado encontrado.' })).toBeVisible();
  await page.getByLabel('Buscar nesta coleção').fill('');

  // editar
  await page.getByRole('button', { name: 'Abrir / editar' }).click();
  await page.getByLabel('Nome').fill('Barovia');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.locator('article.card h2')).toHaveText('Barovia');

  // excluir com confirmação
  await page.getByRole('button', { name: 'Abrir / editar' }).click();
  await page.getByRole('button', { name: 'Excluir' }).click();
  await expect(
    page.getByText('Excluir este registro? Esta ação não pode ser desfeita.'),
  ).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Excluir' }).click();
  await expect(page.locator('#toast')).toHaveText('Registro excluído.');
  await expect(page.getByRole('heading', { name: 'Sua coleção começa aqui.' })).toBeVisible();
});

test('nome vazio mostra a validação em português', async ({ page }) => {
  await registerUser(page);
  await page.goto('/magias');
  await page.getByRole('button', { name: 'Nova magia' }).first().click();
  await page.getByRole('button', { name: 'Salvar' }).click();
  const message = await page
    .getByLabel('Nome')
    .evaluate((el: HTMLInputElement) => el.validationMessage);
  expect(message).toBe('Digite um nome.');
});

test('cada usuário vê somente os próprios registros', async ({ page, browser }) => {
  await registerUser(page, 'Dona do Registro');
  await page.goto('/bestiario');
  await page.getByRole('button', { name: 'Nova criatura' }).first().click();
  await page.getByLabel('Nome').fill('Tarrasque Secreto');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.locator('article.card h2')).toHaveText('Tarrasque Secreto');

  const other = await browser.newContext();
  const otherPage = await other.newPage();
  await registerUser(otherPage, 'Outra Pessoa');
  await otherPage.goto('/bestiario');
  await expect(otherPage.getByRole('heading', { name: 'Sua coleção começa aqui.' })).toBeVisible();
  await expect(otherPage.getByText('Tarrasque Secreto')).toHaveCount(0);
  await other.close();
});

test('coleções são separadas por tipo', async ({ page }) => {
  await registerUser(page);
  await page.goto('/equipamentos');
  await page.getByRole('button', { name: 'Novo equipamento' }).first().click();
  await page.getByLabel('Nome').fill('Espada Longa');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.locator('article.card h2')).toHaveText('Espada Longa');

  await page.goto('/biblioteca');
  await expect(page.getByRole('heading', { name: 'Sua coleção começa aqui.' })).toBeVisible();
});

test('cancelar a exclusão não perde o que foi digitado na edição', async ({ page }) => {
  await registerUser(page);
  await page.goto('/campanha');
  await page.getByRole('button', { name: 'Nova campanha' }).first().click();
  await page.getByLabel('Nome').fill('Original');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.locator('article.card h2')).toHaveText('Original');

  await page.getByRole('button', { name: 'Abrir / editar Original' }).click();
  await page.getByLabel('Nome').fill('Rascunho não salvo');
  await page.getByRole('button', { name: 'Excluir' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.getByLabel('Nome')).toHaveValue('Rascunho não salvo');
});

test('abrir um novo registro depois de salvar outro começa com o formulário vazio', async ({
  page,
}) => {
  await registerUser(page);
  await page.goto('/campanha');
  await page.getByRole('button', { name: 'Nova campanha' }).first().click();
  await page.getByLabel('Nome').fill('Primeira');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.locator('article.card h2')).toHaveText('Primeira');
  await page.getByRole('button', { name: 'Nova campanha' }).first().click();
  await expect(page.getByLabel('Nome')).toHaveValue('');
});
