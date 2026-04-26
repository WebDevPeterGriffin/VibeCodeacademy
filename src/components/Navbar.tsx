'use client'

import Link from 'next/link'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

const supabase = createClient()

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-dark-400/50 bg-dark/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                        <span className="font-mono text-sm font-bold text-primary">V</span>
                    </div>
                    <span className="font-display text-xl tracking-wide text-white">
                        VibeCode <span className="text-primary-300">Academy</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link
                        href="/#features"
                        className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
                    >
                        What&apos;s Inside
                    </Link>
                    <Link
                        href="/#preview"
                        className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
                    >
                        The Path
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    {user ? (
                        <Link href="/dashboard" className="btn-primary text-sm py-2 px-4">
                            My Workspace
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm text-gray-400 transition-colors hover:text-white"
                            >
                                Log in
                            </Link>
                            <Link href="/signup" className="btn-primary text-sm py-2 px-4">
                                Start Building Free
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
