import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'webdevpetergriffin@gmail.com'

function makeAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

async function getVerifiedAdmin() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) return null
    return user
}

// PATCH — update a specific lesson
export async function PATCH(request: Request) {
    const user = await getVerifiedAdmin()
    if (!user) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, title, description, is_free, blocks } = body

    if (!id) {
        return NextResponse.json({ error: 'Missing lesson id' }, { status: 400 })
    }

    const admin = makeAdminClient()
    const { error } = await admin
        .from('lessons')
        .update({ title, description, is_free, blocks })
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ updated: true })
}

// DELETE — delete a specific lesson
export async function DELETE(request: Request) {
    const user = await getVerifiedAdmin()
    if (!user) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
        return NextResponse.json({ error: 'Missing lesson id' }, { status: 400 })
    }

    const admin = makeAdminClient()

    // Delete progress records for this lesson first
    await admin.from('user_progress').delete().eq('lesson_id', id)

    // Delete the lesson
    const { error } = await admin.from('lessons').delete().eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ deleted: true })
}
