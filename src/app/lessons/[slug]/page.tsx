import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import LessonSession from './LessonSession'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import Navbar from '@/components/Navbar'

export default async function LessonPage({
    params,
}: {
    params: { slug: string }
}) {
    interface Lesson {
        id: string;
        title: string;
        slug: string;
        order_index: number;
        is_free: boolean;
        description?: string;
        download_url?: string;
        content?: string;
        module_id?: string;
        blocks?: unknown[];
        modules?: {
            title: string;
            is_free: boolean;
        };
    }

    interface Progress {
        lesson_id: string;
    }

    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { data: lesson } = await supabase
        .from('lessons')
        .select('*, modules:module_id(*)')
        .eq('slug', params.slug)
        .single()

    if (!lesson) {
        notFound()
    }

    const isAccessible = lesson.is_free || lesson.modules?.is_free

    if (!isAccessible && !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-dark px-4">
                <div className="max-w-md text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-primary/10 border border-primary/20">
                        <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                        </svg>
                    </div>
                    <h1 className="mb-2 font-display text-4xl text-white tracking-wide">
                        Premium Content
                    </h1>
                    <p className="mb-6 text-gray-500">
                        This lesson is part of the premium curriculum. Sign up or upgrade your plan to access all lessons.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link href="/signup" className="btn-primary">Start Building Free</Link>
                        <Link href="/login" className="btn-secondary">Log in</Link>
                    </div>
                </div>
            </div>
        )
    }

    const { data: moduleLessons } = await supabase
        .from('lessons')
        .select('id, title, slug, order_index, is_free')
        .eq('module_id', lesson.module_id)
        .order('order_index')

    const completedLessonIds = new Set<string>()
    if (user && moduleLessons) {
        const { data: progress } = await supabase
            .from('user_progress')
            .select('lesson_id')
            .eq('user_id', user.id)
            .in('lesson_id', moduleLessons.map((l) => l.id))

        progress?.forEach((p: Progress) => completedLessonIds.add(p.lesson_id))
    }

    const isCompleted = completedLessonIds.has(lesson.id)

    const sortedLessons = (moduleLessons || []).sort(
        (a: Lesson, b: Lesson) => a.order_index - b.order_index
    )
    const currentIndex = sortedLessons.findIndex((l: Lesson) => l.id === lesson.id)
    const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null
    const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null

    const hasBlocks = Array.isArray(lesson.blocks) && lesson.blocks.length > 0

    return (
        <div className="min-h-screen bg-dark pt-16">
            <Navbar />

            {hasBlocks ? (
                /* ── Live Build Session ─────────────────────────── */
                <LessonSession
                    key={lesson.id}
                    blocks={lesson.blocks as Parameters<typeof LessonSession>[0]['blocks']}
                    lessonTitle={lesson.title}
                    lessonDescription={lesson.description}
                    lessonIndex={lesson.order_index}
                    moduleTitle={lesson.modules?.title}
                    prevSlug={prevLesson?.slug}
                    nextSlug={nextLesson?.slug}
                    isCompleted={isCompleted}
                    lessonId={lesson.id}
                    isLoggedIn={!!user}
                />
            ) : (
                /* ── Markdown fallback ──────────────────────────── */
                <main className="mx-auto max-w-3xl px-6 py-12">
                    <div className="mb-8 border-l-4 border-primary pl-6">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-primary-300">
                            Lesson {String(lesson.order_index).padStart(2, '0')}
                        </span>
                        <h1 className="mt-2 font-display text-5xl text-white tracking-wide">
                            {lesson.title}
                        </h1>
                        <p className="mt-4 text-lg text-gray-400 leading-relaxed max-w-2xl">
                            {lesson.description}
                        </p>
                    </div>

                    {lesson.content ? (
                        <div className="border border-dark-400 bg-dark-100 p-6">
                            <MarkdownRenderer content={lesson.content} />
                        </div>
                    ) : (
                        <div className="border border-dashed border-dark-400 p-8 text-center">
                            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-600">
                                No content yet
                            </p>
                        </div>
                    )}
                </main>
            )}
        </div>
    )
}
