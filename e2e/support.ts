import { test as base, expect, type Page } from '@playwright/test';

export const E2E_DOMAIN = '@e2e.test';
export const PASSWORD = 'senha-de-teste-123';

export function uniqueEmail(label = 'user') {
  return `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${E2E_DOMAIN}`;
}

/** Cadastra um usuário novo pela interface e espera cair na área logada. */
export async function registerUser(page: Page, name = 'Ana Teste') {
  const email = uniqueEmail();
  await page.goto('/register');
  await page.getByLabel('Nome').fill(name);
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(PASSWORD);
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page).toHaveURL(/\/personagem$/);
  return { email, name };
}

export async function login(page: Page, email: string, password = PASSWORD) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

export async function logout(page: Page) {
  await page.locator('button.profile').click();
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page).toHaveURL(/\/login$/);
}

function randomIp() {
  const octet = () => 1 + Math.floor(Math.random() * 253);
  return `10.${octet()}.${octet()}.${octet()}`;
}

/**
 * Cada teste usa um IP de origem próprio (x-forwarded-for), assim o rate limit continua
 * ligado nos testes sem que um teste consuma a cota de outro.
 */
export const test = base.extend({
  // `provide` (não `use`) para o lint não confundir com um Hook do React.

  extraHTTPHeaders: async ({}, provide) => {
    await provide({ 'x-forwarded-for': randomIp() });
  },
});

export { expect };
