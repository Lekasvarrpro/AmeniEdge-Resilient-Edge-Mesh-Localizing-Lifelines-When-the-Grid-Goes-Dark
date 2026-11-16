import { test, expect } from '@playwright/test';

test.describe('Part 8 E2E: Rescue Alerts Queue, Clinical Bento Dashboard, Headcount & Truck Lifecycle', () => {
  test('verifies citizen SOS interface and category selection', async ({ page }) => {
    await page.goto('/sos');
    await expect(page.getByText('EMERGENCY SOS')).toBeVisible();

    const floodBtn = page.getByRole('button', { name: /Flood \/ Water/i });
    await expect(floodBtn).toBeVisible();
    await floodBtn.click();

    const wizardBtn = page.getByRole('button', { name: /\+ Add Details \/ Victims/i });
    await expect(wizardBtn).toBeVisible();
  });

  test('verifies rescue team bento dashboard matches approved template', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('ameniedge_token', 'mock-jwt-token');
      localStorage.setItem('ameniedge_role', 'RESCUE_MEMBER');
      localStorage.setItem('ameniedge_username', 'flood.north@amenedge.test');
      localStorage.setItem('ameniedge_team_id', 'TEAM-CHN-N-001');
      localStorage.setItem(
        'ameniedge_user',
        JSON.stringify({
          id: 'USR-RSC-001',
          username: 'flood.north@amenedge.test',
          fullName: 'Rajesh Kumar',
          role: 'RESCUE_MEMBER',
          teamId: 'TEAM-CHN-N-001',
          stationId: 'STA-CHN-N-001',
        })
      );
    });

    await page.goto('/team');

    // 1. Verify Queue Panel Header
    await expect(page.getByText('Rescue Alerts')).toBeVisible();

    // 2. Verify Department Overview Banner
    await expect(page.getByText(/Flood Rescue Department/i)).toBeVisible();
    await expect(page.getByText('VHF Comms: 156.800 MHz (Ch 16) - Connected')).toBeVisible();

    // 3. Verify Headcount Badges
    await expect(page.getByText('Total')).toBeVisible();
    await expect(page.getByText('Available')).toBeVisible();
    await expect(page.getByText('Deployed')).toBeVisible();

    // 4. Verify Demo Speed Multiplier (1x default)
    await expect(page.getByRole('button', { name: '1x' })).toBeVisible();
    await expect(page.getByRole('button', { name: '5x' })).toBeVisible();
    await expect(page.getByRole('button', { name: '10x' })).toBeVisible();

    // 5. Verify Tactical Navigation Map & Telemetry HUD
    await expect(page.getByText(/Tactical Navigation Route/i)).toBeVisible();

    // 6. Verify Progression Stepper Timeline
    await expect(page.getByText(/Mission Progression Schedule/i)).toBeVisible();
    await expect(page.getByText(/Dispatched & Team Assigned/i)).toBeVisible();
    await expect(page.getByText(/En Route to Incident Site/i)).toBeVisible();

    // 7. Verify Completed Missions Table
    await expect(page.getByText(/Completed Missions History/i)).toBeVisible();
  });
});
