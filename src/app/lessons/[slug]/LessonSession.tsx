'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ── Block type definitions ─────────────────────────────────────────────────────

type ConceptBlock = {
    type: 'concept'
    title?: string
    content: string
    george_reaction?: string
}

type PromptBlock = {
    type: 'prompt'
    // seed SQL uses "prompt" + "title" + "instruction"
    prompt?: string
    title?: string
    instruction?: string
    // alternate names
    text?: string
    label?: string
    // new fields
    instruction_after?: string
    george_reaction?: string
}

type DualPromptBlock = {
    type: 'dual_prompt'
    title?: string
    content?: string
    bad_prompt: { label: string; text: string }
    good_prompt: { label: string; text: string }
    instruction_after?: string
    george_reaction?: string
}

type OutputBlock = {
    type: 'output'
    // seed SQL uses "description"
    description?: string
    title?: string
    // alternate
    text?: string
    hint?: string
}

type CheckpointBlock = {
    type: 'checkpoint'
    title?: string
    question: string
    stuckContext?: string
    it_worked_reaction?: string
}

type DownloadBlock = {
    type: 'download'
    url?: string
    filename?: string
    description?: string
    label?: string
    // if provided: generate file client-side via Blob (no URL needed)
    content?: string
}

type VideoBlock = { type: 'video'; url: string; caption?: string }

type ShippedBlock = {
    type: 'shipped'
    items?: string[]
    next_teaser?: string
}

export type Block =
    | ConceptBlock
    | PromptBlock
    | DualPromptBlock
    | OutputBlock
    | CheckpointBlock
    | DownloadBlock
    | VideoBlock
    | ShippedBlock

// ── George reaction pool (fallback if block has no it_worked_reaction) ─────────

const SUCCESS_REACTIONS = [
    "That's the one. Keep that energy.",
    "Exactly right. You're building real instincts now.",
    "Solid. Most people quit here — you didn't.",
    "That's how you ship. No overthinking, just execution.",
    "Clean. Notice how fast that was when you stopped second-guessing.",
    "Great job crossing this checkpoint.",
]

// ── Inner components ───────────────────────────────────────────────────────────

function ReactionQuote({ text }: { text: string }) {
    return (
        <div className="mt-4 border-l-2 border-primary/60 pl-4">
            <p className="text-sm text-primary-300 italic leading-[1.7]">&ldquo;{text}&rdquo;</p>
        </div>
    )
}

// ── GotIt button shared style ──────────────────────────────────────────────────

