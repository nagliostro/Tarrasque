import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  globalTeardown: './e2e/global-teardown.ts',
  use: { baseURL: 'http://localhost:3100', ...devices['Desktop Chrome'] },
  webServer: {
    command: 'pnpm build && pnpm exec next start -p 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
