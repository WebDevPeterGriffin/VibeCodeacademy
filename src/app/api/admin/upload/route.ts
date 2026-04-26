import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'webdevpetergriffin@gmail.com'

function makeAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in env')
    return createClient(url, key)
}

type LessonInput = {
    title: string
    slug: string
    description?: string
    order_index?: number
    is_free?: boolean
    content?: string
    download_url?: string
    blocks?: unknown[]
}

type ModuleInput = {
    title: string
    slug: string
    description?: string
    order_index?: number
    is_free?: boolean
    lessons?: LessonInput[]
}

export async function POST(req: NextRequest) {
    // ── 1. Auth check ──────────────────────────────────────────────────────
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email !== ADMIN_EMAIL) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ── 2. Check service role key ──────────────────────────────────────────
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json(
            { error: 'SUPABASE_SERVICE_ROLE_KEY is not set in .env.local — restart your dev server after adding it.' },
            { status: 500 }
        )
    }

    // ── 3. Parse body ──────────────────────────────────────────────────────
    let payload: unknown
    try {
        payload = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // ── 4. Validate shape ──────────────────────────────────────────────────
    if (
        typeof payload !== 'object' ||
        payload === null ||
        !Array.isArray((payload as Record<string, unknown>).modules)
    ) {
        return NextResponse.json(
            { error: 'JSON must have a top-level "modules" array. Got: ' + JSON.stringify(Object.keys(payload as object)) },
            { status: 400 }
        )
    }

    const { modules } = payload as { modules: ModuleInput[] }

    for (const mod of modules) {
        if (!mod.title || !mod.slug) {
            return NextResponse.json(
                { error: `Each module needs "title" and "slug". Got: ${JSON.stringify(mod)}` },
                { status: 400 }
            )
        }
    }

    // ── 5. Write to DB ─────────────────────────────────────────────────────
    // Uses select-then-insert/update to avoid needing unique constraints on slug
    const admin = makeAdminClient()
    let insertedModules = 0
    let insertedLessons = 0

    for (const mod of modules) {
        // Find existing module by slug
        const { data: existing } = await admin
            .from('modules')
            .select('id')
            .eq('slug', mod.slug)
            .maybeSingle()

        let moduleId: string

        if (existing?.id) {
            // Update existing module
            const { error } = await admin
                .from('modules')
                .update({
                    title: mod.title,
                    description: mod.description ?? '',
                    order_index: mod.order_index ?? 0,
                    is_free: mod.is_free ?? false,
                })
                .eq('id', existing.id)

            if (error) {
                return NextResponse.json({ error: `Failed to update module "${mod.slug}": ${error.message}` }, { status: 500 })
            }
            moduleId = existing.id
        } else {
            // Insert new module
            const { data, error } = await admin
                .from('modules')
                .insert({
                    title: mod.title,
                    slug: mod.slug,
                    description: mod.description ?? '',
                    order_index: mod.order_index ?? 0,
                    is_free: mod.is_free ?? false,
                })
                .select('id')
                .single()

            if (error || !data) {
                return NextResponse.json({ error: `Failed to insert module "${mod.slug}": ${error?.message}` }, { status: 500 })
            }
            moduleId = data.id
        }

        insertedModules++

        // Process lessons
        for (const lesson of mod.lessons ?? []) {
            if (!lesson.title || !lesson.slug) continue

            const { data: existingLesson } = await admin
                .from('lessons')
                .select('id')
                .eq('slug', lesson.slug)
                .maybeSingle()

            if (existingLesson?.id) {
                // Update existing lesson
                const { error } = await admin
                    .from('lessons')
                    .update({
                        module_id: moduleId,
                        title: lesson.title,
                        description: lesson.description ?? '',
                        order_index: lesson.order_index ?? 0,
                        is_free: lesson.is_free ?? false,
                        content: lesson.content ?? '',
                        download_url: lesson.download_url ?? null,
                        blocks: lesson.blocks?.length ? lesson.blocks : null,
                    })
                    .eq('id', existingLesson.id)

                if (error) {
                    return NextResponse.json({ error: `Failed to update lesson "${lesson.slug}": ${error.message}` }, { status: 500 })
                }
            } else {
                // Insert new lesson
                const { error } = await admin
                    .from('lessons')
                    .insert({
                        module_id: moduleId,
                        title: lesson.title,
                        slug: lesson.slug,
                        description: lesson.description ?? '',
                        order_index: lesson.order_index ?? 0,
                        is_free: lesson.is_free ?? false,
                        content: lesson.content ?? '',
                        download_url: lesson.download_url ?? null,
                        blocks: lesson.blocks?.length ? lesson.blocks : null,
                    })

                if (error) {
                    return NextResponse.json({ error: `Failed to insert lesson "${lesson.slug}": ${error.message}` }, { status: 500 })
                }
            }

            insertedLessons++
        }
    }

    return NextResponse.json({ inserted: { modules: insertedModules, lessons: insertedLessons } })
}
