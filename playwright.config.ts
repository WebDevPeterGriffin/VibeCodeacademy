import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: 1,
    reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'off',
    },
    projects: [
        // 1. Auth setup — runs first, saves signed-in storage states
        {
            name: 'setup',
            testMatch: /auth\.setup\.ts/,
        },
        // 2. Tests that run as a regular signed-in user
        {
            name: 'user',
            dependencies: ['setup'],
            use: {
                ...devices['Desktop Chrome'],
                storageState: '.playwright/user.json',
            },
            testMatch: /tests\/(dashboard|lesson|scoreboard|profile|nav)\.spec\.ts/,
        },
        // 3. Tests that run as admin
        {
            name: 'admin',
            dependencies: ['setup'],
            use: {
                ...devices['Desktop Chrome'],
                storageState: '.playwright/admin.json',
            },
            testMatch: /tests\/admin\.spec\.ts/,
        },
        // 4. Tests that run with NO session (public / auth pages)
        {
            name: 'public',
            use: { ...devices['Desktop Chrome'] },
            testMatch: /tests\/auth\.spec\.ts/,
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
    },
})
