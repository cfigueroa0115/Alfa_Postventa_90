import { test, expect } from '@playwright/test';

test.describe('E2E-02: Errores de validación', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to the form
    await page.goto('/prototipo/formulario');
    // Clear any existing draft by discarding
    const discardBtn = page.getByRole('button', { name: /empezar de nuevo/i });
    if (await discardBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await discardBtn.click();
    }
    // Advance to step 3
    await page.getByRole('button', { name: /continuar/i }).click();
    await page.getByRole('button', { name: /continuar/i }).click();
  });

  test('shows error for invalid email format', async ({ page }) => {
    await page.getByLabel(/correo electrónico nuevo/i).fill('notanemail');
    await page.getByRole('button', { name: /continuar/i }).click();
    await expect(page.getByText(/formato de correo/i)).toBeVisible();
  });

  test('shows error for non-matching emails', async ({ page }) => {
    await page.getByLabel(/correo electrónico nuevo/i).fill('a@ejemplo.com');
    await page.getByLabel(/confirmar correo/i).fill('b@ejemplo.com');
    await page.getByLabel(/teléfono nuevo/i).fill('3001234567');
    await page.locator('select').first().selectOption('bogota');
    await page.locator('select').last().selectOption('email');
    await page.getByRole('button', { name: /continuar/i }).click();
    await expect(page.getByText(/no coinciden/i)).toBeVisible();
  });

  test('shows error for invalid phone', async ({ page }) => {
    await page.getByLabel(/correo electrónico nuevo/i).fill('demo@ejemplo.com');
    await page.getByLabel(/confirmar correo/i).fill('demo@ejemplo.com');
    await page.getByLabel(/teléfono nuevo/i).fill('1234567890');
    await page.getByRole('button', { name: /continuar/i }).click();
    await expect(page.getByText(/10 dígitos.*comenzar con 3/i)).toBeVisible();
  });
});
