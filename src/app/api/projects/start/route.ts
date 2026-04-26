import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { projectId } = body
    if (!projectId) {
        return NextResponse.json({ error: 'projectId required' }, { status: 400 })
    }

    // Upsert — if they already started it, just return success
    const { error } = await supabase
        .from('user_projects')
        .upsert(
            { user_id: user.id, project_id: projectId },
            { onConflict: 'user_id,project_id', ignoreDuplicates: true }
        )

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
}
