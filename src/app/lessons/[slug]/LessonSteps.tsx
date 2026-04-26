'use client'

import MarkdownRenderer from '@/components/MarkdownRenderer'

interface LessonStepsProps {
    content: string;
    lessonTitle: string;
}

export default function LessonSteps({ content, lessonTitle }: LessonStepsProps) {
    // Split content by Markdown Headings (## )
    const parts = content.split(/(?=## )/g).filter(p => p.trim().length > 0)

    const handleStuck = (stepIndex: number) => {
        // In the future: trigger Ask George Panel using context or window event
        const event = new CustomEvent('open-ask-george', {
            detail: { context: `George, I'm stuck on Step ${stepIndex + 1} of ${lessonTitle}...` }
        });
        window.dispatchEvent(event);
    }

    return (
        <div className="space-y-6">
            {parts.length > 0 ? parts.map((part, index) => {
                // Determine if it's the first intro part or an actual step. We can just treat them all as blocks
                const isHeading = part.startsWith('##')
                return (
                    <div key={index} className="flex flex-col rounded-none border border-dark-400 bg-dark-100 p-6 shadow-sm">
                        <div className="flex-1">
                            <MarkdownRenderer content={part} />
                        </div>
                        {isHeading && (
                            <div className="mt-6 flex items-center justify-between border-t border-dark-400/50 pt-4">
                                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                                    Checkpoint // Step {index + 1}
                                </span>
                                <div className="flex items-center gap-3">
                                    <button
                                        className="btn-secondary !py-1.5 !px-4 text-xs font-mono uppercase tracking-wider"
                                    >
                                        ✓ Done
                                    </button>
                                    <button
                                        onClick={() => handleStuck(index)}
                                        className="btn-secondary !border-primary/30 !bg-transparent text-primary hover:!bg-primary/10 !py-1.5 !px-4 text-xs font-mono uppercase tracking-wider transition-colors"
                                    >
                                        I&apos;m Stuck
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )
            }) : (
                <div className="rounded-none border border-dark-400 bg-dark-100 p-6 shadow-sm">
                    <MarkdownRenderer content={content} />
                </div>
            )}
        </div>
    )
}
