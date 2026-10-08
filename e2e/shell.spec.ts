import { expect, test } from '@playwright/test';

test('raiz redireciona para Personagem e marca o item ativo', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/personagem$/);
  await expect(page.getByRole('link', { name: 'Personagem' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Personagem.');
});

test('tema escolhido persiste por cookie (SSR, sem flash)', async ({ page }) => {
  await page.goto('/campanha');
  await page.getByRole('button', { name: 'Configurações' }).click();
  await page.getByLabel('Tema').selectOption('forest');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'forest');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'forest');
});

test('sidebar recolhe e lembra o estado', async ({ page }) => {
  await page.goto('/magias');
  await page.getByRole('button', { name: 'Recolher sidebar' }).click();
  await expect(page.locator('#sidebar')).toHaveClass(/collapsed/);
  await page.reload();
  await expect(page.locator('#sidebar')).toHaveClass(/collapsed/);
});

test('drawer mobile abre, navega e fecha', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/personagem');
  await expect(page.locator('#sidebar')).toHaveJSProperty('inert', true);
  await page.getByRole('button', { name: 'Expandir sidebar' }).click();
  await expect(page.locator('#sidebar')).toHaveClass(/mobile-open/);
  await page.getByRole('link', { name: 'Bestiário' }).click();
  await expect(page).toHaveURL(/\/bestiario$/);
  await expect(page.locator('#sidebar')).not.toHaveClass(/mobile-open/);
});

test('rota inexistente responde 404', async ({ page }) => {
  const response = await page.goto('/nao-existe');
  expect(response?.status()).toBe(404);
});
