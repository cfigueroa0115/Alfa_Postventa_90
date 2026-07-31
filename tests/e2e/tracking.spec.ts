import { test, expect } from '@playwright/test';

test.describe('E2E-07: Consulta por código', () => {
  test('shows error for invalid tracking code format', async ({ page }) => {
    await page.goto('/seguimiento');
    
    await page.getByLabel(/código de radicado/i).fill('invalid-code');
    await page.getByRole('button', { name: /buscar/i }).click();
    
    await expect(page.getByText(/formato inválido/i)).toBeVisible();
  });

  test('shows not found for non-existent valid code', async ({ page }) => {
    await page.goto('/seguimiento/DEMO-ALFA-20260101-ZZZZZZ');
    
    await expect(page.getByText(/no se encontró/i)).toBeVisible();
  });
});
