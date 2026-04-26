import Link from 'next/link'

interface ModuleCardProps {
    title: string
    description: string
    lessonCount: number
    completedCount: number
    isFree: boolean
    isLocked: boolean
    orderIndex: number
    firstIncompleteSlug?: string
}

export default function ModuleCard({
    title,
    lessonCount,
    completedCount,
    isFree,
    isLocked,
    orderIndex,
    firstIncompleteSlug,
}: ModuleCardProps) {
    const progress = lessonCount > 0 ? (completedCount / lessonCount) * 100 : 0

    return (
        <Link
            href={isLocked ? '#' : firstIncompleteSlug ? `/lessons/${firstIncompleteSlug}` : '#'}
            className={`group flex flex-col rounded-none border border-dark-400 bg-dark-100 p-4 shadow-sm transition-colors ${isLocked ? 'cursor-not-allowed opacity-60' : 'hover:border-primary/50'
                }`}
        >
            <div className="mb-3 flex items-center justify-between border-b border-dark-400/50 pb-2">
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">
                    {String(orderIndex).padStart(2, '0')}_MODULE
                </span>
                <div className="flex items-center gap-1.5">
                    {isLocked ? (
                        <span className="font-mono text-[10px] uppercase text-gray-500">
                            Locked
                        </span>
                    ) : completedCount === lessonCount && lessonCount > 0 ? (
                        <span className="font-mono text-[10px] uppercase text-emerald-400">
                            Done
                        </span>
                    ) : (
                        <span className="font-mono text-[10px] uppercase text-primary-300">
                            {isFree ? 'Free' : 'Pro'}
                        </span>
                    )}
                </div>
            </div>

            <h3 className="mb-2 text-sm font-bold text-white group-hover:text-primary-300 transition-colors uppercase tracking-wide">
                {title}
            </h3>

            <div className="flex-1"></div>

            {/* Folder-like tab/progress footer */}
            <div className="mt-3 flex items-center justify-between pt-2">
                <div className="font-mono text-[10px] uppercase text-gray-500">
                    {completedCount}/{lessonCount} Built
                </div>
                {!isLocked && lessonCount > 0 && (
                    <div className="w-16 h-1 bg-dark-300 overflow-hidden">
                        <div
                            className={`h-full ${completedCount === lessonCount ? 'bg-emerald-400' : 'bg-primary'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>
        </Link>
    )
}
