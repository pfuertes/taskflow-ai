import { test, expect } from '@playwright/test';

// These tests run without any saved auth state so we can test unauthenticated flows
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login page', () => {
  test('shows the login form with all required fields', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /TaskFlow/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
  });

  test('shows an error message on wrong credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Contraseña').fill('wrongpassword');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    // The server action redirects to /login?error=... which renders the error
    await expect(page.getByText('Credenciales incorrectas')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects to /dashboard after a valid login', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!);
    await page.getByLabel('Contraseña').fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page).toHaveURL('/dashboard');
  });

  test('redirects unauthenticated users away from /dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login/);
  });
});
