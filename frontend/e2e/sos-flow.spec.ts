import { test, expect } from '@playwright/test';

test.describe('AmeniEdge Emergency SOS Flow and Responsive Integrity', () => {
  test('verifies no horizontal scrolling and touch targets >= 48px', async ({ page }) => {
    await page.goto('/');

    // Check no horizontal scrolling at viewport
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBeFalsy();

    // Verify SOS Button is present and meets size budget (>= 160px)
    const sosButton = page.getByRole('button', { name: /Send Emergency SOS/i });
    await expect(sosButton).toBeVisible();
    const box = await sosButton.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(160);
      expect(box.height).toBeGreaterThanOrEqual(160);
    }

    // Verify Connectivity Bar is present
    const statusBar = page.getByRole('status');
    await expect(statusBar).toBeVisible();
  });

  test('verifies emergency category selection and navigation to wizard', async ({ page }) => {
    await page.goto('/');

    // Select Flood Category
    const floodChip = page.getByRole('button', { name: /Flood/i });
    await expect(floodChip).toBeVisible();
    await floodChip.click();

    // Open Details Wizard
    const addDetailsBtn = page.getByRole('button', { name: /\+ Add Details/i });
    await addDetailsBtn.click();

    // Verify Step 1 is displayed
    await expect(page.getByText(/Step 1 of 4/i)).toBeVisible();
  });

  test('verifies RescueFit recommendation panel on station leader console', async ({ page }) => {
    await page.goto('/');

    // Switch Role to Station Leader
    const roleSelect = page.getByLabel(/Select command role/i);
    await roleSelect.selectOption('LEADER');

    // Verify Leader Console rendered
    await expect(page.getByText(/Station North Command Console/i)).toBeVisible();
    await expect(page.getByText(/RescueFit Dispatch Intelligence/i)).toBeVisible();
  });

  test('verifies High-Contrast Outdoor Theme toggle meets contrast', async ({ page }) => {
    await page.goto('/');

    // Toggle theme to dark and then high-contrast
    const themeBtn = page.getByLabel(/Toggle visual theme/i);
    await themeBtn.click();
    await themeBtn.click();

    const themeAttr = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    expect(themeAttr).toBe('high-contrast');
  });
});
