'use client'

import { useState } from 'react'

export type LessonRow = {
    id: string
    title: string
    slug: string
    description: string | null
    order_index: number
    is_free: boolean
    blocks: unknown
    moduleTitle: string
    moduleId: string
}

interface Props {
    lessons: LessonRow[]
}

export default function AdminLessons({ lessons: initialLessons }: Props) {
    const [lessons, setLessons] = useState(initialLessons)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editDraft, setEditDraft] = useState<Partial<LessonRow>>({})
    const [blocksText, setBlocksText] = useState('')
    const [blocksError, setBlocksError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [saveResult, setSaveResult] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    // Group by module
    const byModule: Record<string, { moduleTitle: string; lessons: LessonRow[] }> = {}
    for (const l of lessons) {
        if (!byModule[l.moduleId]) {
            byModule[l.moduleId] = { moduleTitle: l.moduleTitle, lessons: [] }
        }
        byModule[l.moduleId].lessons.push(l)
    }
    for (const key of Object.keys(byModule)) {
        byModule[key].lessons.sort((a, b) => a.order_index - b.order_index)
    }

    // ── Edit ────────────────────────────────────────────────────────────────

    function startEdit(l: LessonRow) {
        setEditingId(l.id)
        setEditDraft({
            title: l.title,
            description: l.description ?? '',
            is_free: l.is_free,
        })
        setBlocksText(JSON.stringify(l.blocks, null, 2))
        setBlocksError(null)
        setSaveResult(null)
    }

    function cancelEdit() {
        setEditingId(null)
        setEditDraft({})
        setBlocksText('')
        setBlocksError(null)
        setSaveResult(null)
    }

    async function handleSave(lessonId: string) {
        // Validate blocks JSON
        let parsedBlocks: unknown
        try {
            parsedBlocks = JSON.parse(blocksText)
        } catch {
            setBlocksError('Invalid JSON — fix the blocks before saving.')
            return
        }
        setBlocksError(null)
        setSaving(true)
        setSaveResult(null)
        try {
            const res = await fetch('/api/admin/lesson', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: lessonId,
                    title: editDraft.title,
                    description: editDraft.description,
                    is_free: editDraft.is_free,
                    blocks: parsedBlocks,
                }),
            })
            const json = await res.json()
            if (!res.ok) {
                setSaveResult(`Error: ${json.error}`)
            } else {
                setLessons(prev => prev.map(l =>
                    l.id === lessonId
                        ? { ...l, ...editDraft, blocks: parsedBlocks }
                        : l
                ))
                setSaveResult('Saved.')
                setEditingId(null)
            }
        } catch {
            setSaveResult('Network error — try again.')
        } finally {
            setSaving(false)
        }
    }

    // ── Delete ───────────────────────────────────────────────────────────────

    async function handleDelete(lessonId: string) {
        setDeletingId(lessonId)
        try {
            const res = await fetch('/api/admin/lesson', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: lessonId }),
            })
            const json = await res.json()
            if (!res.ok) {
                alert(`Error: ${json.error}`)
            } else {
                setLessons(prev => prev.filter(l => l.id !== lessonId))
                if (editingId === lessonId) cancelEdit()
            }
        } catch {
            alert('Network error — try again.')
        } finally {
            setDeletingId(null)
            setConfirmDeleteId(null)
        }
    }

    if (lessons.length === 0) {
        return (
            <div className="border border-dashed border-dark-400 p-8 text-center">
                <p className="font-mono text-[11px] uppercase tracking-widest text-gray-600">
                    No lessons in the database
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {saveResult && !editingId && (
                <p className={`font-mono text-[11px] ${saveResult.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
                    {saveResult}
                </p>
            )}

            {Object.entries(byModule).map(([moduleId, { moduleTitle, lessons: modLessons }]) => (
                <div key={moduleId} className="border border-dark-400 overflow-hidden">
                    {/* Module header */}
                    <div className="px-4 py-2.5 bg-dark-200 border-b border-dark-400 flex items-center gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-primary-300">
                            Module
                        </span>
                        <span className="font-mono text-xs text-white">{moduleTitle}</span>
                        <span className="ml-auto font-mono text-[10px] text-gray-600">
                            {modLessons.length} lesson{modLessons.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Lessons */}
                    {modLessons.map((l, i) => {
                        const isEditing = editingId === l.id
                        const isDeleting = deletingId === l.id
                        const isConfirmingDelete = confirmDeleteId === l.id

                        return (
                            <div key={l.id} className={i > 0 ? 'border-t border-dark-400/50' : ''}>
                                {/* Lesson row */}
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <span className="font-mono text-[10px] text-gray-600 w-4 text-right flex-shrink-0">
                                        {l.order_index}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <span className="font-mono text-xs text-gray-300 truncate block">{l.title}</span>
                                        <span className="font-mono text-[10px] text-gray-600">{l.slug}</span>
                                    </div>
                                    <span className={`font-mono text-[10px] px-2 py-0.5 border flex-shrink-0 ${l.is_free ? 'border-emerald-500/30 text-emerald-400' : 'border-dark-400 text-gray-600'}`}>
                                        {l.is_free ? 'FREE' : 'PRO'}
                                    </span>
                                    <span className="font-mono text-[10px] text-gray-600 flex-shrink-0">
                                        {Array.isArray(l.blocks) ? `${(l.blocks as unknown[]).length} blocks` : '—'}
                                    </span>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {!isEditing && !isConfirmingDelete && (
                                            <>
                                                <button
                                                    onClick={() => startEdit(l)}
                                                    className="font-mono text-[10px] uppercase tracking-widest text-gray-600 hover:text-gray-300 transition-colors px-2 py-1"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(l.id)}
                                                    className="font-mono text-[10px] uppercase tracking-widest text-red-900 hover:text-red-400 transition-colors px-2 py-1"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                        {isConfirmingDelete && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[10px] text-red-300">Sure?</span>
                                                <button
                                                    onClick={() => handleDelete(l.id)}
                                                    disabled={isDeleting}
                                                    className="font-mono text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors px-2 py-1 disabled:opacity-50"
                                                >
                                                    {isDeleting ? '...' : 'Yes'}
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(null)}
                                                    className="font-mono text-[10px] uppercase tracking-widest text-gray-600 hover:text-gray-300 transition-colors px-2 py-1"
                                                >
                                                    No
                                                </button>
                                            </div>
                                        )}
                                        {isEditing && (
                                            <button
                                                onClick={cancelEdit}
                                                className="font-mono text-[10px] uppercase tracking-widest text-gray-600 hover:text-gray-300 transition-colors px-2 py-1"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Inline editor */}
                                {isEditing && (
                                    <div className="border-t border-dark-400/50 bg-dark-50/80 px-4 py-5 space-y-4">
                                        {/* Title */}
                                        <div>
                                            <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-1.5">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={editDraft.title ?? ''}
                                                onChange={e => setEditDraft(d => ({ ...d, title: e.target.value }))}
                                                className="w-full bg-dark-200 border border-dark-400 px-3 py-2 font-mono text-xs text-gray-200 focus:outline-none focus:border-primary/50"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-1.5">
                                                Description
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={editDraft.description ?? ''}
                                                onChange={e => setEditDraft(d => ({ ...d, description: e.target.value }))}
                                                className="w-full bg-dark-200 border border-dark-400 px-3 py-2 font-mono text-xs text-gray-200 focus:outline-none focus:border-primary/50 resize-none"
                                            />
                                        </div>

                                        {/* is_free toggle */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setEditDraft(d => ({ ...d, is_free: !d.is_free }))}
                                                className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors ${editDraft.is_free ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30' : 'border-dark-400 text-gray-600 hover:border-dark-300'}`}
                                            >
                                                {editDraft.is_free ? '✓ Free' : 'Pro only'}
                                            </button>
                                            <span className="font-mono text-[10px] text-gray-600">Click to toggle access</span>
                                        </div>

                                        {/* Blocks JSON editor */}
                                        <div>
                                            <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-1.5">
                                                Blocks (JSON)
                                            </label>
                                            <textarea
                                                rows={16}
                                                value={blocksText}
                                                onChange={e => {
                                                    setBlocksText(e.target.value)
                                                    setBlocksError(null)
                                                }}
                                                spellCheck={false}
                                                className="w-full bg-dark-200 border border-dark-400 px-3 py-2 font-mono text-[11px] text-gray-300 focus:outline-none focus:border-primary/50 resize-y leading-relaxed"
                                            />
                                            {blocksError && (
                                                <p className="mt-1.5 font-mono text-[10px] text-red-400">{blocksError}</p>
                                            )}
                                        </div>

                                        {/* Save */}
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => handleSave(l.id)}
                                                disabled={saving}
                                                className="border border-primary/40 bg-primary/10 px-5 py-2 font-mono text-[11px] uppercase tracking-widest text-primary-300 hover:bg-primary/20 transition-colors disabled:opacity-50"
                                            >
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            {saveResult && (
                                                <p className={`font-mono text-[11px] ${saveResult.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
                                                    {saveResult}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}
