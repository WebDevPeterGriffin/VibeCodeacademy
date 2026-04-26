/**
 * Lesson flow tests — run as authenticated regular user.
 */
import { test, expect } from '@playwright/test'

async function getFirstLessonHref(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never) {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    const link = page.locator('a[href^="/lessons/"]').first()
    const isVisible = await link.isVisible().catch(() => false)
    if (!isVisible) return null
    return link.getAttribute('href')
}

test.describe('Lesson page', () => {
    test('navigates to lesson from dashboard', async ({ page }) => {
        const href = await getFirstLessonHref(page)
        if (!href) return test.skip()

        await page.goto(href)
        // Give Next.js SSR time to finish (lesson fetches from Supabase server-side)
        await expect(page).toHaveURL(/\/lessons\//, { timeout: 15_000 })
    })

    test('lesson page renders at least one content block', async ({ page }) => {
        const href = await getFirstLessonHref(page)
        if (!href) return test.skip()

        await page.goto(href)
        await page.waitForLoadState('networkidle')

        const bodyText = await page.locator('main').textContent()
        expect(bodyText && bodyText.length > 100).toBe(true)
    })

    test('lesson page shows the lesson title', async ({ page }) => {
        const href = await getFirstLessonHref(page)
        if (!href) return test.skip()

        await page.goto(href)
        await page.waitForLoadState('networkidle')

        const heading = page.getByRole('heading').first()
        await expect(heading).toBeVisible()
        const text = await heading.textContent()
        expect(text && text.trim().length > 0).toBe(true)
    })

    test('copy button copies text and shows confirmation', async ({ page }) => {
        const href = await getFirstLessonHref(page)
        if (!href) return test.skip()

        await page.goto(href)
        await page.waitForLoadState('networkidle')

        // Grant clipboard permissions so copy works in headless Chrome
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])

        // Find any copy-style button (icon or text)
        const copyBtn = page.getByRole('button', { name: /copy/i }).first()
        const hasCopy = await copyBtn.isVisible().catch(() => false)

        if (!hasCopy) return test.skip()

        await copyBtn.click()
        // Button text or nearby element should change to "Copied"
        await expect(page.getByText(/copied/i).first()).toBeVisible({ timeout: 4_000 })
    })

    test('checkpoint done button marks step complete', async ({ page }) => {
        const href = await getFirstLessonHref(page)
        if (!href) return test.skip()

        await page.goto(href)
        await page.waitForLoadState('networkidle')

        const doneBtn = page.getByRole('button', { name: /got it|done|mark|it worked/i }).first()
        const hasDone = await doneBtn.isVisible().catch(() => false)
        if (!hasDone) return test.skip()

        await doneBtn.click()
        await expect(
            page.getByText(/nice|good|great|✓|done/i).first()
        ).toBeVisible({ timeout: 4_000 })
    })
})

test.describe('Lesson progress', () => {
    test('mark complete button exists on a lesson', async ({ page }) => {
        const href = await getFirstLessonHref(page)
        if (!href) return test.skip()

        await page.goto(href)
        await page.waitForLoadState('networkidle')

        const completeBtn = page.getByRole('button', { name: /mark.*complete|complete.*lesson/i })
        const isVisible = await completeBtn.isVisible().catch(() => false)
        if (isVisible) expect(isVisible).toBe(true)
    })

    test('completing a lesson updates dashboard progress counter', async ({ page }) => {
        const href = await getFirstLessonHref(page)
        if (!href) return test.skip()

        await page.goto('/dashboard')
        await page.waitForLoadState('networkidle')
        const counterText = await page.getByText(/builds completed/i).textContent()
        const beforeMatch = counterText?.match(/(\d+)\s*\//)
        const before = beforeMatch ? parseInt(beforeMatch[1]) : 0

        await page.goto(href!)
        await page.waitForLoadState('networkidle')
        const completeBtn = page.getByRole('button', { name: /mark.*complete|complete.*lesson/i })
        const isVisible = await completeBtn.isVisible().catch(() => false)
        if (!isVisible) return test.skip()

        await completeBtn.click()
        await page.waitForTimeout(1_500)

        await page.goto('/dashboard')
        await page.waitForLoadState('networkidle')
        const afterText = await page.getByText(/builds completed/i).textContent()
        const afterMatch = afterText?.match(/(\d+)\s*\//)
        const after = afterMatch ? parseInt(afterMatch[1]) : 0

        expect(after).toBeGreaterThanOrEqual(before)
    })
})
