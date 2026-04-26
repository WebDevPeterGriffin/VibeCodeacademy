import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import DashboardTimeline from './DashboardTimeline'

export default async function DashboardPage() {
    interface Module {
        id: string;
        title: string;
        slug: string;
        description: string;
        order_index: number;
        is_free: boolean;
        lessons: Lesson[];
    }

    interface Lesson {
        id: string;
        title: string;
        slug: string;
        order_index: number;
        is_free: boolean;
        description: string;
    }

    interface Progress {
        lesson_id: string;
    }

    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { data: modules } = await supabase
        .from('modules')
        .select('*, lessons(*)')
        .order('order_index')

    const { data: progress } = user
        ? await supabase
            .from('user_progress')
            .select('lesson_id')
            .eq('user_id', user.id)
        : { data: [] }

    const completedLessonIds = (progress || []).map((p: Progress) => p.lesson_id)
    const completedSet = new Set(completedLessonIds)

    const totalLessons =
        modules?.reduce((sum: number, m: Module) => sum + (m.lessons?.length || 0), 0) || 0
    const completedLessons = completedSet.size

    // Find next lesson across all modules
    let nextLesson: (Lesson & { moduleTitle: string; moduleSlug: string }) | null = null
    if (modules) {
        outer: for (const mod of modules) {
            const sorted = [...(mod.lessons || [])].sort(
                (a: Lesson, b: Lesson) => a.order_index - b.order_index
            )
            for (const lesson of sorted) {
                if (!completedSet.has(lesson.id) && (lesson.is_free || mod.is_free || user)) {
                    nextLesson = { ...lesson, moduleTitle: mod.title, moduleSlug: mod.slug }
                    break outer
                }
            }
        }
    }

    const isAdmin = user?.email === 'webdevpetergriffin@gmail.com'

    return (
        <div className="animate-fade-in">
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="mb-8 border-b border-dark-400 pb-8">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="font-display text-5xl text-white tracking-wide leading-none">
                            MY WORKSPACE
                        </h1>
                        <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-gray-600">
                            {completedLessons} / {totalLessons} Builds Completed
                        </p>
                        {isAdmin && (
                            <Link
                                href="/dashboard/admin"
                                className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-primary-300/70 hover:text-primary-300 transition-colors"
                            >
                                ⚙ Admin Panel →
                            </Link>
                        )}
                    </div>

                    {/* Overall progress bar */}
                    <div className="sm:w-48">
                        <div className="h-px w-full bg-dark-400 overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-700"
                                style={{ width: totalLessons > 0 ? `${(completedLessons / totalLessons) * 100}%` : '0%' }}
                            />
                        </div>
                        <p className="mt-1.5 font-mono text-[10px] text-right text-gray-600 uppercase tracking-widest">
                            {totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}%
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Continue Building strip ──────────────────────── */}
            {nextLesson && (
                <div className="mb-8">
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-primary-300">
                        Continue Building
                    </p>
                    <Link href={`/lessons/${nextLesson.slug}`}>
                        <div className="group flex items-center justify-between border border-primary/30 bg-primary/5 p-5 hover:border-primary/60 hover:bg-primary/10 transition-colors">
                            <div>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
                                    {nextLesson.moduleTitle}
                                </span>
                                <h2 className="mt-1 font-display text-2xl text-white tracking-wide group-hover:text-primary-300 transition-colors">
                                    {nextLesson.title}
                                </h2>
                            </div>
                            <div className="ml-6 flex h-10 w-10 flex-shrink-0 items-center justify-center border border-primary/30 group-hover:border-primary/60 transition-colors">
                                <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* ── Module Timeline ──────────────────────────────── */}
            {modules && modules.length > 0 ? (
                <DashboardTimeline
                    modules={modules as Parameters<typeof DashboardTimeline>[0]['modules']}
                    completedLessonIds={completedLessonIds}
                    isLoggedIn={!!user}
                />
            ) : (
                <div className="border border-dashed border-dark-400 p-12 text-center">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-gray-600">
                        No modules available yet
                    </p>
                </div>
            )}
        </div>
    )
}
