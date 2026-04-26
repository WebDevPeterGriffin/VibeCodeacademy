'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'

const supabase = createClient()

function getInitials(email: string) {
    return email.slice(0, 2).toUpperCase()
}

export default function AppNav() {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [open, setOpen] = useState(false)
    const [signingOut, setSigningOut] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    async function handleSignOut() {
        setSigningOut(true)
        await supabase.auth.signOut()
        router.push('/')
    }

    const navLinks = [
        { href: '/', label: 'Dashboard' },
        { href: '/dashboard/projects', label: 'Projects' },
        { href: '/dashboard/scoreboard', label: 'Scoreboard' },
    ]

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-dark-400/50 bg-dark/80 backdrop-blur-xl">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex h-7 w-7 items-center justify-center bg-primary/10 border border-primary/20">
                        <span className="font-mono text-xs font-bold text-primary">V</span>
                    </div>
                    <span className="font-display text-lg tracking-wide text-white">
                        VibeCode <span className="text-primary-300">Academy</span>
                    </span>
                </Link>

                {/* Center nav links */}
                <div className="flex items-center gap-1">
                    {navLinks.map(link => {
                        const isActive = link.href === '/'
                            ? pathname === '/'
                            : pathname.startsWith(link.href)
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors ${
                                    isActive
                                        ? 'text-white bg-dark-300 border border-dark-400'
                                        : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {link.label}
                            </Link>
                        )
                    })}
                </div>

                {/* Right: profile */}
                <div className="relative flex-shrink-0" ref={dropdownRef}>
                    <button
                        onClick={() => setOpen(o => !o)}
                        className={`flex h-8 w-8 items-center justify-center border font-mono text-[11px] font-bold transition-colors ${
                            open
                                ? 'border-primary/60 bg-primary/10 text-primary-300'
                                : 'border-dark-400 bg-dark-200 text-gray-400 hover:border-dark-300 hover:text-gray-200'
                        }`}
                        aria-label="Profile menu"
                    >
                        {user ? getInitials(user.email ?? 'U') : '?'}
                    </button>

                    {open && (
                        <div className="absolute right-0 top-10 w-64 border border-dark-400 bg-dark-100 shadow-xl z-50">
                            {/* User info */}
                            <div className="px-4 py-3 border-b border-dark-400">
                                <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-0.5">
                                    Signed in as
                                </p>
                                <p className="font-mono text-xs text-gray-300 truncate">
                                    {user?.email ?? '—'}
                                </p>
                            </div>

                            {/* Menu items */}
                            <div className="py-1">
                                <Link
                                    href="/dashboard/profile"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-gray-400 hover:text-white hover:bg-dark-200 transition-colors"
                                >
                                    <span className="text-xs">⚙</span>
                                    Profile Settings
                                </Link>
                            </div>

                            {/* Sign out */}
                            <div className="border-t border-dark-400 py-1">
                                <button
                                    onClick={handleSignOut}
                                    disabled={signingOut}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-red-500 hover:text-red-400 hover:bg-dark-200 transition-colors disabled:opacity-50"
                                >
                                    <span className="text-xs">→</span>
                                    {signingOut ? 'Signing out...' : 'Sign Out'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
