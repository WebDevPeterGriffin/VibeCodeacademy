'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

interface Props {
    moduleCount: number
    lessonCount: number
}

type UploadPreview = {
    moduleCount: number
    lessonCount: number
    modules: { title: string; lessonCount: number }[]
}

type UploadResult = {
    inserted?: { modules: number; lessons: number }
    error?: string
}

export default function AdminPanel({ moduleCount: initialModules, lessonCount: initialLessons }: Props) {
    const [moduleCount, setModuleCount] = useState(initialModules)
    const [lessonCount, setLessonCount] = useState(initialLessons)

    // Clear state
    const [clearConfirm, setClearConfirm] = useState(false)
    const [clearing, setClearing] = useState(false)
    const [clearResult, setClearResult] = useState<string | null>(null)

    // Upload state
    const [fileData, setFileData] = useState<unknown | null>(null)
    const [preview, setPreview] = useState<UploadPreview | null>(null)
    const [parseError, setParseError] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    // ── Clear all content ──────────────────────────────────────────────────

    const handleClear = async () => {
        setClearing(true)
        setClearResult(null)
        try {
            const res = await fetch('/api/admin/clear', { method: 'DELETE' })
            const json = await res.json()
            if (!res.ok) {
                setClearResult(`Error: ${json.error}`)
            } else {
                setModuleCount(0)
                setLessonCount(0)
                setPreview(null)
                setFileData(null)
                setUploadResult(null)
                setClearResult('All content cleared.')
            }
        } catch {
            setClearResult('Network error — try again.')
        } finally {
            setClearing(false)
            setClearConfirm(false)
        }
    }

    // ── Parse JSON file ────────────────────────────────────────────────────

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        setParseError(null)
        setPreview(null)
        setFileData(null)
        setUploadResult(null)
        if (!file) return

        const reader = new FileReader()
        reader.onload = (ev) => {
            try {
                const parsed = JSON.parse(ev.target?.result as string)
                if (!Array.isArray(parsed?.modules)) {
                    setParseError('JSON must have a top-level "modules" array.')
                    return
                }
                setFileData(parsed)
                const previewModules = (parsed.modules as { title: string; lessons?: unknown[] }[]).map(m => ({
                    title: m.title,
                    lessonCount: m.lessons?.length ?? 0,
                }))
                setPreview({
                    moduleCount: parsed.modules.length,
                    lessonCount: previewModules.reduce((s: number, m) => s + m.lessonCount, 0),
                    modules: previewModules,
                })
            } catch {
                setParseError('Could not parse file — make sure it is valid JSON.')
            }
        }
        reader.readAsText(file)
    }

    // ── Upload ─────────────────────────────────────────────────────────────

    const handleUpload = async () => {
        if (!fileData) return
        setUploading(true)
        setUploadResult(null)
        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fileData),
            })
            const json: UploadResult = await res.json()
            setUploadResult(json)
            if (json.inserted) {
                setModuleCount(m => m + json.inserted!.modules)
                setLessonCount(l => l + json.inserted!.lessons)
            }
        } catch {
            setUploadResult({ error: 'Network error — try again.' })
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-8 max-w-2xl">

            {/* ── Back link ─────────────────────────────────────────────── */}
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-gray-600 hover:text-gray-300 transition-colors"
            >
                ← Back to Workspace
            </Link>

            {/* ── Current stats ─────────────────────────────────────────── */}
            <div className="border border-dark-400 bg-dark-100 p-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-4">
                    Current Database State
                </p>
                <div className="flex gap-8">
                    <div>
                        <p className="font-display text-4xl text-white">{moduleCount}</p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mt-1">Modules</p>
                    </div>
                    <div>
                        <p className="font-display text-4xl text-white">{lessonCount}</p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mt-1">Lessons</p>
                    </div>
                </div>
            </div>

            {/* ── Clear all ─────────────────────────────────────────────── */}
            <div className="border border-red-900/40 bg-red-950/20 p-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-red-400 mb-2">
                    Danger Zone
                </p>
                <p className="text-sm text-gray-400 leading-[1.7] mb-4">
                    Deletes all modules, lessons, and user progress from the database. This cannot be undone.
                </p>

                {!clearConfirm ? (
                    <button
                        onClick={() => { setClearConfirm(true); setClearResult(null) }}
                        className="border border-red-900/60 px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-red-400 hover:border-red-700 hover:bg-red-950/40 transition-colors min-h-[44px]"
                    >
                        Clear All Content
                    </button>
                ) : (
                    <div className="flex items-center gap-3">
                        <p className="font-mono text-[11px] text-red-300">Are you sure?</p>
                        <button
                            onClick={handleClear}
                            disabled={clearing}
                            className="border border-red-700 bg-red-900/30 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-red-300 hover:bg-red-900/50 transition-colors disabled:opacity-50 min-h-[44px]"
                        >
                            {clearing ? 'Clearing...' : 'Yes, Delete Everything'}
                        </button>
                        <button
                            onClick={() => setClearConfirm(false)}
                            className="font-mono text-[11px] uppercase tracking-widest text-gray-600 hover:text-gray-300 transition-colors px-2 min-h-[44px]"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {clearResult && (
                    <p className={`mt-3 font-mono text-[11px] ${clearResult.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
                        {clearResult}
                    </p>
                )}
            </div>

            {/* ── JSON Upload ───────────────────────────────────────────── */}
            <div className="border border-dark-400 bg-dark-100 p-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-2">
                    Upload Lessons (JSON)
                </p>
                <p className="text-sm text-gray-500 leading-[1.7] mb-5">
                    Upload a JSON file with modules and lessons. Upserts by slug — safe to re-upload.
                </p>

                {/* Format hint */}
                <details className="mb-5">
                    <summary className="font-mono text-[10px] uppercase tracking-widest text-gray-600 cursor-pointer hover:text-gray-300 transition-colors">
                        JSON format example →
                    </summary>
                    <pre className="mt-3 bg-dark-200 border border-dark-400 p-4 font-mono text-[10px] text-gray-400 leading-[1.8] overflow-x-auto whitespace-pre-wrap">
                        {`{
  "modules": [
    {
      "title": "Foundation",
      "slug": "foundation",
      "description": "Module description here",
      "order_index": 1,
      "is_free": true,
      "lessons": [
        {
          "title": "What is Vibe Coding",
          "slug": "what-is-vibe-coding",
          "description": "Lesson description here",
          "order_index": 1,
          "is_free": true,
          "blocks": [
            {
              "type": "concept",
              "title": "Where this came from",
              "content": "Use \\\\n\\\\n for line breaks."
            },
            {
              "type": "prompt",
              "title": "See the shift",
              "instruction": "Do this first:",
              "prompt": "Paste this exact prompt...",
              "instruction_after": "Then do this:",
              "it_worked_reaction": "Optional."
            }
          ]
        }
      ]
    }
  ]
}`}
                    </pre>
                </details>

                {/* File picker */}
                <div
                    onClick={() => fileRef.current?.click()}
                    className="border border-dashed border-dark-400 hover:border-primary/40 p-8 text-center cursor-pointer transition-colors mb-4"
                >
                    <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500">
                        {preview ? `✓ ${preview.moduleCount} modules, ${preview.lessonCount} lessons ready` : 'Click to choose a .json file'}
                    </p>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".json,application/json"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                {/* Parse error */}
                {parseError && (
                    <p className="font-mono text-[11px] text-red-400 mb-4">{parseError}</p>
                )}

                {/* Preview */}
                {preview && (
                    <div className="border border-dark-400 bg-dark-200 p-4 mb-4 space-y-1">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-2">Preview</p>
                        {preview.modules.map((m, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="font-mono text-xs text-gray-300">{m.title}</span>
                                <span className="font-mono text-[10px] text-gray-600">{m.lessonCount} lessons</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload button */}
                {preview && !uploadResult?.inserted && (
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="border border-primary/40 bg-primary/10 px-6 py-2.5 font-mono text-[11px] uppercase tracking-widest text-primary-300 hover:bg-primary/20 transition-colors disabled:opacity-50 min-h-[44px]"
                    >
                        {uploading ? 'Uploading...' : `Upload ${preview.moduleCount} Modules →`}
                    </button>
                )}

                {/* Result */}
                {uploadResult && (
                    <div className={`mt-4 border p-4 font-mono text-[11px] ${uploadResult.error ? 'border-red-900/40 text-red-400' : 'border-emerald-500/30 text-emerald-400'}`}>
                        {uploadResult.error
                            ? `Error: ${uploadResult.error}`
                            : `✓ Uploaded ${uploadResult.inserted?.modules} modules, ${uploadResult.inserted?.lessons} lessons`
                        }
                    </div>
                )}
            </div>
        </div>
    )
}
