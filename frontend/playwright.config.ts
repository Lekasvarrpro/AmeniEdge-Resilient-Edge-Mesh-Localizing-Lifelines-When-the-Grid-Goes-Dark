import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'phone-se (320x568)',
      use: {
        viewport: { width: 320, height: 568 },
      },
    },
    {
      name: 'phone-standard (360x800)',
      use: {
        viewport: { width: 360, height: 800 },
      },
    },
    {
      name: 'phone-modern (390x844)',
      use: {
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'phone-large (412x915)',
      use: {
        viewport: { width: 412, height: 915 },
      },
    },
    {
      name: 'tablet-portrait (768x1024)',
      use: {
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'tablet-landscape (1024x768)',
      use: {
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'desktop-command (1440x900)',
      use: {
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
