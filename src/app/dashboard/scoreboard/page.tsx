import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

const ADMIN_EMAIL = 'webdevpetergriffin@gmail.com'

function maskEmail(email: string): string {
    const [local, domain] = email.split('@')
    if (!domain) return email
    const visible = local.slice(0, 2)
    return `${visible}***@${domain}`
}

type BoardEntry = {
    email: string
    completedCount: number
    rank: number
    isYou: boolean
}

export default async function ScoreboardPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { count: totalLessons } = await supabase
        .from('lessons')
        .select('id', { count: 'exact', head: true })

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    let board: BoardEntry[] = []

    if (serviceKey) {
        const admin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceKey
        )

        // Get all users (excluding admin)
        const { data: authData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
        const users = (authData?.users ?? []).filter(u => u.email !== ADMIN_EMAIL)

        // Get all progress
        const { data: progressRows } = await admin
            .from('user_progress')
            .select('user_id, lesson_id')

        // Build leaderboard
        const entries = users.map(u => ({
            email: u.email ?? '(no email)',
            completedCount: (progressRows ?? []).filter(p => p.user_id === u.id).length,
            isYou: u.id === user.id,
        }))

        entries.sort((a, b) => b.completedCount - a.completedCount)

        board = entries.map((e, i) => ({ ...e, rank: i + 1 }))
    } else {
        // Fallback: just show current user's progress
        const { count: myCount } = await supabase
            .from('user_progress')
            .select('lesson_id', { count: 'exact', head: true })
            .eq('user_id', user.id)

        board = [{
            email: user.email ?? '(no email)',
            completedCount: myCount ?? 0,
            rank: 1,
            isYou: true,
        }]
    }

    const myEntry = board.find(e => e.isYou)

    return (
        <div className="animate-fade-in max-w-2xl">
            {/* Header */}
            <div className="mb-8 border-b border-dark-400 pb-8">
                <span className="font-mono text-[10px] uppercase tracking-widest text-primary-300">
                    Community
                </span>
                <h1 className="mt-1 font-display text-5xl text-white tracking-wide leading-none">
                    SCOREBOARD
                </h1>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-gray-600">
                    {board.length} builder{board.length !== 1 ? 's' : ''} on the path
                </p>
            </div>

            {/* Your rank callout */}
            {myEntry && (
                <div className="mb-8 border border-primary/20 bg-primary/5 px-5 py-4 flex items-center justify-between">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-primary-300 mb-0.5">
                            Your Rank
                        </p>
                        <p className="font-display text-3xl text-white leading-none">
                            #{myEntry.rank}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-0.5">
                            Lessons Completed
                        </p>
                        <p className="font-display text-3xl text-white leading-none">
                            {myEntry.completedCount}
                            {totalLessons ? (
                                <span className="font-mono text-sm text-gray-600"> / {totalLessons}</span>
                            ) : null}
                        </p>
                    </div>
                </div>
            )}

            {/* Leaderboard */}
            {board.length === 0 ? (
                <div className="border border-dashed border-dark-400 p-8 text-center">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-gray-600">
                        No data yet
                    </p>
                </div>
            ) : (
                <div className="border border-dark-400 overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-[40px_1fr_auto] gap-4 px-4 py-2.5 bg-dark-200 border-b border-dark-400">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-gray-600">#</span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-gray-600">Builder</span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-gray-600 text-right">Lessons</span>
                    </div>

                    {board.map((entry, i) => {
                        const pct = totalLessons ? Math.round((entry.completedCount / totalLessons) * 100) : 0
                        return (
                            <div
                                key={entry.email}
                                className={`grid grid-cols-[40px_1fr_auto] gap-4 px-4 py-3 items-center ${i > 0 ? 'border-t border-dark-400/50' : ''} ${entry.isYou ? 'bg-primary/5' : ''}`}
                            >
                                {/* Rank */}
                                <span className={`font-display text-xl leading-none ${entry.rank <= 3 ? 'text-white' : 'text-dark-400'}`}>
                                    {entry.rank === 1 ? '①' : entry.rank === 2 ? '②' : entry.rank === 3 ? '③' : entry.rank}
                                </span>

                                {/* Email + progress bar */}
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`font-mono text-xs truncate ${entry.isYou ? 'text-primary-300' : 'text-gray-300'}`}>
                                            {entry.isYou ? user.email : maskEmail(entry.email)}
                                        </span>
                                        {entry.isYou && (
                                            <span className="font-mono text-[9px] uppercase tracking-widest text-primary-300 border border-primary/30 px-1.5 py-0.5 flex-shrink-0">
                                                You
                                            </span>
                                        )}
                                    </div>
                                    {totalLessons ? (
                                        <div className="h-px w-full max-w-[180px] bg-dark-400 overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : entry.isYou ? 'bg-primary' : 'bg-dark-300'}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    ) : null}
                                </div>

                                {/* Count */}
                                <div className="text-right">
                                    <span className={`font-mono text-xs ${entry.isYou ? 'text-primary-300' : 'text-gray-400'}`}>
                                        {entry.completedCount}
                                    </span>
                                    {totalLessons ? (
                                        <span className="font-mono text-[10px] text-gray-600"> / {totalLessons}</span>
                                    ) : null}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
