import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import AdminPanel from './AdminPanel'
import AdminUsers, { type UserStat, type LessonStat } from './AdminUsers'
import AdminLessons, { type LessonRow } from './AdminLessons'

const ADMIN_EMAIL = 'webdevpetergriffin@gmail.com'

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
    return (
        <div className="border border-dark-400 bg-dark-100 p-5">
            <p className="font-display text-4xl text-white leading-none">{value}</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-gray-600">{label}</p>
            {sub && <p className="mt-1 font-mono text-[10px] text-primary-300/70">{sub}</p>}
        </div>
    )
}

export default async function AdminPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    if (user.email !== ADMIN_EMAIL) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <span className="font-mono text-4xl text-dark-400 mb-4">⛔</span>
                <h1 className="font-display text-3xl text-white tracking-wide">Access Denied</h1>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-gray-600">
                    This page is restricted to admin only
                </p>
            </div>
        )
    }

    // Fetch content stats (anon client)
    const { count: moduleCount } = await supabase
        .from('modules')
        .select('id', { count: 'exact', head: true })

    const { count: lessonCount } = await supabase
        .from('lessons')
        .select('id', { count: 'exact', head: true })

    // Fetch user + progress + lesson data (service role)
    let userStats: UserStat[] = []
    let lessonStats: LessonStat[] = []
    let lessonRows: LessonRow[] = []
    let totalUsers = 0
    let totalCompletions = 0
    let hasAdminKey = false

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (serviceKey) {
        hasAdminKey = true
        const admin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceKey
        )

        // All auth users (excluding admin accounts)
        const { data: authData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
        const authUsers = (authData?.users ?? []).filter(u => u.email !== ADMIN_EMAIL)
        totalUsers = authUsers.length

        // All progress records joined with lesson title
        const { data: progressRows } = await admin
            .from('user_progress')
            .select('user_id, lesson_id, completed_at, lessons(id, title, slug)')
            .order('completed_at', { ascending: false })

        totalCompletions = (progressRows ?? []).length

        // All lessons for the completion leaderboard
        const { data: allLessons } = await admin
            .from('lessons')
            .select('id, title, slug')

        // Build per-user stats
        userStats = authUsers.map(u => ({
            id: u.id,
            email: u.email ?? '(no email)',
            joinedAt: u.created_at,
            lastActiveAt: u.last_sign_in_at ?? null,
            completedLessons: (progressRows ?? [])
                .filter(p => p.user_id === u.id)
                .map(p => ({
                    lessonId: p.lesson_id,
                    lessonTitle: (p.lessons as unknown as { title: string } | null)?.title ?? 'Deleted lesson',
                    completedAt: p.completed_at,
                })),
        }))

        // Build per-lesson stats
        lessonStats = (allLessons ?? []).map(l => ({
            id: l.id,
            title: l.title,
            slug: l.slug,
            completionCount: (progressRows ?? []).filter(p => p.lesson_id === l.id).length,
        }))

        // Build lesson rows for the lesson manager (with module info)
        const { data: lessonsWithModules } = await admin
            .from('lessons')
            .select('id, title, slug, description, order_index, is_free, blocks, module_id, modules(id, title)')
            .order('order_index', { ascending: true })

        lessonRows = (lessonsWithModules ?? []).map(l => ({
            id: l.id,
            title: l.title,
            slug: l.slug,
            description: l.description,
            order_index: l.order_index,
            is_free: l.is_free,
            blocks: l.blocks,
            moduleId: l.module_id,
            moduleTitle: (l.modules as unknown as { id: string; title: string } | null)?.title ?? 'Unknown Module',
        }))
    }

    // Most recently joined user (for the stat card sub-label)
    const newestUser = userStats.length > 0
        ? userStats.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())[0]
        : null
    const newestJoined = newestUser
        ? new Date(newestUser.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : null

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-8 border-b border-dark-400 pb-8">
                <span className="font-mono text-[10px] uppercase tracking-widest text-primary-300">
                    Super Admin
                </span>
                <h1 className="mt-1 font-display text-5xl text-white tracking-wide leading-none">
                    ADMIN DASHBOARD
                </h1>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-gray-600">
                    {ADMIN_EMAIL}
                </p>
            </div>

            {/* Stats grid */}
            {hasAdminKey ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                    <StatCard
                        label="Total Users"
                        value={totalUsers}
                        sub={newestJoined ? `Latest: ${newestJoined}` : undefined}
                    />
                    <StatCard
                        label="Completions"
                        value={totalCompletions}
                        sub={totalUsers > 0 ? `${Math.round(totalCompletions / totalUsers * 10) / 10} avg/user` : undefined}
                    />
                    <StatCard label="Modules" value={moduleCount ?? 0} />
                    <StatCard label="Lessons" value={lessonCount ?? 0} />
                </div>
            ) : (
                <div className="mb-10 border border-amber-500/20 bg-amber-500/5 px-5 py-4">
                    <p className="font-mono text-[11px] text-amber-400">
                        Add <code className="bg-dark-300 px-1">SUPABASE_SERVICE_ROLE_KEY</code> to .env.local to see user analytics
                    </p>
                </div>
            )}

            {/* User + lesson analytics */}
            {hasAdminKey && (
                <AdminUsers
                    userStats={userStats}
                    lessonStats={lessonStats}
                    totalLessons={lessonCount ?? 0}
                />
            )}

            {/* Content Management divider */}
            <div className="border-t border-dark-400 pt-8 mb-8">
                <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600">
                    Content Management
                </p>
            </div>

            {/* Lesson Manager */}
            {hasAdminKey && lessonRows.length > 0 && (
                <div className="mb-10">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-4">
                        Lesson Manager — {lessonRows.length} lesson{lessonRows.length !== 1 ? 's' : ''}
                    </p>
                    <AdminLessons lessons={lessonRows} />
                </div>
            )}

            {/* Upload / Clear */}
            <AdminPanel moduleCount={moduleCount ?? 0} lessonCount={lessonCount ?? 0} />
        </div>
    )
}
