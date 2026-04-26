interface ProgressBarProps {
    progress: number
    label?: string
    size?: 'sm' | 'md' | 'lg'
    showPercentage?: boolean
}

export default function ProgressBar({
    progress,
    label,
    size = 'md',
    showPercentage = true,
}: ProgressBarProps) {
    const clampedProgress = Math.min(100, Math.max(0, progress))
    const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' }

    return (
        <div className="w-full">
            {(label || showPercentage) && (
                <div className="mb-2 flex items-center justify-between">
                    {label && (
                        <span className="text-xs font-medium text-gray-400">{label}</span>
                    )}
                    {showPercentage && (
                        <span className="font-mono text-xs font-semibold text-primary-300">
                            {Math.round(clampedProgress)}%
                        </span>
                    )}
                </div>
            )}
            <div
                className={`w-full overflow-hidden rounded-full bg-dark-300 ${heights[size]}`}
            >
                <div
                    className={`${heights[size]} rounded-full bg-gradient-to-r from-primary-600 to-primary transition-all duration-700 ease-out`}
                    style={{ width: `${clampedProgress}%` }}
                />
            </div>
        </div>
    )
}
