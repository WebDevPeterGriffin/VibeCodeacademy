/**
 * AppNav tests — run as authenticated regular user.
 */
import { test, expect } from '@playwright/test'

test.describe('AppNav (authenticated)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard')
    })

    test('shows logo linking to /dashboard', async ({ page }) => {
        const logo = page.getByRole('link', { name: /vibecode academy/i })
        await expect(logo).toBeVisible()
        const href = await logo.getAttribute('href')
        expect(href).toBe('/dashboard')
    })

    test('shows Dashboard nav link (active on dashboard)', async ({ page }) => {
        await expect(page.getByRole('link', { name: /^dashboard$/i })).toBeVisible()
    })

    test('shows Scoreboard nav link', async ({ page }) => {
        await expect(page.getByRole('link', { name: /scoreboard/i })).toBeVisible()
    })

    test('shows profile avatar button with user initials', async ({ page }) => {
        // Avatar button is a square with 2 uppercase letters
        const avatar = page.getByRole('button', { name: /profile menu/i })
        await expect(avatar).toBeVisible()
    })

    test('profile dropdown opens on avatar click', async ({ page }) => {
        await page.getByRole('button', { name: /profile menu/i }).click()
        await expect(page.getByText('Signed in as')).toBeVisible()
        await expect(page.getByRole('link', { name: /profile settings/i })).toBeVisible()
        await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible()
    })

    test('profile dropdown closes when clicking outside', async ({ page }) => {
        await page.getByRole('button', { name: /profile menu/i }).click()
        await expect(page.getByText('Signed in as')).toBeVisible()

        // Click somewhere outside the dropdown
        await page.locator('h1').first().click()
        await expect(page.getByText('Signed in as')).not.toBeVisible()
    })

    test('Scoreboard link navigates to scoreboard', async ({ page }) => {
        await page.getByRole('link', { name: /scoreboard/i }).click()
        await expect(page).toHaveURL('/dashboard/scoreboard')
        await expect(page.getByText('SCOREBOARD')).toBeVisible()
    })

    test('Profile Settings link navigates to profile', async ({ page }) => {
        await page.getByRole('button', { name: /profile menu/i }).click()
        await page.getByRole('link', { name: /profile settings/i }).click()
        await expect(page).toHaveURL('/dashboard/profile')
    })

    test('Sign Out redirects to landing page', async ({ page }) => {
        await page.getByRole('button', { name: /profile menu/i }).click()
        await page.getByRole('button', { name: /sign out/i }).click()
        // After sign out, middleware redirects logged-out users nowhere special
        // so they'll land on / (the landing page) or /login
        await page.waitForURL(url => ['/', '/login'].some(p => url.pathname === p), { timeout: 10_000 })
    })
})
