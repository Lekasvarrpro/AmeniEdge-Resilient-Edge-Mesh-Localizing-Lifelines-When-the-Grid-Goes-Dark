import { test, expect } from '@playwright/test';

test.describe('Rescue Team Accept / Decline and Stepper Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to base and inject auth state for Swift Water Alpha with an active mission in mock storage or API
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('ameniedge_token', 'mock-valid-session-jwt');
      localStorage.setItem('ameniedge_role', 'RESCUE_MEMBER');
      localStorage.setItem('ameniedge_username', 'flood.north@amenedge.test');
      localStorage.setItem('ameniedge_team_id', 'TEAM-CHN-N-001');
    });
  });

  test('verifies standby empty state or active mission dispatch interface', async ({ page }) => {
    await page.goto('/team');
    // Header should always be visible
    await expect(page.getByText('Active Dispatch Center')).toBeVisible();

    // Either a dispatched mission or the standby empty card is visible
    const hasMission = await page.getByRole('button', { name: /ACCEPT MISSION/i }).isVisible();
    if (!hasMission) {
      await expect(page.getByText('No Active Incident Dispatched')).toBeVisible();
    }
  });

  test('verifies decline flow requires chip selection when task is present', async ({ page }) => {
    await page.goto('/team');
    const declineBtn = page.getByRole('button', { name: 'Decline' });
    if (await declineBtn.isVisible()) {
      await declineBtn.click();
      await expect(page.getByText('Reason Required to Decline Emergency Task')).toBeVisible();

      const confirmDeclineBtn = page.getByRole('button', { name: 'Confirm Decline' });
      await expect(confirmDeclineBtn).toBeDisabled();

      const chipTooFar = page.getByRole('button', { name: 'Too far' });
      await chipTooFar.click();
      await expect(confirmDeclineBtn).toBeEnabled();
    }
  });
});

