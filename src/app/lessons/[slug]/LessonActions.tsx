'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface LessonActionsProps {
    lessonId: string
    isCompleted: boolean
    isLoggedIn: boolean
    prevSlug?: string
    nextSlug?: string
}

export default function LessonActions({
    lessonId,
    isCompleted,
    isLoggedIn,
    prevSlug,
    nextSlug,
}: LessonActionsProps) {
    const [completed, setCompleted] = useState(isCompleted)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleToggleComplete = async () => {
        if (!isLoggedIn) {
            router.push('/login')
            return
        }

        setLoading(true)
        try {
            if (completed) {
                await fetch('/api/progress', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lesson_id: lessonId }),
                })
                setCompleted(false)
            } else {
                await fetch('/api/progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lesson_id: lessonId }),
                })
                setCompleted(true)
            }
            router.refresh()
        } catch (err) {
            console.error('Failed to update progress:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-between rounded-xl border border-dark-400 bg-dark-100 p-4">
            {/* Previous */}
            <div>
                {prevSlug ? (
                    <Link
                        href={`/lessons/${prevSlug}`}
                        className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Previous
                    </Link>
                ) : (
                    <div />
                )}
            </div>

            {/* Mark Complete */}
            <button
                onClick={handleToggleComplete}
                disabled={loading}
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-50 ${completed
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-primary text-white hover:bg-primary-600 hover:shadow-glow'
                    }`}
            >
                {loading ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                ) : completed ? (
                    <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Completed
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Mark Complete
                    </>
                )}
            </button>

            {/* Next */}
            <div>
                {nextSlug ? (
                    <Link
                        href={`/lessons/${nextSlug}`}
                        className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
                    >
                        Next
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                ) : (
                    <div />
                )}
            </div>
        </div>
    )
}
