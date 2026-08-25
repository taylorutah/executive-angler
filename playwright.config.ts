import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);
const BASE = process.env.BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [["github"], ["list"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : "list",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE,
    trace: "on-first-retry",
  },
  webServer: process.env.PW_NO_WEBSERVER
    ? undefined
    : {
        command: process.env.PW_WEB_COMMAND ?? "npm run start -- -p 3000",
        url: BASE,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects: [
    {
      name: "e2e",
      testMatch: /.*\/(journeys|auth|font-census)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "visual",
      testMatch: /.*\/visual\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
