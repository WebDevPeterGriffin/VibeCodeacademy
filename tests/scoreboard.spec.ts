/**
 * Scoreboard tests — run as authenticated regular user.
 */
import { test, expect } from '@playwright/test'

test.describe('Scoreboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard/scoreboard')
        await page.waitForLoadState('networkidle')
    })

    test('shows SCOREBOARD heading', async ({ page }) => {
        // Use role to avoid matching the "Scoreboard" nav link (CSS uppercase makes it ambiguous)
        await expect(page.getByRole('heading', { name: 'SCOREBOARD' })).toBeVisible()
    })

    test('shows builder count', async ({ page }) => {
        // "X builder(s) on the path" — unique enough
        await expect(page.getByText(/on the path/i)).toBeVisible()
    })

    test('shows "Your Rank" callout', async ({ page }) => {
        await expect(page.getByText('Your Rank')).toBeVisible()
    })

    test('shows "Lessons Completed" in callout', async ({ page }) => {
        await expect(page.getByText('Lessons Completed')).toBeVisible()
    })

    test('shows a "You" badge for the current user row', async ({ page }) => {
        await expect(page.getByText('You', { exact: true })).toBeVisible()
    })

    test('leaderboard has rank column and lesson count', async ({ page }) => {
        // Use exact: true to avoid matching rank numbers like "#1"
        await expect(page.getByText('#', { exact: true })).toBeVisible()
        await expect(page.getByText('Builder', { exact: true })).toBeVisible()
        await expect(page.getByText('Lessons', { exact: true })).toBeVisible()
    })

    test('page loads correctly for current user', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'SCOREBOARD' })).toBeVisible()
        await expect(page.getByText('Your Rank')).toBeVisible()
    })
})
