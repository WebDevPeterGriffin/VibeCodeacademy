import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import StartBuildButton from './StartBuildButton'

interface StackItem {
    name: string
    role: string
}

interface Phase {
    phase: number
    title: string
    days: string
}

interface Project {
    id: string
    title: string
    slug: string
    tagline: string
    description: string
    difficulty: string
    estimated_days: number
    category: string
    stack: StackItem[]
    phases: Phase[]
    coming_soon: boolean
}

const STACK_ICONS: Record<string, string> = {
    'Next.js 14': 'N',
    'Remotion': 'R',
    'ElevenLabs API': 'EL',
    'Claude API': 'C',
    'Supabase': 'SB',
    'Tailwind CSS': 'TW',
}

const STACK_COLORS: Record<string, string> = {
    'Next.js 14': 'text-white border-white/20 bg-white/5',
    'Remotion': 'text-blue-400 border-blue-400/20 bg-blue-400/5',
    'ElevenLabs API': 'text-purple-400 border-purple-400/20 bg-purple-400/5',
    'Claude API': 'text-amber-400 border-amber-400/20 bg-amber-400/5',
    'Supabase': 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5',
    'Tailwind CSS': 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5',
}

const OUTCOMES = [
    'Generate short-form videos from any text or topic',
    'Add AI voiceover that sounds like a real person',
    'Customize backgrounds, fonts, and animations',
    'Queue and batch-generate multiple videos at once',
    'Export MP4 files ready to upload anywhere',
    'Run the whole system for ~$0/month',
]

