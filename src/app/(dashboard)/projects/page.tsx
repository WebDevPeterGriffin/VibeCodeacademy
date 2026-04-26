import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface Project {
    id: string
    title: string
    slug: string
    tagline: string
    difficulty: string
    estimated_days: number
    category: string
    is_published: boolean
    coming_soon: boolean
}

const DIFFICULTY_LABEL: Record<string, string> = {
    beginner: 'BEGINNER FRIENDLY',
    intermediate: 'INTERMEDIATE',
    advanced: 'ADVANCED',
}

export default async function ProjectsPage() {
    const supabase = createClient()

    const { data: projects } = await supabase
        .from('projects')
        .select('id, title, slug, tagline, difficulty, estimated_days, category, is_published, coming_soon')
        .eq('is_published', true)
        .order('coming_soon', { ascending: true })

    const available = (projects ?? []).filter((p: Project) => !p.coming_soon)
    const coming = (projects ?? []).filter((p: Project) => p.coming_soon)
    const all = [...available, ...coming]

    return (
        <div className="animate-fade-in">
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="mb-12 border-b border-dark-400 pb-10">
                <h1 className="font-display text-5xl text-white tracking-wide leading-none sm:text-6xl">
                    BUILD SOMETHING REAL
                </h1>
                <p className="mt-3 font-mono text-[13px] tracking-widest text-primary-300 uppercase">
                    Pick a project. Follow the path. Ship it.
                </p>
                <p className="mt-4 max-w-2xl text-gray-400 text-sm leading-relaxed">
                    Every project is zero to hero. You&apos;ll build the actual thing — not a tutorial version of it.
                </p>
            </div>

            {/* ── Project Grid ──────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {all.map((project: Project) =>
                    project.coming_soon ? (
                        <ComingSoonCard key={project.id} project={project} />
                    ) : (
                        <ProjectCard key={project.id} project={project} />
                    )
                )}
            </div>
        </div>
    )
}

function ProjectCard({ project }: { project: Project }) {
    return (
        <Link href={`/dashboard/projects/${project.slug}`} className="group block">
            <div className="relative h-full border border-dark-400 bg-dark-100 p-6 transition-all duration-300 hover:scale-[1.015] hover:border-amber-500/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.12)]">
                {/* Top badges */}
                <div className="mb-5 flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400 border border-amber-500/30 bg-amber-500/5 px-2 py-0.5">
                        {project.category}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500 border border-dark-300 px-2 py-0.5">
                        {DIFFICULTY_LABEL[project.difficulty] ?? project.difficulty}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500 border border-dark-300 px-2 py-0.5">
                        ~{project.estimated_days} weeks
                    </span>
                    <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-emerald-400 border border-emerald-500/30 bg-emerald-500/5 px-2 py-0.5">
                        AVAILABLE
                    </span>
                </div>

                {/* Title */}
                <h2 className="font-display text-3xl text-white tracking-wide leading-none group-hover:text-amber-300 transition-colors">
                    {project.title}
                </h2>
                <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                    {project.tagline}
                </p>

                {/* What you'll build */}
                <div className="mt-6 space-y-2.5">
                    {[
                        'A browser-based video renderer that generates short-form content automatically',
                        'AI voiceover from any text — your topic, your script, rendered in seconds',
                        'A content pipeline you own and run for $0/month — no CapCut subscription, no Opus Clip, nothing',
                    ].map((point, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                            <span className="mt-0.5 flex-shrink-0 font-mono text-[11px] text-amber-400">→</span>
                            <p className="font-mono text-[11px] text-gray-400 leading-relaxed">{point}</p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-8 flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-amber-400 group-hover:text-amber-300 transition-colors">
                        Start Building →
                    </span>
                    {/* Amber glow accent line */}
                    <div className="h-px w-16 bg-gradient-to-r from-amber-500/40 to-transparent" />
                </div>

                {/* Bottom amber accent bar */}
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-amber-500 transition-all duration-300 group-hover:w-full" />
            </div>
        </Link>
    )
}

function ComingSoonCard({ project }: { project: Project }) {
    return (
        <div className="relative border border-dark-400/40 bg-dark-100/40 p-6 overflow-hidden">
            {/* Blur overlay */}
            <div className="absolute inset-0 backdrop-blur-[1px] bg-dark/20 z-10" />

            {/* Lock icon */}
            <div className="absolute top-4 right-4 z-20 flex h-7 w-7 items-center justify-center border border-dark-300 bg-dark-200">
                <svg className="h-3.5 w-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>

            {/* Coming soon badge */}
            <div className="absolute top-4 left-4 z-20">
                <span className="font-mono text-[10px] uppercase tracking-widest text-gray-600 border border-dark-300 bg-dark px-2 py-0.5">
                    Coming Soon
                </span>
            </div>

            {/* Content (slightly faded) */}
            <div className="opacity-40 mt-6">
                {project.category && (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
                        {project.category}
                    </span>
                )}
                <h2 className="mt-2 font-display text-3xl text-white tracking-wide leading-none">
                    {project.title}
                </h2>
                {project.tagline && (
                    <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                        {project.tagline}
                    </p>
                )}
            </div>
        </div>
    )
}
