import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'webdevpetergriffin@gmail.com'

function makeAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in env')
    return createClient(url, key)
}

export async function DELETE() {
    // ── Auth check ────────────────────────────────────────────────────────
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email !== ADMIN_EMAIL) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = makeAdminClient()

    // Delete in dependency order: progress → lessons → modules
    const { error: progressErr } = await admin
        .from('user_progress')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // delete all rows

    if (progressErr) {
        return NextResponse.json({ error: `Failed to clear progress: ${progressErr.message}` }, { status: 500 })
    }

    const { error: lessonsErr } = await admin
        .from('lessons')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

    if (lessonsErr) {
        return NextResponse.json({ error: `Failed to clear lessons: ${lessonsErr.message}` }, { status: 500 })
    }

    const { error: modulesErr } = await admin
        .from('modules')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

    if (modulesErr) {
        return NextResponse.json({ error: `Failed to clear modules: ${modulesErr.message}` }, { status: 500 })
    }

    return NextResponse.json({ cleared: true })
}
