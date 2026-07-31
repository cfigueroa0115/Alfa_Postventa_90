import { test, expect } from '@playwright/test';

test.describe('E2E-12: Página de presentación', () => {
  test('shows QR code and prototype URL', async ({ page }) => {
    await page.goto('/presentacion');
    
    await expect(page.getByRole('heading', { name: /explorar prototipo/i })).toBeVisible();
    // QR image should be present
    const qrImg = page.locator('img[alt*="QR"]');
    await expect(qrImg).toBeVisible();
  });
});
