/**
 * Auth flow tests — run with NO session (public project).
 * Covers: redirects, login, bad credentials, signup validation.
 */
import { test, expect } from '@playwright/test'

test.describe('Unauthenticated redirects', () => {
    test('visiting /dashboard redirects to /login', async ({ page }) => {
        await page.goto('/dashboard')
        await expect(page).toHaveURL('/login')
    })

    test('visiting /dashboard/scoreboard redirects to /login', async ({ page }) => {
        await page.goto('/dashboard/scoreboard')
        await expect(page).toHaveURL('/login')
    })

    test('visiting /dashboard/profile redirects to /login', async ({ page }) => {
        await page.goto('/dashboard/profile')
        await expect(page).toHaveURL('/login')
    })

    test('visiting /dashboard/admin redirects to /login', async ({ page }) => {
        await page.goto('/dashboard/admin')
        await expect(page).toHaveURL('/login')
    })
})

test.describe('Login page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login')
    })

    test('shows login form with email and password fields', async ({ page }) => {
        await expect(page.locator('#email')).toBeVisible()
        await expect(page.locator('#password')).toBeVisible()
        await expect(page.getByRole('button', { name: /log in/i })).toBeVisible()
    })

    test('shows error on wrong credentials', async ({ page }) => {
        await page.locator('#email').fill('notareal@email.com')
        await page.locator('#password').fill('wrongpassword123')
        await page.getByRole('button', { name: /log in/i }).click()

        // Supabase returns "Invalid login credentials" for bad creds
        await expect(page.getByText(/invalid login credentials/i)).toBeVisible({ timeout: 8_000 })
    })

    test('has link to signup page', async ({ page }) => {
        await page.getByRole('link', { name: /sign up/i }).click()
        await expect(page).toHaveURL('/signup')
    })
})

test.describe('Signup page', () => {
    test('shows signup form', async ({ page }) => {
        await page.goto('/signup')
        await expect(page.locator('#email')).toBeVisible()
        await expect(page.locator('#password')).toBeVisible()
    })

    test('has link back to login', async ({ page }) => {
        await page.goto('/signup')
        await page.getByRole('link', { name: /log in/i }).click()
        await expect(page).toHaveURL('/login')
    })
})
