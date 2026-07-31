import { test, expect } from '@playwright/test';

test.describe('E2E-01: Journey exitoso completo', () => {
  test('completes the full journey from landing to confirmation', async ({ page }) => {
    // 1. Landing
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // 2. Navigate to prototype
    await page.getByRole('link', { name: /iniciar trámite demo/i }).click();
    await expect(page).toHaveURL('/prototipo');
    
    // 3. Start journey
    await page.getByRole('button', { name: /comenzar/i }).click();
    await expect(page).toHaveURL('/prototipo/seleccion');
    
    // 4. Select process
    await page.getByText('Actualización de datos de contacto').click();
    await expect(page).toHaveURL('/prototipo/requisitos');
    
    // 5. Confirm requirements
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).check();
    }
    await page.getByRole('button', { name: /estoy listo/i }).click();
    await expect(page).toHaveURL('/prototipo/formulario');
    
    // 6. Step 1 - Identification (read-only, just advance)
    await page.getByRole('button', { name: /continuar/i }).click();
    
    // 7. Step 2 - Current data (read-only, just advance)
    await page.getByRole('button', { name: /continuar/i }).click();
    
    // 8. Step 3 - New data
    await page.getByLabel(/correo electrónico nuevo/i).fill('demo@ejemplo.com');
    await page.getByLabel(/confirmar correo/i).fill('demo@ejemplo.com');
    await page.getByLabel(/teléfono nuevo/i).fill('3001234567');
    await page.locator('select').first().selectOption('bogota');
    await page.locator('select').last().selectOption('email');
    await page.getByRole('button', { name: /continuar/i }).click();
    
    // 9. Revision page
    await expect(page).toHaveURL('/prototipo/revision');
    await expect(page.getByText('demo@ejemplo.com')).toBeVisible();
    
    // 10. Consent and submit
    await page.getByLabel(/autorizo/i).check();
    await page.getByRole('button', { name: /enviar solicitud/i }).click();
    
    // 11. Confirmation page
    await expect(page.getByText(/radicada exitosamente/i)).toBeVisible();
    await expect(page.getByText(/DEMO-ALFA-/)).toBeVisible();
  });
});