const gotItClass =
    'border border-dark-400 bg-dark-200 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-gray-300 hover:border-primary/50 hover:bg-primary/10 hover:text-primary-300 transition-colors min-h-[44px] flex items-center gap-1.5'

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
    blocks: Block[]
    lessonTitle: string
    lessonDescription?: string
    lessonIndex: number
    moduleTitle?: string
    prevSlug?: string
    nextSlug?: string
    isCompleted: boolean
    lessonId: string
    isLoggedIn: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LessonSession({
    blocks,
    lessonTitle,
    lessonDescription,
    lessonIndex,
    moduleTitle,
    prevSlug,
    nextSlug,
    lessonId,
    isLoggedIn,
}: Props) {
    // shipped blocks are metadata only — strip them from the visible list
    const renderableBlocks = blocks.filter(b => b.type !== 'shipped')
    const shippedBlock = blocks.find(b => b.type === 'shipped') as ShippedBlock | undefined

    const router = useRouter()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [doneIndices, setDoneIndices] = useState<Set<number>>(new Set())
    const [completedCheckpoints, setCompletedCheckpoints] = useState<Set<number>>(new Set())
    const [flippedIndex, setFlippedIndex] = useState<number | null>(null)
    const [reactionText, setReactionText] = useState('')
    const [isShipped, setIsShipped] = useState(false)
    const [copiedKey, setCopiedKey] = useState<string | null>(null)
    const sessionEndRef = useRef<HTMLDivElement>(null)

    const totalCheckpoints = renderableBlocks.filter(b => b.type === 'checkpoint').length

    const checkpointIndices = renderableBlocks.reduce<number[]>((acc, b, i) => {
        if (b.type === 'checkpoint') acc.push(i)
        return acc
    }, [])

    useEffect(() => {
        sessionEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, [currentIndex])

    useEffect(() => {
        if (totalCheckpoints > 0 && completedCheckpoints.size === totalCheckpoints) {
            setTimeout(() => setIsShipped(true), 600)
            if (isLoggedIn) {
                fetch('/api/progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lesson_id: lessonId }),
                }).then(() => router.refresh())
            }
        }
    }, [completedCheckpoints, totalCheckpoints, isLoggedIn, lessonId, router])

    const advance = useCallback(() => {
        setCurrentIndex(prev => Math.min(prev + 1, renderableBlocks.length))
    }, [renderableBlocks.length])

    const markDone = (index: number) => {
        setDoneIndices(prev => new Set(prev).add(index))
        advance()
    }

    const handleCheckpointDone = (index: number, block: CheckpointBlock) => {
        const order = checkpointIndices.indexOf(index)
        const reaction = block.it_worked_reaction || SUCCESS_REACTIONS[order % SUCCESS_REACTIONS.length]
        setReactionText(reaction)
        setFlippedIndex(index)
        setCompletedCheckpoints(prev => new Set(prev).add(index))
        setTimeout(() => {
            setFlippedIndex(null)
            setDoneIndices(prev => new Set(prev).add(index))
            advance()
        }, 1800)
    }

    const handleStuck = (block: CheckpointBlock) => {
        const context = block.stuckContext || `I'm stuck on: "${block.question}" in lesson "${lessonTitle}"`
        window.dispatchEvent(new CustomEvent('open-ask-george', { detail: { context } }))
    }

    const copyToClipboard = async (text: string, key: string) => {
        await navigator.clipboard.writeText(text)
        setCopiedKey(key)
        setTimeout(() => setCopiedKey(null), 2000)
    }

    const downloadContent = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }

    const buildLog = Array.from(doneIndices)
        .sort((a, b) => a - b)
        .map(i => {
            const b = renderableBlocks[i]
            if (!b) return 'Step complete'
            if (b.type === 'concept') return (b as ConceptBlock).title || 'Concept read'
            if (b.type === 'prompt') return (b as PromptBlock).title || (b as PromptBlock).label || 'Prompt executed'
            if (b.type === 'dual_prompt') return (b as DualPromptBlock).title || 'Prompts compared'
            if (b.type === 'output') return (b as OutputBlock).title || 'Output reviewed'
            if (b.type === 'checkpoint') return 'Checkpoint passed ✓'
            if (b.type === 'download') return 'Artifact downloaded'
            if (b.type === 'video') return 'Video watched'
            return 'Step complete'
        })

    return (
        <>
            {/* ── SHIPPED Overlay ───────────────────────────────────────────── */}
            {isShipped && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center shipped-overlay animate-shipped-in">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-primary-300 mb-4">
                        {moduleTitle} — Lesson {String(lessonIndex).padStart(2, '0')}
                    </p>
                    <span className="font-display text-[clamp(4rem,12vw,8rem)] text-white leading-none tracking-widest text-center px-4">
                        SHIPPED.
                    </span>

                    {shippedBlock?.items && shippedBlock.items.length > 0 ? (
                        <ul className="mt-8 space-y-2 text-center">
                            {shippedBlock.items.map((item, i) => (
                                <li key={i} className="flex items-center gap-2 justify-center font-mono text-xs text-emerald-400">
                                    <span className="text-emerald-500 flex-shrink-0">✓</span> {item}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-6 text-gray-400 max-w-sm text-center text-sm leading-[1.7]">
                            {lessonDescription || 'You built something real today.'}
                        </p>
                    )}

                    {shippedBlock?.next_teaser && (
                        <p className="mt-5 font-mono text-[11px] text-gray-600 uppercase tracking-widest text-center max-w-xs">
                            Up next: {shippedBlock.next_teaser}
                        </p>
                    )}

                    <div className="mt-10 flex flex-wrap gap-3 justify-center">
                        {nextSlug ? (
                            <Link
                                href={`/lessons/${nextSlug}`}
                                className="border border-primary bg-primary/10 px-8 py-3 font-mono text-sm text-primary-300 uppercase tracking-widest hover:bg-primary/20 transition-colors"
                            >
                                Next Lesson →
                            </Link>
                        ) : (
                            <Link
                                href="/"
                                className="group inline-flex min-h-[44px] items-center gap-2 border border-dark-400 bg-dark-100 px-6 px-4 py-2 font-mono text-xs uppercase tracking-widest text-primary-300 transition-all hover:bg-dark-200"
                            >
                                Back to Workspace →
                            </Link>
                        )}
                        <button
                            onClick={() => setIsShipped(false)}
                            className="border border-dark-400 px-8 py-3 font-mono text-sm text-gray-500 uppercase tracking-widest hover:text-gray-300 transition-colors"
                        >
                            Review Session
                        </button>
                    </div>
                </div>
            )}

            {/* ── Two-panel layout ──────────────────────────────────────────── */}
            <div className="flex h-[calc(100vh-4rem)] overflow-hidden">

                {/* ── LEFT: Mission Control (38%) ───────────────────────────── */}
                <aside className="hidden lg:flex w-[38%] flex-shrink-0 flex-col border-r border-dark-400 bg-dark-50 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-8">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-primary-300">
                            {moduleTitle || 'Module'}
                        </span>

                        <h1 className="mt-2 font-display text-[2.6rem] text-white leading-none tracking-wide">
                            {lessonTitle}
                        </h1>

                        <p className="mt-4 text-sm text-gray-400 leading-[1.7]">
                            {lessonDescription || 'Set up your environment and make your first AI-powered change.'}
                        </p>

                        {/* Checkpoint progress */}
                        <div className="mt-8">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
                                    Checkpoints
                                </span>
                                <span className="font-mono text-[10px] text-primary-300">
                                    {completedCheckpoints.size} / {totalCheckpoints}
                                </span>
                            </div>
                            <div className="h-px w-full bg-dark-400 overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-700"
                                    style={{
                                        width: totalCheckpoints > 0
                                            ? `${(completedCheckpoints.size / totalCheckpoints) * 100}%`
                                            : '0%'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Build log */}
                        {buildLog.length > 0 && (
                            <div className="mt-8">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-gray-600">
                                    Build Log
                                </span>
                                <div className="mt-3 space-y-1.5 border-l border-dark-400 pl-4">
                                    {buildLog.map((entry, i) => (
                                        <div key={i} className="build-log-line">
                                            {entry}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Nav footer */}
                    <div className="border-t border-dark-400 p-5 flex gap-3">
                        {prevSlug ? (
                            <Link
                                href={`/lessons/${prevSlug}`}
                                className="flex-1 border border-dark-400 py-2.5 text-center font-mono text-[11px] uppercase tracking-widest text-gray-500 hover:border-primary/30 hover:text-gray-300 transition-colors"
                            >
                                ← Prev
                            </Link>
                        ) : <div className="flex-1" />}
                        {nextSlug && (
                            <Link
                                href={`/lessons/${nextSlug}`}
                                className="flex-1 border border-dark-400 py-2.5 text-center font-mono text-[11px] uppercase tracking-widest text-gray-500 hover:border-primary/30 hover:text-gray-300 transition-colors"
                            >
                                Next →
                            </Link>
                        )}
                    </div>
                </aside>

                {/* ── RIGHT: The Session (62%) ──────────────────────────────── */}
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-2xl px-6 py-10 space-y-3">

                        {/* First-time hint */}
                        {doneIndices.size === 0 && (
                            <div className="flex items-start gap-3 border border-dark-400/60 bg-dark-50 px-4 py-3 mb-1">
                                <span className="text-primary-300 text-lg leading-none mt-0.5 flex-shrink-0" aria-hidden="true">↓</span>
                                <p className="font-mono text-[11px] text-gray-500 leading-[1.8]">
                                    Read each step, do the action, then hit{' '}
                                    <span className="text-white font-semibold">Got it →</span>{' '}
                                    to unlock the next one. Checkpoints ask if it worked — be honest.
                                </p>
                            </div>
                        )}

                        {renderableBlocks.map((block, index) => {
                            const isDone = doneIndices.has(index)
                            const isActive = index === currentIndex
                            const isFuture = index > currentIndex

                            // ── Collapsed done line ──────────────────────────
                            if (isDone) {
                                let doneLabel = 'Step complete'
                                if (block.type === 'concept') doneLabel = (block as ConceptBlock).title || 'Concept read'
                                else if (block.type === 'prompt') doneLabel = (block as PromptBlock).title || (block as PromptBlock).label || 'Prompt executed'
                                else if (block.type === 'dual_prompt') doneLabel = (block as DualPromptBlock).title || 'Prompts compared'
                                else if (block.type === 'output') doneLabel = (block as OutputBlock).title || 'Output reviewed'
                                else if (block.type === 'checkpoint') doneLabel = 'Checkpoint passed'
                                else if (block.type === 'download') doneLabel = 'Artifact ready'
                                else if (block.type === 'video') doneLabel = 'Video watched'

                                return (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 px-4 py-2.5 border border-dark-400/30 bg-dark-50/30 opacity-40"
                                    >
                                        <span className="text-emerald-500 text-xs flex-shrink-0">✓</span>
                                        <span className="font-mono text-[11px] text-gray-500 uppercase tracking-widest truncate">
                                            {doneLabel}
                                        </span>
                                    </div>
                                )
                            }

                            if (isFuture || !isActive) return null

                            // ── CONCEPT ──────────────────────────────────────
                            if (block.type === 'concept') {
                                const cb = block as ConceptBlock
                                return (
                                    <div key={index} className="animate-step-reveal border border-dark-400 bg-dark-100 overflow-hidden">
                                        {cb.title && (
                                            <div className="flex items-center gap-3 border-b border-dark-400 px-4 py-2.5">
                                                <span className="w-1 h-4 bg-gray-500 flex-shrink-0" />
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400">
                                                    {cb.title}
                                                </span>
                                            </div>
                                        )}
                                        <div className="p-5">
                                            <p className="text-sm text-gray-300 leading-[1.7] whitespace-pre-line">
                                                {cb.content}
                                            </p>
                                            {cb.george_reaction && <ReactionQuote text={cb.george_reaction} />}
                                        </div>
                                        <div className="border-t border-dark-400 px-5 py-3 flex items-center justify-end">
                                            <button onClick={() => markDone(index)} className={gotItClass}>
                                                Got it →
                                            </button>
                                        </div>
                                    </div>
                                )
                            }

                            // ── PROMPT ───────────────────────────────────────
                            if (block.type === 'prompt') {
                                const pb = block as PromptBlock
                                const promptText = pb.prompt || pb.text || ''
                                const promptLabel = pb.title || pb.label || 'Prompt'
                                return (
                                    <div key={index} className="animate-step-reveal border border-dark-400 bg-dark-100 overflow-hidden">
                                        <div className="flex items-center gap-3 border-b border-dark-400 px-4 py-2.5">
                                            <span className="w-1 h-4 bg-primary flex-shrink-0" />
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-primary-300">
                                                {promptLabel}
                                            </span>
                                        </div>
                                        {pb.instruction && (
                                            <p className="px-5 pt-4 text-xs text-gray-500 leading-[1.7]">
                                                {pb.instruction}
                                            </p>
                                        )}
                                        <div className="relative p-5">
                                            <pre className="font-mono text-sm text-gray-200 whitespace-pre-wrap leading-[1.7] pr-20">
                                                {promptText}
                                            </pre>
                                            <button
                                                onClick={() => copyToClipboard(promptText, `prompt-${index}`)}
                                                className="absolute top-4 right-4 border border-dark-400 bg-dark-200 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-gray-400 hover:border-primary/40 hover:text-primary-300 transition-colors min-h-[36px]"
                                            >
                                                {copiedKey === `prompt-${index}` ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                        {pb.instruction_after && (
                                            <p className="px-5 pb-3 pt-3 text-xs text-gray-500 leading-[1.7] border-t border-dark-400/50">
                                                {pb.instruction_after}
                                            </p>
                                        )}
                                        {pb.george_reaction && (
                                            <div className="px-5 pb-4">
                                                <ReactionQuote text={pb.george_reaction} />
                                            </div>
                                        )}
                                        <div className="border-t border-dark-400 px-5 py-3 flex items-center justify-end">
                                            <button onClick={() => markDone(index)} className={gotItClass}>
                                                Got it →
                                            </button>
                                        </div>
                                    </div>
                                )
                            }

                            // ── DUAL_PROMPT ──────────────────────────────────
                            if (block.type === 'dual_prompt') {
                                const dp = block as DualPromptBlock
                                return (
                                    <div key={index} className="animate-step-reveal border border-dark-400 bg-dark-100 overflow-hidden">
                                        <div className="flex items-center gap-3 border-b border-dark-400 px-4 py-2.5">
                                            <span className="w-1 h-4 bg-amber-500 flex-shrink-0" />
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
                                                {dp.title || 'Prompt Comparison'}
                                            </span>
                                        </div>
                                        {dp.content && (
                                            <p className="px-5 pt-4 text-sm text-gray-400 leading-[1.7]">
                                                {dp.content}
                                            </p>
                                        )}
                                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Vague prompt */}
                                            <div className="border border-dark-400 bg-dark-200 overflow-hidden">
                                                <div className="flex items-center justify-between px-3 py-2 border-b border-dark-400">
                                                    <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
                                                        {dp.bad_prompt.label}
                                                    </span>
                                                    <button
                                                        onClick={() => copyToClipboard(dp.bad_prompt.text, `bad-${index}`)}
                                                        className="font-mono text-[10px] uppercase tracking-widest text-gray-600 hover:text-gray-300 transition-colors"
                                                    >
                                                        {copiedKey === `bad-${index}` ? 'Copied!' : 'Copy'}
                                                    </button>
                                                </div>
                                                <pre className="p-3 font-mono text-xs text-gray-400 whitespace-pre-wrap leading-[1.6]">
                                                    {dp.bad_prompt.text}
                                                </pre>
                                            </div>
                                            {/* Directed prompt */}
                                            <div className="border border-primary/40 bg-primary/5 overflow-hidden">
                                                <div className="flex items-center justify-between px-3 py-2 border-b border-primary/20">
                                                    <span className="font-mono text-[10px] uppercase tracking-widest text-primary-300">
                                                        {dp.good_prompt.label}
                                                    </span>
                                                    <button
                                                        onClick={() => copyToClipboard(dp.good_prompt.text, `good-${index}`)}
                                                        className="font-mono text-[10px] uppercase tracking-widest text-primary-300/70 hover:text-primary-300 transition-colors"
                                                    >
                                                        {copiedKey === `good-${index}` ? 'Copied!' : 'Copy'}
                                                    </button>
                                                </div>
                                                <pre className="p-3 font-mono text-xs text-gray-200 whitespace-pre-wrap leading-[1.6]">
                                                    {dp.good_prompt.text}
                                                </pre>
                                            </div>
                                        </div>
                                        {dp.instruction_after && (
                                            <p className="px-5 pb-3 pt-3 text-xs text-gray-500 leading-[1.7] border-t border-dark-400/50">
                                                {dp.instruction_after}
                                            </p>
                                        )}
                                        {dp.george_reaction && (
                                            <div className="px-5 pb-4">
                                                <ReactionQuote text={dp.george_reaction} />
                                            </div>
                                        )}
                                        <div className="border-t border-dark-400 px-5 py-3 flex items-center justify-end">
                                            <button onClick={() => markDone(index)} className={gotItClass}>
                                                Got it →
                                            </button>
                                        </div>
                                    </div>
                                )
                            }

                            // ── OUTPUT ───────────────────────────────────────
                            if (block.type === 'output') {
                                const ob = block as OutputBlock
                                const outputText = ob.description || ob.text || ''
                                const outputTitle = ob.title || 'Expected Output'
                                return (
                                    <div key={index} className="animate-step-reveal border border-dark-400 bg-dark-100 overflow-hidden">
                                        <div className="flex items-center gap-3 border-b border-dark-400 px-4 py-2.5">
                                            <span className="w-1 h-4 bg-emerald-500 flex-shrink-0" />
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
                                                {outputTitle}
                                            </span>
                                        </div>
                                        <div className="p-5">
                                            <p className="text-sm text-gray-300 leading-[1.7]">
                                                {outputText}
                                            </p>
                                            {ob.hint && (
                                                <div className="mt-4 border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                                                    <span className="font-mono text-[10px] uppercase tracking-widest text-amber-500">
                                                        ⚠ Hint
                                                    </span>
                                                    <p className="mt-1 text-xs text-gray-400 leading-[1.7]">
                                                        {ob.hint}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="border-t border-dark-400 px-5 py-3 flex items-center justify-end">
                                            <button onClick={() => markDone(index)} className={gotItClass}>
                                                Got it →
                                            </button>
                                        </div>
                                    </div>
                                )
                            }

                            // ── CHECKPOINT ───────────────────────────────────
                            if (block.type === 'checkpoint') {
                                const cb = block as CheckpointBlock
                                const isFlipped = flippedIndex === index
                                return (
                                    <div key={index} className="animate-step-reveal step-card">
                                        <div className={`step-card-inner${isFlipped ? ' flipped' : ''}`}>
                                            {/* Front */}
                                            <div className="step-card-front border border-primary/40 bg-primary/5 overflow-hidden">
                                                <div className="flex items-center gap-3 border-b border-primary/20 px-4 py-2.5">
                                                    <span className="w-1 h-4 bg-primary flex-shrink-0" />
                                                    <span className="font-mono text-[10px] uppercase tracking-widest text-primary-300">
                                                        {cb.title || 'Checkpoint'}
                                                    </span>
                                                </div>
                                                <div className="p-5">
                                                    <p className="text-sm text-gray-200 leading-[1.7]">
                                                        {cb.question}
                                                    </p>
                                                </div>
                                                <div className="border-t border-primary/20 px-5 py-3 flex items-center justify-between gap-3">
                                                    <button
                                                        onClick={() => handleStuck(cb)}
                                                        className="font-mono text-[11px] uppercase tracking-widest text-gray-600 hover:text-amber-500 transition-colors min-h-[44px] px-1"
                                                    >
                                                        ⚡ I&apos;m Stuck
                                                    </button>
                                                    <button
                                                        onClick={() => handleCheckpointDone(index, cb)}
                                                        className="border border-primary/40 bg-primary/10 px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-primary-300 hover:bg-primary/20 transition-colors min-h-[44px]"
                                                    >
                                                        ✓ It Worked
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Back — George reaction */}
                                            <div className="step-card-back border border-emerald-500/40 bg-emerald-500/5 p-8 flex flex-col items-center justify-center text-center min-h-[140px]">
                                                <p className="font-display text-2xl text-white tracking-wide leading-snug">
                                                    {reactionText}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            // ── DOWNLOAD ─────────────────────────────────────
                            if (block.type === 'download') {
                                const db = block as DownloadBlock
                                return (
                                    <div key={index} className="animate-step-reveal border border-dark-400 bg-dark-100 overflow-hidden">
                                        <div className="flex items-center gap-3 border-b border-dark-400 px-4 py-2.5">
                                            <span className="w-1 h-4 bg-gray-600 flex-shrink-0" />
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400">
                                                Artifact
                                            </span>
                                        </div>
                                        <div className="p-5 flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-mono text-sm text-gray-200">
                                                    {db.filename || 'workflow_bundle.zip'}
                                                </p>
                                                {db.description && (
                                                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-gray-500">
                                                        {db.description}
                                                    </p>
                                                )}
                                            </div>
                                            {db.content ? (
                                                <button
                                                    onClick={() => downloadContent(db.content!, db.filename || 'download.md')}
                                                    className="border border-dark-400 px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-gray-400 hover:border-primary/40 hover:text-primary-300 transition-colors whitespace-nowrap min-h-[44px] flex items-center"
                                                >
                                                    {db.label || 'Download ↓'}
                                                </button>
                                            ) : db.url ? (
                                                <a
                                                    href={db.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="border border-dark-400 px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-gray-400 hover:border-primary/40 hover:text-primary-300 transition-colors whitespace-nowrap min-h-[44px] flex items-center"
                                                >
                                                    {db.label || 'Download ↓'}
                                                </a>
                                            ) : null}
                                        </div>
                                        <div className="border-t border-dark-400 px-5 py-3 flex items-center justify-end">
                                            <button onClick={() => markDone(index)} className={gotItClass}>
                                                Got it →
                                            </button>
                                        </div>
                                    </div>
                                )
                            }

                            // ── VIDEO ─────────────────────────────────────────
                            if (block.type === 'video') {
                                const vb = block as VideoBlock
                                if (!vb.url) return null
                                return (
                                    <div key={index} className="animate-step-reveal border border-dark-400 bg-dark-100 overflow-hidden">
                                        <div className="flex items-center gap-3 border-b border-dark-400 px-4 py-2.5">
                                            <span className="w-1 h-4 bg-primary/50 flex-shrink-0" />
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400">
                                                {vb.caption || 'Video'}
                                            </span>
                                        </div>
                                        <div className="relative aspect-video w-full bg-dark-200">
                                            <iframe
                                                src={vb.url}
                                                className="absolute inset-0 h-full w-full"
                                                allowFullScreen
                                                title={vb.caption || 'Lesson video'}
                                            />
                                        </div>
                                        <div className="border-t border-dark-400 px-5 py-3 flex items-center justify-end">
                                            <button onClick={() => markDone(index)} className={gotItClass}>
                                                Got it →
                                            </button>
                                        </div>
                                    </div>
                                )
                            }

                            return null
                        })}

                        <div ref={sessionEndRef} />
                    </div>
                </main>
            </div>
        </>
    )
}
