import { registerUser, expect, test } from './support';

test('rolar dados, ver o resultado e o histórico persistido', async ({ page }) => {
  await registerUser(page);
  await page.goto('/dados');
  await expect(page.getByRole('heading', { name: 'Rolador de dados' })).toBeVisible();
  await expect(page.getByText('Nenhuma rolagem nesta sessão de aventuras.')).toBeVisible();
  await expect(page.locator('.dice-tray .die')).toHaveCount(1);

  // 2d20 + 1d6 com modificador +3
  await page.getByLabel('Quantidade').fill('2');
  await page.getByRole('button', { name: '+ Adicionar tipo de dado' }).click();
  await expect(page.locator('.dice-tray .die')).toHaveCount(3);
  await page.getByLabel('Modificador total').fill('3');
  await page.getByRole('button', { name: 'Rolar dados' }).click();
  await expect(page.getByRole('button', { name: 'Rolando…' })).toBeDisabled();

  const result = page.locator('#roll-result');
  await expect(result).toContainText('2d20 + 1d6+3 =', { timeout: 10_000 });
  await expect(page.getByRole('button', { name: 'Rolar novamente' })).toBeEnabled();
  await expect(page.locator('.roll-history li')).toHaveCount(1);

  // segunda rolagem: os dados partem de novo da esquerda da mesa
  await page.getByRole('button', { name: 'Rolar novamente' }).click();
  const travel = await page
    .locator('.dice-tray.rolling .die')
    .first()
    .evaluate((el: HTMLElement) => parseFloat(el.style.getPropertyValue('--travel-from')));
  expect(travel).toBeLessThan(-50);
  await expect(page.locator('.roll-history li')).toHaveCount(2, { timeout: 10_000 });
  await page.reload();
  await expect(page.locator('.roll-history li')).toHaveCount(2);
  await expect(page.locator('.roll-history li').first()).toContainText('2d20 + 1d6+3');
});

test('limita 10 dados do mesmo tipo somando os grupos', async ({ page }) => {
  await registerUser(page);
  await page.goto('/dados');
  await page.getByLabel('Quantidade').fill('10');
  await page.getByRole('button', { name: '+ Adicionar tipo de dado' }).click();
  await page.locator('select.dice-sides').nth(1).selectOption('20');
  const quantity = page.locator('input.dice-quantity').first();
  const message = await quantity.evaluate((el: HTMLInputElement) => el.validationMessage);
  expect(message).toContain('no máximo 10 dados d20');
});
