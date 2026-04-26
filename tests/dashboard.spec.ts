/**
 * Dashboard tests — run as authenticated regular user.
 */
import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard')
        await page.waitForLoadState('networkidle')
    })

    test('shows MY WORKSPACE heading', async ({ page }) => {
        await expect(page.getByText('MY WORKSPACE')).toBeVisible()
    })

    test('shows builds completed counter', async ({ page }) => {
        await expect(page.getByText(/builds completed/i)).toBeVisible()
    })

    test('shows module timeline or empty state', async ({ page }) => {
        // Check either: lesson links exist (modules loaded) OR the empty state is shown
        const hasLessonLinks = (await page.locator('a[href^="/lessons/"]').count()) > 0
        const hasEmpty = await page.getByText(/no modules available yet/i).isVisible().catch(() => false)
        expect(hasLessonLinks || hasEmpty).toBe(true)
    })

    test('does NOT show Admin Panel link for regular user', async ({ page }) => {
        await expect(page.getByText('Admin Panel')).not.toBeVisible()
    })

    test('authenticated user visiting / is redirected to /dashboard', async ({ page }) => {
        await page.goto('/')
        await expect(page).toHaveURL('/dashboard')
    })

    test('authenticated user visiting /login is redirected to /dashboard', async ({ page }) => {
        await page.goto('/login')
        await expect(page).toHaveURL('/dashboard')
    })

    test('authenticated user visiting /signup is redirected to /dashboard', async ({ page }) => {
        await page.goto('/signup')
        await expect(page).toHaveURL('/dashboard')
    })
})

test.describe('Continue Building strip', () => {
    test('shows Continue Building link when lessons exist', async ({ page }) => {
        await page.goto('/dashboard')
        await page.waitForLoadState('networkidle')

        const hasContinue = await page.getByText('Continue Building').isVisible().catch(() => false)
        const hasEmpty = await page.getByText(/no modules available yet/i).isVisible().catch(() => false)

        if (!hasEmpty) {
            expect(hasContinue).toBe(true)
        }
    })

    test('Continue Building link navigates to a lesson', async ({ page }) => {
        await page.goto('/dashboard')
        await page.waitForLoadState('networkidle')

        const hasContinue = await page.getByText('Continue Building').isVisible().catch(() => false)
        if (!hasContinue) return test.skip()

        const lessonCard = page.locator('a[href^="/lessons/"]').first()
        await lessonCard.click()
        // Give Next.js time to complete server-side rendering of the lesson
        await expect(page).toHaveURL(/\/lessons\//, { timeout: 15_000 })
    })
})
