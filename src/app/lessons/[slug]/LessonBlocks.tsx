'use client'

import { useState, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────

type PromptBlock = {
    type: 'prompt'
    title: string
    instruction: string
    prompt: string
}

type OutputBlock = {
    type: 'output'
    title: string
    description: string
    hint?: string
}

type CheckpointBlock = {
    type: 'checkpoint'
    question: string
    stuckContext: string
}

type DownloadBlock = {
    type: 'download'
    title: string
    filename: string
    description: string
    url: string
}

type VideoBlock = {
    type: 'video'
    url: string
}

export type Block = PromptBlock | OutputBlock | CheckpointBlock | DownloadBlock | VideoBlock

interface LessonBlocksProps {
    blocks: Block[]
    lessonTitle: string
}

// ── Component ──────────────────────────────────────────────────────────────

export default function LessonBlocks({ blocks }: LessonBlocksProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
    const [doneCheckpoints, setDoneCheckpoints] = useState<Set<number>>(new Set())

    const copyToClipboard = useCallback((text: string, index: number) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text)
        } else {
            // HTTP fallback
            const el = document.createElement('textarea')
            el.value = text
            document.body.appendChild(el)
            el.select()
            document.execCommand('copy')
            document.body.removeChild(el)
        }
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(c => (c === index ? null : c)), 2000)
    }, [])

    const markDone = useCallback((index: number) => {
        setDoneCheckpoints(prev => new Set(Array.from(prev).concat(index)))
    }, [])

    const handleStuck = useCallback((context: string) => {
        window.dispatchEvent(
            new CustomEvent('open-ask-george', { detail: { context } })
        )
    }, [])

    return (
        <div className="space-y-4">
            {blocks.map((block, index) => {

                // ── Prompt ─────────────────────────────────────────────────
                if (block.type === 'prompt') {
                    const copied = copiedIndex === index
                    return (
                        <div key={index} className="flex overflow-hidden border border-dark-400 bg-dark-100">
                            {/* Amber left accent bar */}
                            <div className="w-1 shrink-0 bg-amber" aria-hidden="true" />

                            <div className="flex min-w-0 flex-1 flex-col">
                                {/* Header */}
                                <div className="flex items-center justify-between border-b border-dark-400 px-5 py-3">
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-amber">
                                        Prompt
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(block.prompt, index)}
                                        className="font-mono text-[10px] uppercase tracking-widest text-gray-500 transition-colors hover:text-white"
                                        aria-label="Copy prompt to clipboard"
                                    >
                                        {copied ? 'COPIED ✓' : 'COPY'}
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-5">
                                    <h3 className="mb-2 font-display text-xl tracking-wide text-white">
                                        {block.title}
                                    </h3>
                                    <p className="mb-4 text-sm leading-[1.7] text-gray-400">
                                        {block.instruction}
                                    </p>

                                    {/* Prompt text box */}
                                    <div className="border border-dark-300 bg-dark-200 p-4 font-mono text-sm leading-relaxed text-white whitespace-pre-wrap">
                                        {block.prompt}
                                    </div>

                                    {/* Primary copy button */}
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={() => copyToClipboard(block.prompt, index)}
                                            className={`inline-flex min-h-[44px] items-center gap-2 px-6 py-2.5 font-mono text-xs uppercase tracking-wider transition-all ${copied
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-primary text-white hover:bg-primary-600'
                                                }`}
                                        >
                                            {copied ? 'COPIED ✓' : 'COPY PROMPT →'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                // ── Output ─────────────────────────────────────────────────
                if (block.type === 'output') {
                    return (
                        <div key={index} className="flex overflow-hidden border border-dark-400 bg-dark-100">
                            {/* Emerald left accent bar */}
                            <div className="w-1 shrink-0 bg-emerald-500/50" aria-hidden="true" />

                            <div className="flex min-w-0 flex-1 flex-col">
                                {/* Header */}
                                <div className="border-b border-dark-400 px-5 py-3">
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
                                        ◎ Expected Output
                                    </span>
                                </div>

                                {/* Body */}
                                <div className="p-5">
                                    <h3 className="mb-2 font-display text-xl tracking-wide text-white">
                                        {block.title}
                                    </h3>
                                    <p className="text-sm leading-[1.7] text-gray-400">
                                        {block.description}
                                    </p>

                                    {/* Hint — amber warning style */}
                                    {block.hint && (
                                        <div className="mt-4 flex items-start gap-2.5 border border-amber/20 bg-amber/5 p-3">
                                            <span className="mt-0.5 shrink-0 text-xs text-amber" aria-hidden="true">⚠</span>
                                            <p className="text-xs leading-relaxed text-amber/80">{block.hint}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }

                // ── Checkpoint ─────────────────────────────────────────────
                if (block.type === 'checkpoint') {
                    const done = doneCheckpoints.has(index)
                    return (
                        <div
                            key={index}
                            className={`border border-dark-400 bg-dark-100 transition-opacity duration-300 ${done ? 'opacity-50' : ''}`}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-dark-400 px-5 py-3">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
                                    Checkpoint
                                </span>
                                {done && (
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
                                        ✓ Done
                                    </span>
                                )}
                            </div>

                            {/* Body */}
                            <div className="p-5">
                                <p
                                    className={`mb-6 text-base leading-relaxed ${done
                                        ? 'text-gray-500 line-through decoration-gray-600'
                                        : 'text-white'
                                        }`}
                                >
                                    {block.question}
                                </p>

                                {!done && (
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            onClick={() => markDone(index)}
                                            className="inline-flex min-h-[44px] items-center gap-2 border border-emerald-500/30 bg-transparent px-5 py-2 font-mono text-xs uppercase tracking-wider text-emerald-400 transition-colors hover:bg-emerald-500/10"
                                        >
                                            ✓ Yes, It Worked
                                        </button>
                                        <button
                                            onClick={() => handleStuck(block.stuckContext)}
                                            className="inline-flex min-h-[44px] items-center gap-2 border border-primary/30 bg-transparent px-5 py-2 font-mono text-xs uppercase tracking-wider text-primary transition-colors hover:bg-primary/10"
                                        >
                                            I&apos;m Stuck →
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }

                // ── Download ───────────────────────────────────────────────
                if (block.type === 'download') {
                    if (!block.url) return null
                    return (
                        <div key={index} className="border border-dark-400 bg-dark-100">
                            {/* Header */}
                            <div className="border-b border-dark-400 px-5 py-3">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
                                    Available Artifacts
                                </span>
                            </div>

                            {/* File card */}
                            <div className="p-5">
                                <a
                                    href={block.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex max-w-md items-center justify-between border border-dark-400 bg-dark-200 p-4 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-glow"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-dark-300 bg-dark-300">
                                            <svg
                                                className="h-4 w-4 text-primary"
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                                                aria-hidden="true"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-mono text-sm text-gray-200 transition-colors group-hover:text-primary-300">
                                                {block.filename}
                                            </p>
                                            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-gray-500">
                                                {block.description}
                                            </p>
                                        </div>
                                    </div>
                                    <svg
                                        className="h-4 w-4 shrink-0 text-primary opacity-50 transition-opacity group-hover:opacity-100"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                        aria-hidden="true"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    )
                }

                // ── Video (renders when url is present, skipped when empty) ─
                if (block.type === 'video') {
                    if (!block.url) return null
                    return (
                        <div key={index} className="overflow-hidden border border-dark-400 bg-dark-100">
                            <div className="border-b border-dark-400 px-5 py-3">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
                                    Video
                                </span>
                            </div>
                            <div className="relative" style={{ paddingBottom: '56.25%' }}>
                                <iframe
                                    src={block.url}
                                    className="absolute inset-0 h-full w-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title="Lesson video"
                                />
                            </div>
                        </div>
                    )
                }

                return null
            })}
        </div>
    )
}
