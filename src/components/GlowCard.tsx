'use client'

import { useRef, MouseEvent } from 'react'

interface GlowCardProps {
    children: React.ReactNode
    className?: string
}

export default function GlowCard({ children, className = '' }: GlowCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        cardRef.current.style.setProperty('--mouse-x', `${x}%`)
        cardRef.current.style.setProperty('--mouse-y', `${y}%`)
    }

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className={`glow-card p-6 ${className}`}
        >
            {children}
        </div>
    )
}
