'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Lesson {
    id: string
    title: string
    slug: string
    order_index: number
    is_free: boolean
}

interface Module {
    id: string
    title: string
    slug: string
    description: string
    order_index: number
    is_free: boolean
    lessons: Lesson[]
    project_id?: string | null
    projects?: { title: string; slug: string } | null
}

interface Props {
    modules: Module[]
    completedLessonIds: string[]
    isLoggedIn: boolean
}

type NodeState = 'locked' | 'available' | 'in-progress' | 'completed'

function getNodeState(lesson: Lesson, mod: Module, completedSet: Set<string>, isLoggedIn: boolean): NodeState {
    if (!lesson.is_free && !mod.is_free && !isLoggedIn) return 'locked'
    if (completedSet.has(lesson.id)) return 'completed'
    return 'available'
}

const NODE_STYLES: Record<NodeState, string> = {
    locked: 'border-dark-400 bg-dark-200 text-gray-600 cursor-not-allowed',
    available: 'border-dark-400 bg-dark-100 text-gray-400 hover:border-primary/40 hover:text-primary-300 transition-colors',
    'in-progress': 'border-primary/60 bg-primary/10 text-primary-300 shadow-glow',
    completed: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400',
}

function ModuleAccordion({
    mod,
    completedSet,
    isLoggedIn,
    expanded,
    onToggle,
}: {
    mod: Module
    completedSet: Set<string>
    isLoggedIn: boolean
    expanded: boolean
    onToggle: () => void
}) {
    const sortedLessons = [...mod.lessons].sort((a, b) => a.order_index - b.order_index)
    const completedInModule = sortedLessons.filter(l => completedSet.has(l.id)).length
    const totalInModule = sortedLessons.length
    const isModuleDone = totalInModule > 0 && completedInModule === totalInModule
    const isModuleStarted = completedInModule > 0 && !isModuleDone
    const isLocked = !mod.is_free && !isLoggedIn
    const isOpen = expanded

    const nextLesson = sortedLessons.find(l => !completedSet.has(l.id) && (l.is_free || mod.is_free || isLoggedIn))

    return (
        <div className="border border-dark-400 bg-dark-100">
            {/* Module header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-dark-200/50 transition-colors"
                aria-expanded={isOpen}
            >
                {/* Order badge */}
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center border font-mono text-[11px] ${isModuleDone ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400' : isModuleStarted ? 'border-primary/40 bg-primary/10 text-primary-300' : 'border-dark-400 text-gray-600'}`}>
                    {String(mod.order_index).padStart(2, '0')}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h3 className={`font-display text-xl tracking-wide truncate ${isLocked ? 'text-gray-600' : 'text-white'}`}>
                            {mod.title}
                        </h3>
                        {isLocked && (
                            <span className="flex-shrink-0 font-mono text-[10px] uppercase tracking-widest text-gray-600 border border-dark-400 px-2 py-0.5">
                                Premium
                            </span>
                        )}
                        {mod.is_free && (
                            <span className="flex-shrink-0 font-mono text-[10px] uppercase tracking-widest text-primary-300 border border-primary/30 px-2 py-0.5">
                                Free
                            </span>
                        )}
                        {isModuleDone && (
                            <span className="flex-shrink-0 font-mono text-[10px] uppercase tracking-widest text-emerald-400">
                                ✓ Complete
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 truncate">{mod.description}</p>
                </div>

                <div className="flex-shrink-0 flex items-center gap-4">
                    <span className="hidden sm:block font-mono text-[11px] text-gray-600">
                        {completedInModule}/{totalInModule}
                    </span>
                    <div className="hidden sm:block w-20 h-px bg-dark-400 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${isModuleDone ? 'bg-emerald-500' : 'bg-primary'}`}
                            style={{ width: totalInModule > 0 ? `${(completedInModule / totalInModule) * 100}%` : '0%' }}
                        />
                    </div>
                    <svg
                        className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Lessons list */}
            {isOpen && (
                <div className="border-t border-dark-400">
                    <div className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                            {sortedLessons.map((lesson) => {
                                const state = getNodeState(lesson, mod, completedSet, isLoggedIn)
                                const isNext = lesson.id === nextLesson?.id

                                if (state === 'locked') {
                                    return (
                                        <div
                                            key={lesson.id}
                                            className={`flex items-center gap-2 border px-3 py-2 ${NODE_STYLES.locked}`}
                                            title="Premium content"
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                            </svg>
                                            <span className="font-mono text-[11px] uppercase tracking-widest truncate max-w-[120px]">
                                                {lesson.title}
                                            </span>
                                        </div>
                                    )
                                }

                                return (
                                    <Link
                                        key={lesson.id}
                                        href={`/lessons/${lesson.slug}`}
                                        className={`flex items-center gap-2 border px-3 py-2 ${isNext ? NODE_STYLES['in-progress'] : NODE_STYLES[state]}`}
                                    >
                                        {state === 'completed' ? (
                                            <span className="text-emerald-500 text-xs flex-shrink-0">✓</span>
                                        ) : isNext ? (
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 animate-pulse" />
                                        ) : (
                                            <span className="w-1.5 h-1.5 rounded-full bg-dark-400 flex-shrink-0" />
                                        )}
                                        <span className="font-mono text-[11px] uppercase tracking-widest truncate max-w-[140px]">
                                            {lesson.title}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    {nextLesson && !isModuleDone && (
                        <div className="border-t border-dark-400 px-6 py-3 flex items-center justify-between">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-600">
                                Up next
                            </span>
                            <Link
                                href={`/lessons/${nextLesson.slug}`}
                                className="font-mono text-[11px] uppercase tracking-widest text-primary-300 hover:text-primary transition-colors"
                            >
                                {nextLesson.title} →
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function DashboardTimeline({ modules, completedLessonIds, isLoggedIn }: Props) {
    const completedSet = new Set(completedLessonIds)

    // Split: foundation modules (no project_id) vs project modules
    const foundationModules = modules.filter(m => !m.project_id)
    const projectModules = modules.filter(m => !!m.project_id)

    // Group project modules by project slug
    const projectGroups: Record<string, { title: string; slug: string; modules: Module[] }> = {}
    for (const mod of projectModules) {
        const key = mod.projects?.slug ?? 'unknown'
        if (!projectGroups[key]) {
            projectGroups[key] = {
                title: mod.projects?.title ?? 'Project',
                slug: key,
                modules: [],
            }
        }
        projectGroups[key].modules.push(mod)
    }

    const [expanded, setExpanded] = useState<string | null>(modules[0]?.id ?? null)

    const toggle = (id: string) => setExpanded(prev => (prev === id ? null : id))

    return (
        <div className="space-y-8">
            {/* ── Foundation Modules ─────────────────────────── */}
            {foundationModules.length > 0 && (
                <section>
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-gray-600">
                        Foundation
                    </p>
                    <div className="space-y-px">
                        {foundationModules.map(mod => (
                            <ModuleAccordion
                                key={mod.id}
                                mod={mod}
                                completedSet={completedSet}
                                isLoggedIn={isLoggedIn}
                                expanded={expanded === mod.id}
                                onToggle={() => toggle(mod.id)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* ── Project Sections ───────────────────────────── */}
            {Object.values(projectGroups).map(group => {
                const totalInGroup = group.modules.reduce((s, m) => s + m.lessons.length, 0)
                const completedInGroup = group.modules.reduce(
                    (s, m) => s + m.lessons.filter(l => completedSet.has(l.id)).length,
                    0
                )

                return (
                    <section key={group.slug}>
                        {/* Project section header */}
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
                                    {group.title}
                                </p>
                                <div className="h-px w-8 bg-amber-500/30" />
                            </div>
                            <span className="font-mono text-[10px] text-gray-600">
                                {completedInGroup}/{totalInGroup} complete
                            </span>
                        </div>
                        <div className="space-y-px border-l-2 border-amber-500/20 pl-0">
                            {group.modules.map(mod => (
                                <ModuleAccordion
                                    key={mod.id}
                                    mod={mod}
                                    completedSet={completedSet}
                                    isLoggedIn={isLoggedIn}
                                    expanded={expanded === mod.id}
                                    onToggle={() => toggle(mod.id)}
                                />
                            ))}
                        </div>
                    </section>
                )
            })}
        </div>
    )
}
