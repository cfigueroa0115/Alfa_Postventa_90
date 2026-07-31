import { test, expect } from '@playwright/test';

test.describe('E2E-19: Opciones Siguiente ola', () => {
  test('shows info message when clicking disabled options', async ({ page }) => {
    await page.goto('/prototipo/seleccion');
    
    // Click a "Siguiente ola" option
    await page.getByText('Solicitud de certificado de póliza').click();
    
    // Should show toast message
    await expect(page.getByText(/futuras iteraciones/i)).toBeVisible();
  });
});
