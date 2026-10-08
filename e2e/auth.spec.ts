import { PASSWORD, login, logout, registerUser, uniqueEmail, expect, test } from './support';

test('visitante é enviado ao login e volta à tela inicial depois de entrar', async ({ page }) => {
  await page.goto('/magias');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Entrar.');
});

test('cadastro mostra o nome na sidebar e sair volta ao login', async ({ page }) => {
  await registerUser(page, 'Lia Mago');
  await expect(page.locator('.user-text strong')).toHaveText('Lia Mago');
  await expect(page.locator('.avatar')).toHaveText('LM');
  await logout(page);
  await page.goto('/personagem');
  await expect(page).toHaveURL(/\/login$/);
});

test('senha errada mostra erro em português', async ({ page }) => {
  const { email } = await registerUser(page);
  await logout(page);
  await login(page, email, 'senha-errada-999');
  await expect(page.locator('.auth-error')).toHaveText('E-mail ou senha incorretos.');
  await expect(page).toHaveURL(/\/login$/);
});

test('e-mail repetido é recusado no cadastro', async ({ page }) => {
  const { email } = await registerUser(page);
  await logout(page);
  await page.goto('/register');
  await page.getByLabel('Nome').fill('Outra Pessoa');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(PASSWORD);
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page.locator('.auth-error')).toHaveText('Já existe uma conta com este e-mail.');
});

test('senha curta é barrada já no navegador (minLength) e não chega ao servidor', async ({
  page,
}) => {
  await page.goto('/register');
  await page.getByLabel('Nome').fill('Ana');
  await page.getByLabel('E-mail').fill(uniqueEmail());
  await page.getByLabel('Senha').fill('1234567');
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page).toHaveURL(/\/register$/);
  const tooShort = await page
    .getByLabel('Senha')
    .evaluate((el: HTMLInputElement) => el.validity.tooShort);
  expect(tooShort).toBe(true);
  await expect(page.locator('.auth-error')).toHaveCount(0);
});

test('tema e perfil acompanham a conta, mesmo sem cookies', async ({ page, context }) => {
  const { email } = await registerUser(page, 'Rafa');
  await page.getByRole('button', { name: 'Configurações' }).click();
  await page.locator('select[name=theme]').selectOption('terminal');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.locator('#toast')).toHaveText('Configurações salvas.');

  await page.locator('button.profile').click();
  await page.getByLabel('Nome de exibição').fill('Rafael Bardo');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.locator('.user-text strong')).toHaveText('Rafael Bardo');

  await logout(page);
  await context.clearCookies();
  await login(page, email);
  await expect(page).toHaveURL(/\/personagem$/);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'terminal');
  await expect(page.locator('.user-text strong')).toHaveText('Rafael Bardo');
});

test('após 5 tentativas erradas o login é bloqueado (rate limit)', async ({ page }) => {
  const { email } = await registerUser(page);
  await logout(page);
  for (let i = 0; i < 5; i++) {
    await login(page, email, `senha-errada-${i}-xyz`);
    await expect(page.locator('.auth-error')).toHaveText('E-mail ou senha incorretos.');
  }
  await login(page, email, 'senha-errada-6-xyz');
  await expect(page.locator('.auth-error')).toContainText('Muitas tentativas');
  // mesmo a senha correta fica bloqueada dentro da janela
  await login(page, email);
  await expect(page.locator('.auth-error')).toContainText('Muitas tentativas');
  await expect(page).toHaveURL(/\/login$/);
});

test('erro no formulário preserva e-mail e nome, mas nunca a senha', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('Nome').fill('Ana Teste');
  await page.getByLabel('E-mail').fill('ana.teste@e2e.test');
  // 7 caracteres: a validação do servidor recusa (o minLength do navegador é contornado)
  await page
    .getByLabel('Senha')
    .evaluate((el: HTMLInputElement) => el.removeAttribute('minlength'));
  await page.getByLabel('Senha').fill('1234567');
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page.locator('.auth-error')).toBeVisible();
  await expect(page.getByLabel('Nome')).toHaveValue('Ana Teste');
  await expect(page.getByLabel('E-mail')).toHaveValue('ana.teste@e2e.test');
  await expect(page.getByLabel('Senha')).toHaveValue('');
  await expect(page.getByLabel('Senha')).toHaveAttribute('aria-describedby', 'auth-error');
});

test('rotas HTTP paralelas de login e cadastro estão desativadas', async ({ request }) => {
  const signUp = await request.post('/api/auth/sign-up/email', {
    data: { name: 'x'.repeat(500), email: 'http-bypass@e2e.test', password: 'senha-de-teste-123' },
  });
  expect(signUp.status()).toBe(404);
  const signIn = await request.post('/api/auth/sign-in/email', {
    data: { email: 'http-bypass@e2e.test', password: 'senha-de-teste-123' },
  });
  expect(signIn.status()).toBe(404);
});

test('sair limpa o tema do navegador para o próximo usuário', async ({ page }) => {
  await registerUser(page);
  await page.getByRole('button', { name: 'Configurações' }).click();
  await page.locator('select[name=theme]').selectOption('forest');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.locator('#toast')).toHaveText('Configurações salvas.');
  await logout(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
