'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [ready, setReady] = useState(false)
    const router = useRouter()

    // Supabase puts the recovery session in the URL hash — listen for it
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setReady(true)
            }
        })
        return () => subscription.unsubscribe()
    }, [])

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirm) {
            setError('Passwords do not match.')
            return
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }

        setLoading(true)

        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            setError('Failed to update password. Try requesting a new reset link.')
            setLoading(false)
            return
        }

        router.push('/')
    }

    if (!ready) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-dark px-4">
                <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-50" />
                <div className="relative z-10 text-center">
                    <svg className="mx-auto h-8 w-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-gray-600">
                        Verifying reset link...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-dark px-4">
            <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-50" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05),transparent_70%)]" />

            <div className="relative z-10 w-full max-w-md">
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                            <span className="font-mono text-lg font-bold text-primary">V</span>
                        </div>
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold text-white">Set new password</h1>
                    <p className="mt-1 text-sm text-gray-500">Choose a strong password for your account</p>
                </div>

                <div className="rounded-2xl border border-dark-400 bg-dark-100/80 p-8 backdrop-blur-xl">
                    {error && (
                        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleReset} className="space-y-4">
                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-gray-400">
                                New password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-dark-400 bg-dark-200 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                                placeholder="Min. 6 characters"
                                required
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm" className="mb-1.5 block text-xs font-medium text-gray-400">
                                Confirm password
                            </label>
                            <input
                                id="confirm"
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                className="w-full rounded-lg border border-dark-400 bg-dark-200 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                                placeholder="Repeat your password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-sm disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Updating...
                                </span>
                            ) : (
                                'Update password'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
