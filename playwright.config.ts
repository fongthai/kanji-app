import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Desktop PC - Horizontal
    {
      name: 'pc-horizontal',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    // Desktop PC - Vertical (narrow window)
    {
      name: 'pc-vertical',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 1366 },
      },
    },
    // Tablet - Horizontal
    {
      name: 'tablet-horizontal',
      use: { 
        ...devices['iPad Pro landscape'],
      },
    },
    // Tablet - Vertical
    {
      name: 'tablet-vertical',
      use: { 
        ...devices['iPad Pro'],
      },
    },
    // Mobile - Horizontal
    {
      name: 'mobile-horizontal',
      use: { 
        ...devices['iPhone 14 Pro landscape'],
      },
    },
    // Mobile - Vertical
    {
      name: 'mobile-vertical',
      use: { 
        ...devices['iPhone 14 Pro'],
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
