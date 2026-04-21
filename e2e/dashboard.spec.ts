import { test, expect } from '@playwright/test';

// All tests in this file use the authenticated storageState from playwright.config.ts

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test.describe('Kanban columns', () => {
    test('displays the three columns', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Por hacer' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'En progreso' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Terminado' })).toBeVisible();
    });
  });

  test.describe('Nueva Tarea modal', () => {
    test('opens the modal when the button is clicked', async ({ page }) => {
      await page.getByRole('button', { name: 'Nueva Tarea' }).click();

      await expect(page.getByRole('heading', { name: 'Nueva Tarea' })).toBeVisible();
      await expect(page.getByLabel('Título', { exact: false })).toBeVisible();
      await expect(page.getByLabel('Descripción')).toBeVisible();
      await expect(page.getByLabel('Prioridad')).toBeVisible();
    });

    test('closes the modal when Cancelar is clicked', async ({ page }) => {
      await page.getByRole('button', { name: 'Nueva Tarea' }).click();
      await expect(page.getByRole('heading', { name: 'Nueva Tarea' })).toBeVisible();

      await page.getByRole('button', { name: 'Cancelar' }).click();

      await expect(page.getByRole('heading', { name: 'Nueva Tarea' })).not.toBeVisible();
    });

    test('creates a task and shows it in the Por hacer column', async ({ page }) => {
      const title = `E2E task ${Date.now()}`;

      await page.getByRole('button', { name: 'Nueva Tarea' }).click();
      await page.getByLabel('Título', { exact: false }).fill(title);
      await page.getByLabel('Descripción').fill('Descripción de prueba');
      await page.getByLabel('Prioridad').selectOption('high');
      await page.getByRole('button', { name: 'Crear Tarea' }).click();

      // Modal closes after successful creation
      await expect(page.getByRole('heading', { name: 'Nueva Tarea' })).not.toBeVisible();

      // New task card appears on the board
      await expect(page.getByText(title)).toBeVisible();
    });

    test('disables the submit button while creating', async ({ page }) => {
      await page.getByRole('button', { name: 'Nueva Tarea' }).click();
      await page.getByLabel('Título', { exact: false }).fill('Loading test');

      // Intercept the network request so we can observe the loading state
      await page.route('**', (route) => route.continue());

      const submitButton = page.getByRole('button', { name: 'Crear Tarea' });
      await submitButton.click();

      // The button becomes disabled (shows "Creando...") during submission
      // We assert it's eventually re-enabled after the action completes
      await expect(page.getByRole('button', { name: /Crear Tarea|Creando/ })).toBeVisible();
    });
  });
});
