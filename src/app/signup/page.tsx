'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
    const router = useRouter()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            const msg = error.message.toLowerCase()
            if (msg.includes('user already registered') || msg.includes('already been registered')) {
                setError('An account with this email already exists. Try logging in instead.')
            } else if (msg.includes('password should be')) {
                setError('Password must be at least 6 characters.')
            } else if (msg.includes('invalid email')) {
                setError('Please enter a valid email address.')
            } else if (msg.includes('too many requests')) {
                setError('Too many attempts. Wait a minute and try again.')
            } else {
                setError(error.message)
            }
            setLoading(false)
            return
        }

        // Empty identities = email already exists in the system
        if (data.user?.identities?.length === 0) {
            setError('An account with this email already exists. Try logging in instead.')
            setLoading(false)
            return
        }

        // If no session, email confirmation is required
        if (!data.session) {
            setEmailSent(true)
            setLoading(false)
            return
        }

        router.push('/')
        router.refresh()
    }

    const handleGoogleSignup = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) setError(error.message)
    }

    if (emailSent) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-dark px-4">
                <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-50" />
                <div className="relative z-10 w-full max-w-md text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-primary/20 bg-primary/10">
                        <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                    </div>
                    <h1 className="mb-2 font-display text-3xl text-white tracking-wide">Check your email</h1>
                    <p className="mb-6 text-sm text-gray-400">
                        We sent a confirmation link to <span className="text-white">{email}</span>.<br />
                        Click the link to activate your account and start building.
                    </p>
                    <Link href="/login" className="font-mono text-[11px] uppercase tracking-widest text-primary-300 hover:text-primary transition-colors">
                        Back to login →
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-dark px-4">
            {/* Background grid */}
            <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-50" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05),transparent_70%)]" />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                            <span className="font-mono text-lg font-bold text-primary">V</span>
                        </div>
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold text-white">Create your account</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Start your vibe coding journey today
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-dark-400 bg-dark-100/80 p-8 backdrop-blur-xl">
                    {error && (
                        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-gray-400">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-dark-400 bg-dark-200 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-gray-400">
                                Password
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
                                    Creating account...
                                </span>
                            ) : (
                                'Start Learning Free'
                            )}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-dark-400" />
                        <span className="text-xs text-gray-600">or</span>
                        <div className="h-px flex-1 bg-dark-400" />
                    </div>

                    <button
                        onClick={handleGoogleSignup}
                        className="flex w-full items-center justify-center gap-3 rounded-lg border border-dark-400 bg-dark-200 px-4 py-3 text-sm font-medium text-gray-300 transition-all hover:border-gray-600 hover:bg-dark-300 hover:text-white"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-primary-300 transition-colors hover:text-primary-200">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    )
}
