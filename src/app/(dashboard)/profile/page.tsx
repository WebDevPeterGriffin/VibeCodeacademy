'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

const supabase = createClient()

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [saving, setSaving] = useState(false)
    const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    }, [])

    async function handleUpdatePassword(e: React.FormEvent) {
        e.preventDefault()
        setResult(null)

        if (newPassword.length < 8) {
            setResult({ ok: false, msg: 'Password must be at least 8 characters.' })
            return
        }
        if (newPassword !== confirmPassword) {
            setResult({ ok: false, msg: 'Passwords do not match.' })
            return
        }

        setSaving(true)
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        setSaving(false)

        if (error) {
            setResult({ ok: false, msg: error.message })
        } else {
            setResult({ ok: true, msg: 'Password updated successfully.' })
            setNewPassword('')
            setConfirmPassword('')
        }
    }

    return (
        <div className="animate-fade-in max-w-lg">
            {/* Header */}
            <div className="mb-8 border-b border-dark-400 pb-8">
                <span className="font-mono text-[10px] uppercase tracking-widest text-primary-300">
                    Account
                </span>
                <h1 className="mt-1 font-display text-5xl text-white tracking-wide leading-none">
                    PROFILE
                </h1>
            </div>

            {/* Account info */}
            <div className="border border-dark-400 bg-dark-100 p-6 mb-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-4">
                    Account Info
                </p>
                <div className="space-y-3">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-1">Email</p>
                        <p className="font-mono text-sm text-gray-300">{user?.email ?? '—'}</p>
                    </div>
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-1">Member Since</p>
                        <p className="font-mono text-sm text-gray-300">
                            {user?.created_at
                                ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Update password */}
            <div className="border border-dark-400 bg-dark-100 p-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-5">
                    Update Password
                </p>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-1.5">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="Min. 8 characters"
                            className="w-full bg-dark-200 border border-dark-400 px-3 py-2.5 font-mono text-sm text-gray-200 placeholder-gray-700 focus:outline-none focus:border-primary/50"
                        />
                    </div>

                    <div>
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-1.5">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Repeat new password"
                            className="w-full bg-dark-200 border border-dark-400 px-3 py-2.5 font-mono text-sm text-gray-200 placeholder-gray-700 focus:outline-none focus:border-primary/50"
                        />
                    </div>

                    {result && (
                        <p className={`font-mono text-[11px] ${result.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                            {result.msg}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={saving || !newPassword || !confirmPassword}
                        className="border border-primary/40 bg-primary/10 px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-primary-300 hover:bg-primary/20 transition-colors disabled:opacity-40 min-h-[44px]"
                    >
                        {saving ? 'Saving...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}
