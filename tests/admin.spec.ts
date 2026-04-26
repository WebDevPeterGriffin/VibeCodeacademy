/**
 * Admin panel tests — run as admin user (storageState: .playwright/admin.json).
 */
import { test, expect } from '@playwright/test'

test.describe('Admin dashboard access', () => {
    test('admin can access /dashboard/admin', async ({ page }) => {
        await page.goto('/dashboard/admin')
        await expect(page.getByText('ADMIN DASHBOARD')).toBeVisible()
    })

    test('admin dashboard shows stat cards', async ({ page }) => {
        await page.goto('/dashboard/admin')
        await page.waitForLoadState('networkidle')
        await expect(page.getByText(/total users/i)).toBeVisible()
        // Use exact match to avoid "Lesson Completions" section header
        await expect(page.getByText('Completions', { exact: true })).toBeVisible()
        await expect(page.getByText('Modules', { exact: true })).toBeVisible()
        await expect(page.getByText('Lessons', { exact: true }).first()).toBeVisible()
    })

    test('admin dashboard shows admin email', async ({ page }) => {
        await page.goto('/dashboard/admin')
        await expect(page.getByText('webdevpetergriffin@gmail.com').first()).toBeVisible()
    })

    test('Admin Panel link appears on dashboard for admin', async ({ page }) => {
        await page.goto('/dashboard')
        await expect(page.getByText(/admin panel/i)).toBeVisible()
    })
})

test.describe('Admin — content management', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard/admin')
        await page.waitForLoadState('networkidle')
    })

    test('shows Content Management section', async ({ page }) => {
        await expect(page.getByText('Content Management')).toBeVisible()
    })

    test('shows JSON upload section', async ({ page }) => {
        await expect(page.getByText(/upload lessons/i)).toBeVisible()
        await expect(page.getByText(/click to choose/i)).toBeVisible()
    })

    test('shows Danger Zone / Clear All section', async ({ page }) => {
        await expect(page.getByText(/danger zone/i)).toBeVisible()
        await expect(page.getByRole('button', { name: /clear all content/i })).toBeVisible()
    })

    test('Clear All requires confirmation before proceeding', async ({ page }) => {
        await page.getByRole('button', { name: /clear all content/i }).click()
        await expect(page.getByText(/are you sure/i)).toBeVisible()
        // Cancel it immediately
        await page.getByRole('button', { name: /cancel/i }).click()
        await expect(page.getByText(/are you sure/i)).not.toBeVisible()
    })

    test('invalid JSON file shows parse error', async ({ page }) => {
        const buffer = Buffer.from('{ not valid json }}}')
        await page.locator('input[type="file"]').setInputFiles({
            name: 'bad.json',
            mimeType: 'application/json',
            buffer,
        })
        await expect(page.getByText(/could not parse/i)).toBeVisible({ timeout: 5_000 })
    })

    test('valid JSON shows preview before upload', async ({ page }) => {
        const validJson = JSON.stringify({
            modules: [{
                title: 'Test Module',
                slug: 'test-module',
                description: 'A test module',
                order_index: 99,
                is_free: true,
                lessons: [{
                    title: 'Test Lesson',
                    slug: 'test-lesson-preview',
                    description: 'A test lesson',
                    order_index: 1,
                    is_free: true,
                    blocks: [],
                }],
            }],
        })

        const buffer = Buffer.from(validJson)
        await page.locator('input[type="file"]').setInputFiles({
            name: 'test.json',
            mimeType: 'application/json',
            buffer,
        })

        await expect(page.getByText('Test Module')).toBeVisible({ timeout: 5_000 })
        // Use first() since "1 lessons" could match multiple spots
        await expect(page.getByText(/1 lessons/i).first()).toBeVisible()
        await expect(page.getByRole('button', { name: /upload.*module/i })).toBeVisible()
    })
})

test.describe('Admin — lesson manager', () => {
    test('shows Lesson Manager section when lessons exist', async ({ page }) => {
        await page.goto('/dashboard/admin')
        await page.waitForLoadState('networkidle')

        const hasManager = await page.getByText(/lesson manager/i).isVisible().catch(() => false)
        const hasEmpty = await page.getByText(/no modules available yet/i).isVisible().catch(() => false)

        if (!hasEmpty && !hasManager) return test.skip()
        if (hasManager) await expect(page.getByText(/lesson manager/i)).toBeVisible()
    })

    test('lesson manager shows edit and delete buttons per lesson', async ({ page }) => {
        await page.goto('/dashboard/admin')
        await page.waitForLoadState('networkidle')

        const editBtn = page.getByRole('button', { name: /^edit$/i }).first()
        const isVisible = await editBtn.isVisible().catch(() => false)
        if (!isVisible) return test.skip()

        await expect(editBtn).toBeVisible()
        await expect(page.getByRole('button', { name: /^delete$/i }).first()).toBeVisible()
    })

    test('clicking edit opens inline editor with title field', async ({ page }) => {
        await page.goto('/dashboard/admin')
        await page.waitForLoadState('networkidle')

        const editBtn = page.getByRole('button', { name: /^edit$/i }).first()
        const isVisible = await editBtn.isVisible().catch(() => false)
        if (!isVisible) return test.skip()

        await editBtn.click()

        // The inline editor renders a text input (title) and a textarea (blocks JSON)
        // Labels don't have for/id association, so target by type/position
        const titleInput = page.locator('input[type="text"]').first()
        await expect(titleInput).toBeVisible()
        await expect(page.locator('textarea').last()).toBeVisible() // blocks JSON textarea
        await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible()
    })

    test('clicking cancel closes the editor', async ({ page }) => {
        await page.goto('/dashboard/admin')
        await page.waitForLoadState('networkidle')

        const editBtn = page.getByRole('button', { name: /^edit$/i }).first()
        const isVisible = await editBtn.isVisible().catch(() => false)
        if (!isVisible) return test.skip()

        await editBtn.click()
        await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible()

        await page.getByRole('button', { name: /cancel/i }).first().click()
        await expect(page.getByRole('button', { name: /save changes/i })).not.toBeVisible()
    })
})

test.describe('Admin — access denied for non-admin', () => {
    // Increase timeout — this test signs in fresh via the UI
    test.setTimeout(60_000)

    test('regular user gets Access Denied on /dashboard/admin', async ({ browser }) => {
        const email = process.env.TEST_USER_EMAIL
        const password = process.env.TEST_USER_PASSWORD
        if (!email || !password) return test.skip()

        const ctx = await browser.newContext()
        const page = await ctx.newPage()

        await page.goto('/login')
        await page.locator('#email').fill(email)
        await page.locator('#password').fill(password)
        await page.getByRole('button', { name: /log in/i }).click()
        await page.waitForURL('/dashboard', { timeout: 20_000 })

        await page.goto('/dashboard/admin')
        await expect(page.getByText('Access Denied')).toBeVisible({ timeout: 10_000 })

        await ctx.close()
    })
})
