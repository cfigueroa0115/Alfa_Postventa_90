import { test, expect } from '@playwright/test';

test.describe('E2E-13: Mobile 360px', () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test('landing renders correctly on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // No horizontal scrollbar
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    const clientWidth = await body.evaluate(el => el.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test('form is usable on mobile', async ({ page }) => {
    await page.goto('/prototipo/formulario');
    const continueBtn = page.getByRole('button', { name: /continuar/i });
    await expect(continueBtn).toBeVisible();
    // Button should be touchable (min 44px height)
    const box = await continueBtn.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
