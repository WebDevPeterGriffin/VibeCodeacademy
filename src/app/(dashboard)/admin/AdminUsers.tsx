'use client'

import { useState } from 'react'

export type UserStat = {
    id: string
    email: string
    joinedAt: string
    lastActiveAt: string | null
    completedLessons: { lessonId: string; lessonTitle: string; completedAt: string }[]
}

export type LessonStat = {
    id: string
    title: string
    slug: string
    completionCount: number
}

function fmt(iso: string | null): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtTime(iso: string | null): string {
    if (!iso) return '—'
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return fmt(iso)
}

interface Props {
    userStats: UserStat[]
    lessonStats: LessonStat[]
    totalLessons: number
}

export default function AdminUsers({ userStats, lessonStats, totalLessons }: Props) {
    const [expandedUser, setExpandedUser] = useState<string | null>(null)

    const sorted = [...userStats].sort((a, b) => {
        // Most lessons completed first, then most recently joined
        if (b.completedLessons.length !== a.completedLessons.length) {
            return b.completedLessons.length - a.completedLessons.length
        }
        return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
    })

    return (
        <div className="space-y-8 mb-10">

            {/* ── User Activity ──────────────────────────────────────── */}
            <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-4">
                    User Activity — {userStats.length} accounts
                </p>

                {userStats.length === 0 ? (
                    <div className="border border-dashed border-dark-400 p-8 text-center">
                        <p className="font-mono text-[11px] uppercase tracking-widest text-gray-600">No users yet</p>
                    </div>
                ) : (
                    <div className="border border-dark-400 overflow-hidden">
                        {/* Table header */}
                        <div className="grid grid-cols-[1fr_auto_auto_160px] gap-4 px-4 py-2.5 bg-dark-200 border-b border-dark-400">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-600">Email</span>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-600 w-24 text-right">Joined</span>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-600 w-24 text-right">Last Active</span>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-600 text-right">Progress</span>
                        </div>

                        {sorted.map((u, i) => {
                            const pct = totalLessons > 0 ? Math.round((u.completedLessons.length / totalLessons) * 100) : 0
                            const isExpanded = expandedUser === u.id

                            return (
                                <div key={u.id}>
                                    {/* Row */}
                                    <button
                                        onClick={() => setExpandedUser(isExpanded ? null : u.id)}
                                        className={`w-full grid grid-cols-[1fr_auto_auto_160px] gap-4 px-4 py-3 text-left hover:bg-dark-200/50 transition-colors ${i > 0 ? 'border-t border-dark-400/50' : ''}`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className={`text-[8px] transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                                            <span className="font-mono text-xs text-gray-300 truncate">{u.email}</span>
                                        </div>
                                        <span className="font-mono text-[11px] text-gray-600 w-24 text-right self-center whitespace-nowrap">
                                            {fmt(u.joinedAt)}
                                        </span>
                                        <span className="font-mono text-[11px] text-gray-600 w-24 text-right self-center whitespace-nowrap">
                                            {fmtTime(u.lastActiveAt)}
                                        </span>
                                        <div className="flex flex-col gap-1 justify-center">
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-[10px] text-gray-600">
                                                    {u.completedLessons.length}/{totalLessons}
                                                </span>
                                                <span className={`font-mono text-[10px] ${pct === 100 ? 'text-emerald-400' : 'text-primary-300'}`}>
                                                    {pct}%
                                                </span>
                                            </div>
                                            <div className="h-px w-full bg-dark-400 overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    </button>

                                    {/* Expanded: completed lessons */}
                                    {isExpanded && (
                                        <div className="border-t border-dark-400/50 bg-dark-50/60 px-8 py-4">
                                            {u.completedLessons.length === 0 ? (
                                                <p className="font-mono text-[11px] text-gray-600">No lessons completed yet</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-3">
                                                        Completed Lessons
                                                    </p>
                                                    {u.completedLessons
                                                        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                                                        .map(l => (
                                                            <div key={l.lessonId} className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-emerald-500 text-xs">✓</span>
                                                                    <span className="font-mono text-[11px] text-gray-300">{l.lessonTitle}</span>
                                                                </div>
                                                                <span className="font-mono text-[10px] text-gray-600">
                                                                    {fmtTime(l.completedAt)}
                                                                </span>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* ── Lesson Completion Stats ────────────────────────────── */}
            {lessonStats.length > 0 && (
                <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-4">
                        Lesson Completions
                    </p>
                    <div className="border border-dark-400 overflow-hidden">
                        {lessonStats
                            .sort((a, b) => b.completionCount - a.completionCount)
                            .map((l, i) => {
                                const pct = userStats.length > 0 ? Math.round((l.completionCount / userStats.length) * 100) : 0
                                return (
                                    <div
                                        key={l.id}
                                        className={`flex items-center gap-4 px-4 py-3 ${i > 0 ? 'border-t border-dark-400/50' : ''}`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-mono text-xs text-gray-300 truncate">{l.title}</p>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <div className="w-32 h-px bg-dark-400 overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="font-mono text-[11px] text-gray-600 w-20 text-right">
                                                {l.completionCount} user{l.completionCount !== 1 ? 's' : ''} · {pct}%
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                    </div>
                </div>
            )}
        </div>
    )
}
