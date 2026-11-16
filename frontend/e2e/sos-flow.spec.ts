import { test, expect } from '@playwright/test';

test.describe('AmeniEdge Emergency SOS Flow and Responsive Integrity', () => {
  test('verifies no horizontal scrolling on homepage and touch targets', async ({ page }) => {
    await page.goto('/');

    // Check no horizontal scrolling at viewport
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBeFalsy();

    // Verify SOS Button is present and visible
    const heroSosButton = page.getByRole('button', { name: /Send Immediate SOS/i });
    await expect(heroSosButton).toBeVisible();

    // Verify Connectivity Bar is present
    const statusBar = page.getByRole('status');
    await expect(statusBar).toBeVisible();
  });

  test('verifies guest SOS category selection and navigation to wizard', async ({ page }) => {
    await page.goto('/sos');

    // Check SOS button size
    const sosButton = page.getByRole('button', { name: /Send Emergency SOS/i });
    await expect(sosButton).toBeVisible();
    const box = await sosButton.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(160);
      expect(box.height).toBeGreaterThanOrEqual(160);
    }

    // Select Flood Category
    const floodChip = page.getByRole('button', { name: /Flood/i });
    await expect(floodChip).toBeVisible();
    await floodChip.click();

    // Open Details Wizard
    const addDetailsBtn = page.getByRole('button', { name: /\+ Add Details/i });
    await expect(addDetailsBtn).toBeVisible();
    await addDetailsBtn.click();

    // Verify Step 1 is displayed
    await expect(page.getByText(/Step 1 of 4/i)).toBeVisible();
  });

  test('verifies login autofill and navigation to Station Leader console', async ({ page }) => {
    await page.goto('/login');

    // Switch to Rescue Team / Resource tab
    const rescueTab = page.getByRole('button', { name: /Rescue Team \/ Resource/i });
    await rescueTab.click();

    // Click Leader chip autofill
    const leaderChip = page.getByRole('button', { name: /Leader: leader_north/i });
    await leaderChip.click();

    // Submit login form
    const submitBtn = page.getByRole('button', { name: /Access Station Command/i });
    await submitBtn.click();

    // Wait for redirect to /dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Verify Leader Console rendered with RescueFit Dispatch
    await expect(page.getByText(/Station North Command Console/i)).toBeVisible();
    await expect(page.getByText(/RescueFit Dispatch Intelligence/i)).toBeVisible();
  });
});
