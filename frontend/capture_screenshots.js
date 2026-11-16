import { chromium } from '@playwright/test';
import { preview } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function capture() {
  const screenshotsDir = path.resolve(__dirname, '../docs/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const brainScreenshotsDir = 'C:\\Users\\Lekas\\.gemini\\antigravity\\brain\\39af0d3f-0b62-4d7d-89ce-873b2ff633cf\\screenshots';
  if (!fs.existsSync(brainScreenshotsDir)) {
    fs.mkdirSync(brainScreenshotsDir, { recursive: true });
  }

  console.log('Starting Vite preview server on port 4173...');
  const server = await preview({
    root: __dirname,
    preview: {
      port: 4173,
      open: false,
    },
  });

  console.log('Launching browser via Microsoft Edge channel...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const routes = [
    { name: 'home', path: '/', auth: null },
    { name: 'login', path: '/login?role=citizen', auth: null },
    { name: 'register', path: '/register?role=rescue', auth: null },
    { name: 'citizen-portal', path: '/sos', auth: null },
    { name: 'rescue-team', path: '/team', auth: { role: 'RESCUE_MEMBER', username: 'Swift Alpha Lead' } },
    { name: 'station-leader', path: '/dashboard', auth: { role: 'STATION_LEADER', username: 'Commander Roy' } },
    { name: 'regional-supervisor', path: '/regional', auth: { role: 'REGIONAL_SUPERVISOR', username: 'Regional Sup. Priya' } },
    { name: 'admin-portal', path: '/admin', auth: { role: 'ORGANIZATION_ADMIN', username: 'Sys Admin Kumar' } },
  ];

  const viewports = [
    { name: 'mobile-360', width: 360, height: 800 },
    { name: 'desktop-1440', width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });

    for (const r of routes) {
      const page = await context.newPage();

      // Listen for unexpected dialogs
      page.on('dialog', async (dialog) => {
        console.warn(`[WARNING] Dialog on ${r.name}: ${dialog.message()}`);
        await dialog.dismiss();
      });

      // Navigate to homepage first to inject auth state if needed
      if (r.auth) {
        await page.goto('http://localhost:4173/');
        await page.evaluate((auth) => {
          localStorage.setItem('ameniedge_token', 'mock-valid-session-jwt');
          localStorage.setItem('ameniedge_role', auth.role);
          localStorage.setItem('ameniedge_username', auth.username);
        }, r.auth);
      } else {
        await page.goto('http://localhost:4173/');
        await page.evaluate(() => {
          localStorage.clear();
        });
      }

      const url = `http://localhost:4173${r.path}`;
      console.log(`Navigating to ${url} [${vp.name}]...`);
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600); // Allow Framer Motion animations to settle

      const filename = `${r.name}-${vp.name}.png`;
      const outPath = path.join(screenshotsDir, filename);
      const brainOutPath = path.join(brainScreenshotsDir, filename);

      await page.screenshot({ path: outPath, fullPage: false });
      fs.copyFileSync(outPath, brainOutPath);
      console.log(`Saved screenshot: ${outPath}`);
      await page.close();
    }

    await context.close();
  }

  await browser.close();
  server.httpServer.close();
  console.log('All 16 responsive screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