export default async function ProjectOverviewPage({
    params,
}: {
    params: { slug: string }
}) {
    const supabase = createClient()

    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', params.slug)
        .eq('is_published', true)
        .single()

    if (!project || project.coming_soon) notFound()

    const p = project as Project

    // Count lessons that belong to this project via modules
    const { count: lessonCount } = await supabase
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .in(
            'module_id',
            (
                await supabase
                    .from('modules')
                    .select('id')
                    .eq('project_id', p.id)
            ).data?.map((m: { id: string }) => m.id) ?? []
        )

    const phases: Phase[] = Array.isArray(p.phases) ? p.phases : []
    const stack: StackItem[] = Array.isArray(p.stack) ? p.stack : []

    return (
        <div className="animate-fade-in">
            {/* ── Back link ─────────────────────────────────────── */}
            <a
                href="/dashboard/projects"
                className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors"
            >
                ← Projects
            </a>

            {/* ── Two-column layout ─────────────────────────────── */}
            <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-5">

                {/* ── LEFT: The Brief (60%) ──────────────────────── */}
                <div className="lg:col-span-3 space-y-10">

                    {/* Title + badges */}
                    <div>
                        <div className="mb-4 flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400 border border-amber-500/30 bg-amber-500/5 px-2 py-0.5">
                                {p.category}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500 border border-dark-300 px-2 py-0.5">
                                BEGINNER FRIENDLY
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500 border border-dark-300 px-2 py-0.5">
                                ~{p.estimated_days} days
                            </span>
                        </div>
                        <h1 className="font-display text-5xl text-white tracking-wide leading-none sm:text-6xl">
                            {p.title.toUpperCase()}
                        </h1>
                    </div>

                    {/* What you're building */}
                    <div className="border border-dark-400 bg-dark-100 p-6">
                        <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-gray-600">
                            What you&apos;re building
                        </p>
                        <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
                            <p>
                                You&apos;re going to build an automated short-form content machine. Give it a topic, a script,
                                or even just a keyword — it generates a video, adds AI voiceover, and renders it directly
                                in the browser.
                            </p>
                            <p>
                                This is the exact system George built to run{' '}
                                <span className="text-amber-400 font-mono text-[13px]">@web.dev.peter</span> and{' '}
                                <span className="text-amber-400 font-mono text-[13px]">@web.dev.george</span>. The content
                                that gets hundreds of thousands of views on TikTok and Instagram Reels — this is how it&apos;s made.
                            </p>
                            <p className="font-mono text-[12px] text-gray-500 border-l-2 border-dark-300 pl-4">
                                No CapCut. No Opus Clip. No $49/month subscriptions.
                                <br />
                                You build it once. You own it forever.
                            </p>
                        </div>
                    </div>

                    {/* Stack */}
                    <div>
                        <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-gray-600">
                            The Stack
                        </p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {stack.map((item) => (
                                <div
                                    key={item.name}
                                    className="flex items-center gap-3 border border-dark-400 bg-dark-100 p-3"
                                >
                                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center border font-mono text-[10px] font-bold ${STACK_COLORS[item.name] ?? 'text-gray-400 border-dark-300 bg-dark-200'}`}>
                                        {STACK_ICONS[item.name] ?? item.name.slice(0, 2)}
                                    </div>
                                    <div>
                                        <p className="font-mono text-[12px] font-semibold text-white">{item.name}</p>
                                        <p className="font-mono text-[10px] text-gray-500">→ {item.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline phases */}
                    <div>
                        <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-gray-600">
                            Build Timeline
                        </p>
                        <div className="flex flex-col gap-0 sm:flex-row">
                            {phases.map((ph, i) => (
                                <div
                                    key={ph.phase}
                                    className={`relative flex-1 border-l border-t border-b border-dark-400 p-4 ${i === phases.length - 1 ? 'border-r' : ''}`}
                                >
                                    <div className="flex h-6 w-6 items-center justify-center border border-dark-300 bg-dark-200 mb-2">
                                        <span className="font-mono text-[10px] text-gray-500">{ph.phase}</span>
                                    </div>
                                    <p className="font-mono text-[11px] font-semibold text-white leading-tight">{ph.title}</p>
                                    <p className="mt-1 font-mono text-[10px] text-gray-600">{ph.days}</p>
                                    {i < phases.length - 1 && (
                                        <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 hidden sm:block">
                                            <div className="flex h-5 w-5 items-center justify-center bg-dark border border-dark-400">
                                                <span className="font-mono text-[9px] text-gray-600">→</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* George quote */}
                    <blockquote className="border-l-4 border-amber-500 bg-amber-500/5 p-6">
                        <p className="text-sm text-gray-300 leading-relaxed italic">
                            &ldquo;The moment it clicks is when you type a topic — say &lsquo;why Cursor is better than VS Code&rsquo; —
                            hit generate, and 30 seconds later there&apos;s a real video playing in your browser with your voice
                            talking over it. That&apos;s the moment. Everything after that is just refinement.&rdquo;
                        </p>
                        <footer className="mt-4 font-mono text-[11px] uppercase tracking-widest text-amber-400">
                            — George
                        </footer>
                    </blockquote>
                </div>

                {/* ── RIGHT: Outcomes + CTA (40%) ────────────────── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* After completing this */}
                    <div className="border border-dark-400 bg-dark-100 p-6">
                        <p className="mb-5 font-mono text-[10px] uppercase tracking-widest text-gray-600">
                            After completing this project
                        </p>
                        <div className="space-y-3">
                            {OUTCOMES.map((outcome, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <span className="mt-0.5 flex-shrink-0 font-mono text-[12px] text-emerald-400">✓</span>
                                    <p className="text-sm text-gray-300 leading-relaxed">{outcome}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Social proof */}
                    <div className="border border-dark-400/50 bg-dark-100/50 p-5">
                        <p className="text-sm text-gray-400 leading-relaxed italic">
                            &ldquo;Built this in 11 days following the path. First video got 40k views.&rdquo;
                        </p>
                        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-gray-600">
                            — early beta user
                        </p>
                    </div>

                    {/* Sticky CTA area */}
                    <div className="border border-dark-400 bg-dark-100 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-600">
                                Ready to build?
                            </p>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
                                Free to start
                            </span>
                        </div>

                        {lessonCount !== null && lessonCount > 0 && (
                            <p className="font-mono text-[11px] text-gray-500">
                                {lessonCount} lessons across {phases.length} phases
                            </p>
                        )}

                        <StartBuildButton projectId={p.id} />

                        <p className="font-mono text-[10px] text-center text-gray-600 uppercase tracking-widest">
                            You&apos;ll be redirected to your dashboard
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
