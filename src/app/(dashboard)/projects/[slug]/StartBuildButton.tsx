'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function StartBuildButton({ projectId }: { projectId: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleStart() {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/projects/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId }),
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error ?? 'Failed to start project')
            }
            router.push('/dashboard')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
            setLoading(false)
        }
    }

    return (
        <div className="space-y-2">
            <button
                onClick={handleStart}
                disabled={loading}
                className="w-full border border-amber-500 bg-amber-500/10 px-8 py-4 font-mono text-sm uppercase tracking-widest text-amber-300 transition-all hover:bg-amber-500/20 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Starting...' : 'Start the Build →'}
            </button>
            {error && (
                <p className="font-mono text-[11px] text-red-400 text-center">{error}</p>
            )}
        </div>
    )
}
