import { test, expect } from '@playwright/test';

test.describe('AmeniEdge Public Safety and Zero-Popup Integrity', () => {
  test('verifies no dialog or auth popup appears on homepage for 10 seconds', async ({ page }) => {
    let dialogTriggered = false;
    let dialogMessage = '';

    // Listen for any native dialogs (alert, confirm, prompt)
    page.on('dialog', async (dialog) => {
      dialogTriggered = true;
      dialogMessage = dialog.message();
      await dialog.dismiss().catch(() => {});
    });

    // 1. Navigate to public homepage
    await page.goto('/');

    // 2. Confirm core branding and hero SOS button are visible immediately
    await expect(page.getByText('AmeniEdge')).toBeVisible();
    await expect(page.getByRole('button', { name: /Send Immediate SOS/i })).toBeVisible();

    // 3. Wait for 10 continuous seconds to ensure no delayed popups or session timers trigger
    await page.waitForTimeout(10000);

    // 4. Assert no dialog event ever fired
    expect(dialogTriggered, `Unexpected dialog appeared: "${dialogMessage}"`).toBeFalsy();

    // 5. Assert no modal overlay or unexpected dialog container exists in DOM
    const modalDialogs = page.locator('[role="dialog"], [aria-modal="true"], .modal, .modal-backdrop');
    const modalCount = await modalDialogs.count();
    expect(modalCount).toBe(0);

    // 6. Assert user is still peacefully on the homepage
    expect(page.url()).toContain('http://localhost:5173/');
  });

  test('verifies guest SOS portal (/sos) works immediately without requiring sign-in', async ({ page }) => {
    let dialogTriggered = false;
    page.on('dialog', async (dialog) => {
      dialogTriggered = true;
      await dialog.dismiss().catch(() => {});
    });

    // 1. Visit guest SOS route directly
    await page.goto('/sos');

    // 2. Verify Guest SOS badge is visible and no sign-in required
    await expect(page.getByText('Guest SOS')).toBeVisible();
    await expect(page.getByRole('button', { name: /Send Emergency SOS/i })).toBeVisible();

    // 3. Verify no dialog triggered
    expect(dialogTriggered).toBeFalsy();

    // 4. Verify category triggers are directly clickable
    const floodButton = page.getByRole('button', { name: /Flood/i });
    await expect(floodButton).toBeVisible();
  });

  test('verifies protected route (/dashboard) redirects cleanly to /login without popups', async ({ page }) => {
    let dialogTriggered = false;
    page.on('dialog', async (dialog) => {
      dialogTriggered = true;
      await dialog.dismiss().catch(() => {});
    });

    // 1. Clear any stored auth tokens
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // 2. Attempt direct visit to protected station leader dashboard
    await page.goto('/dashboard');

    // 3. Assert clean browser redirect to login with query param
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/);

    // 4. Verify login page rendered cleanly without modal popups
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    expect(dialogTriggered).toBeFalsy();
  });
});

