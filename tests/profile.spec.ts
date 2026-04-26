/**
 * Profile page tests — run as authenticated regular user.
 */
import { test, expect } from '@playwright/test'

test.describe('Profile page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard/profile')
    })

    test('shows PROFILE heading', async ({ page }) => {
        await expect(page.getByText('PROFILE')).toBeVisible()
    })

    test('shows account info section with email', async ({ page }) => {
        await expect(page.getByText('Account Info')).toBeVisible()
        await expect(page.getByText(/Email/i).first()).toBeVisible()
        // The user's email should be shown — check it's not empty
        const emailRow = page.getByText('@').first()
        await expect(emailRow).toBeVisible()
    })

    test('shows Member Since date', async ({ page }) => {
        await expect(page.getByText('Member Since')).toBeVisible()
    })

    test('shows Update Password form', async ({ page }) => {
        // Use the section label paragraph (not the button which also says "Update Password")
        await expect(page.getByText('Update Password').first()).toBeVisible()
        await expect(page.getByPlaceholder(/min. 8 characters/i)).toBeVisible()
        await expect(page.getByPlaceholder(/repeat new password/i)).toBeVisible()
    })

    test('Update Password button is disabled when fields are empty', async ({ page }) => {
        const btn = page.getByRole('button', { name: /update password/i })
        await expect(btn).toBeDisabled()
    })

    test('shows error when passwords are too short', async ({ page }) => {
        await page.getByPlaceholder(/min. 8 characters/i).fill('short')
        await page.getByPlaceholder(/repeat new password/i).fill('short')
        await page.getByRole('button', { name: /update password/i }).click()
        await expect(page.getByText(/at least 8 characters/i)).toBeVisible()
    })

    test('shows error when passwords do not match', async ({ page }) => {
        await page.getByPlaceholder(/min. 8 characters/i).fill('password123')
        await page.getByPlaceholder(/repeat new password/i).fill('password456')
        await page.getByRole('button', { name: /update password/i }).click()
        await expect(page.getByText(/passwords do not match/i)).toBeVisible()
    })

    test('Profile Settings link in nav dropdown opens profile page', async ({ page }) => {
        // Navigate away first
        await page.goto('/dashboard')
        await page.getByRole('button', { name: /profile menu/i }).click()
        await page.getByRole('link', { name: /profile settings/i }).click()
        await expect(page).toHaveURL('/dashboard/profile')
        await expect(page.getByText('PROFILE')).toBeVisible()
    })
})
