/**
 * Auth Setup — runs once before user/admin test projects.
 * Signs in via the UI and saves storage state (cookies) so every
 * subsequent test gets a pre-authenticated browser context for free.
 *
 * Required env vars (copy from .env.local):
 *   TEST_USER_EMAIL     — a regular (non-admin) Supabase account
 *   TEST_USER_PASSWORD
 *   TEST_ADMIN_EMAIL    — webdevpetergriffin@gmail.com (or the ADMIN_EMAIL)
 *   TEST_ADMIN_PASSWORD
 */
import { test as setup, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const USER_FILE = '.playwright/user.json'
const ADMIN_FILE = '.playwright/admin.json'

// Helper: sign in via the login form and save storage state
async function signIn(
    page: Parameters<Parameters<typeof setup>[1]>[0],
    email: string,
    password: string,
    storageFile: string
) {
    await page.goto('/login')
    await page.locator('#email').fill(email)
    await page.locator('#password').fill(password)
    await page.getByRole('button', { name: /log in/i }).click()

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 15_000 })
    await expect(page.getByText('MY WORKSPACE')).toBeVisible()

    // Persist the auth cookies/localStorage
    await page.context().storageState({ path: storageFile })
}

setup.beforeAll(() => {
    // Ensure the .playwright directory exists
    fs.mkdirSync(path.dirname(USER_FILE), { recursive: true })
})

setup('authenticate as regular user', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL
    const password = process.env.TEST_USER_PASSWORD

    if (!email || !password) {
        throw new Error(
            'Missing TEST_USER_EMAIL or TEST_USER_PASSWORD env vars.\n' +
            'Add them to .env.local to run the test suite.'
        )
    }

    await signIn(page, email, password, USER_FILE)
})

setup('authenticate as admin', async ({ page }) => {
    const email = process.env.TEST_ADMIN_EMAIL
    const password = process.env.TEST_ADMIN_PASSWORD

    if (!email || !password) {
        throw new Error(
            'Missing TEST_ADMIN_EMAIL or TEST_ADMIN_PASSWORD env vars.\n' +
            'Add them to .env.local to run the test suite.'
        )
    }

    await signIn(page, email, password, ADMIN_FILE)
})
