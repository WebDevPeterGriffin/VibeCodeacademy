import Link from 'next/link'

interface LessonCardProps {
    title: string
    slug: string
    description: string
    moduleTitle?: string
    orderIndex: number
    isFree: boolean
    isLocked: boolean
    isCompleted?: boolean
}

export default function LessonCard({
    title,
    slug,
    description,
    moduleTitle,
    orderIndex,
    isFree,
    isLocked,
    isCompleted = false,
}: LessonCardProps) {
    const cardContent = (
        <div className={`glow-card group relative overflow-hidden ${isLocked ? 'opacity-60' : ''}`}>
            <div className="p-5">
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-600">
                            {String(orderIndex).padStart(2, '0')}
                        </span>
                        {moduleTitle && (
                            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-600">
                                {moduleTitle}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isCompleted && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                        )}
                        {isLocked && (
                            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                            </svg>
                        )}
                        {isFree && !isLocked && (
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                                Free
                            </span>
                        )}
                    </div>
                </div>
                <h4 className="mb-1.5 text-sm font-semibold text-white group-hover:text-primary-200 transition-colors">
                    {title}
                </h4>
                <p className="text-xs leading-relaxed text-gray-500 line-clamp-2">
                    {description}
                </p>
                {isLocked && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        Upgrade to access
                    </div>
                )}
            </div>
        </div>
    )

    if (isLocked) {
        return cardContent
    }

    return (
        <Link href={`/lessons/${slug}`}>
            {cardContent}
        </Link>
    )
}
