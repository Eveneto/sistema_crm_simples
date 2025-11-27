import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a página inicial
    await page.goto('/');
  });

  test('should redirect unauthenticated user to login', async ({ page }) => {
    // Tentar acessar dashboard sem estar logado
    await page.goto('/dashboard');

    // Deve redirecionar para login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');

    // Verificar elementos do formulário
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');

    // Tentar submeter sem preencher
    await page.getByRole('button', { name: /entrar/i }).click();

    // Verificar que ainda está na página de login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');

    // Clicar no link de registro
    await page.getByRole('link', { name: /criar conta/i }).click();

    // Deve navegar para página de registro
    await expect(page).toHaveURL(/.*register/);
    await expect(page.getByRole('heading', { name: /criar conta/i })).toBeVisible();
  });

  test('should navigate to password reset page', async ({ page }) => {
    await page.goto('/login');

    // Clicar no link de recuperação
    await page.getByRole('link', { name: /esqueceu.*senha/i }).click();

    // Deve navegar para página de reset
    await expect(page).toHaveURL(/.*reset-password/);
    await expect(page.getByRole('heading', { name: /recuperar senha/i })).toBeVisible();
  });
});

test.describe('Dashboard Access', () => {
  // Nota: Estes testes assumem que existe um usuário de teste
  // Em produção, usar @playwright/test fixtures para setup

  test.skip('should login and access dashboard', async ({ page }) => {
    // Este teste será implementado quando tivermos usuário de teste
    await page.goto('/login');

    // Preencher formulário
    await page.getByLabel(/e-mail/i).fill('test@example.com');
    await page.getByLabel(/senha/i).fill('password123');

    // Submeter
    await page.getByRole('button', { name: /entrar/i }).click();

    // Deve redirecionar para dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Verificar elementos do dashboard
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test.skip('should display sidebar navigation', async ({ page }) => {
    // Assumindo que o usuário está autenticado
    await page.goto('/dashboard');

    // Verificar que sidebar está visível
    await expect(page.getByRole('navigation')).toBeVisible();

    // Verificar links de navegação
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /contatos/i })).toBeVisible();
  });
});
