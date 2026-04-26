import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'

export default async function LandingPage() {
  const supabase = createClient()

  interface Lesson {
    id: string;
    title: string;
    slug: string;
    description: string;
    is_free: boolean;
    modules?: { title: string };
  }

  const { data: { user } } = await supabase.auth.getUser()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*, modules:module_id(title, slug)')
    .order('order_index')
    .limit(4)

  return (
    <main className="min-h-screen bg-dark">
      {/* Skip to main content (keyboard / screen-reader nav) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:outline-none"
      >
        Skip to content
      </a>

      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section id="main-content" className="relative flex min-h-[90vh] items-center justify-center overflow-hidden pt-16">
        {/* Backgrounds */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05),transparent_70%)]" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center md:py-28">
          {/* Eyebrow badge with George's photo above the fold */}
          <div className="mb-8 inline-flex items-center gap-3 border border-dark-400 bg-dark-100 pl-1 pr-4 py-1">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden border border-primary/30 bg-dark-200">
              <Image
                src="/george.jpg"
                alt="Web.Dev.George"
                fill
                className="object-cover object-top"
                sizes="32px"
              />
            </div>
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-gray-400">
              @web.dev.george · 30K+ followers
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-display text-5xl leading-none tracking-tight text-white sm:text-6xl md:text-8xl">
            Own Your Stack.{' '}
            <br className="hidden md:block" />
            <span className="text-gradient">Own Your Income.</span>
          </h1>

          {/* Sub-copy */}
          <p className="mx-auto mb-4 max-w-2xl text-lg leading-[1.7] text-gray-400 md:text-xl">
            VibeCode Academy is where real engineers teach real builds.
            No SaaS subscriptions. No rented tools. No theory.
          </p>
          <p className="mx-auto mb-10 max-w-xl text-base leading-[1.7] text-gray-500">
            Every course is owned and taught by the engineer who built the thing —
            not a course factory.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href={user ? '/dashboard' : '/signup'}
              className="btn-primary min-h-[44px] px-8 py-3 text-base"
            >
              {user ? 'Go to My Workspace' : 'Start Building Free'}
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link href="#contributors" className="btn-secondary min-h-[44px] px-8 py-3 text-base">
              Meet the Engineers
            </Link>
          </div>
          {/* No-subscription signal */}
          <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-gray-600">
            One-time access · No subscription · Own it forever
          </p>

          {/* SaaS Tax visual */}
          <div className="mx-auto mt-20 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch sm:gap-8">
            {/* Left: what you're paying */}
            <div className="border border-dark-400 bg-dark-100 p-6 text-left">
              <h3 className="mb-4 border-b border-dark-400 pb-3 font-mono text-xs uppercase tracking-widest text-gray-500">
                What you&apos;re renting
              </h3>
              <ul className="space-y-3 font-mono text-sm text-gray-400" role="list">
                {[
                  ['Webflow', '$29/mo'],
                  ['Bubble', '$32/mo'],
                  ['Zapier', '$49/mo'],
                  ['Typeform', '$25/mo'],
                ].map(([tool, price]) => (
                  <li key={tool} className="flex justify-between line-through decoration-red-500/50">
                    <span>{tool}</span><span>{price} ✕</span>
                  </li>
                ))}
                <li className="flex justify-between border-t border-dark-400 pt-4 text-red-400">
                  <span>Monthly drain</span><span>$135/mo</span>
                </li>
              </ul>
            </div>

            {/* Divider arrow */}
            <div className="flex items-center justify-center text-dark-400" aria-hidden="true">
              <svg className="h-6 w-6 rotate-90 sm:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>

            {/* Right: what you could own */}
            <div className="border border-primary/20 bg-primary/5 p-6 text-left shadow-glow">
              <h3 className="mb-4 border-b border-primary/20 pb-3 font-mono text-xs uppercase tracking-widest text-primary">
                What you could own
              </h3>
              <div className="flex h-[116px] items-center justify-center">
                <p className="text-center font-display text-3xl tracking-wide text-white">
                  Built it myself.
                  <br />
                  <span className="text-primary-300">$0/mo ✓</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ─────────────────────────────────────────────── */}
      <div className="overflow-hidden border-y border-dark-400/50 bg-dark-50 py-3" aria-hidden="true">
        <div className="flex whitespace-nowrap animate-[marquee_24s_linear_infinite] motion-reduce:animate-none">
          {Array(2).fill(
            'Landing page generator · Discord bot · CRM · AI chatbot · Booking system · Email automator · Portfolio site · Client portal · Waitlist page · Slack bot ·'
          ).map((text, i) => (
            <span key={i} className="mx-4 font-mono text-xs uppercase tracking-widest text-primary/60">
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* ─── CONTRIBUTORS ────────────────────────────────────────── */}
      <section id="contributors" className="relative border-b border-dark-400/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          {/* Section header */}
          <div className="mb-4 text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-primary-300">The Engineers</span>
          </div>
          <h2 className="mb-4 text-center font-display text-4xl leading-tight text-white md:text-6xl">
            Real builders.
            <br />
            <span className="text-gradient">Real courses.</span>
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-center text-base leading-[1.7] text-gray-400">
            Every course on this platform is created and owned by the engineer
            who built it — not a course factory, not a middleman.
          </p>

          {/* Grid — 1 col mobile · 2 col tablet · 4 col desktop */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {/* George — active contributor */}
            <article className="group flex flex-col border border-primary/30 bg-dark-100 shadow-glow">
              <div className="relative aspect-[4/3] overflow-hidden bg-dark-200">
                <Image
                  src="/george.jpg"
                  alt="Web.Dev.George — Founder and first instructor at VibeCode Academy"
                  fill
                  className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-dark-100 to-transparent" aria-hidden="true" />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary-300">Founder</span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" aria-hidden="true" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-primary-300">Live</span>
                  </span>
                </div>

                <p className="font-display text-xl tracking-wide text-white">Web.Dev.George</p>
                <p className="mb-3 mt-0.5 font-mono text-[10px] uppercase tracking-widest text-gray-500">
                  @web.dev.george · 30K+ followers
                </p>
                <p className="flex-1 text-xs leading-relaxed text-gray-400">
                  Full-stack builder. Creator of the VibeCode Bible.
                  Ships real apps with AI every week and teaches you the exact workflow.
                </p>

                <div className="mt-4 border-t border-dark-400 pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
                    Track: AI-Powered Full Stack
                  </span>
                </div>
              </div>
            </article>

            {/* Coming Soon × 3 — opacity removed from wrapper for contrast compliance */}
            {[
              { role: 'Backend Engineer', track: 'Systems & APIs' },
              { role: 'AI / Automation', track: 'Agents & Workflows' },
              { role: 'Design Engineer', track: 'UI & Product' },
            ].map((slot) => (
              <article
                key={slot.role}
                className="flex flex-col border border-dark-400/60 bg-dark-100"
                aria-label={`${slot.role} — Coming soon`}
              >
                {/* Black placeholder with question mark */}
                <div className="relative flex aspect-[4/3] items-center justify-center bg-dark-50" aria-hidden="true">
                  <div className="flex h-16 w-16 items-center justify-center border border-dark-400 bg-dark-200">
                    <span className="font-display text-4xl text-dark-400">?</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-gray-600">Contributor</span>
                    <span className="border border-dark-300 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-gray-600">
                      Coming Soon
                    </span>
                  </div>

                  <p className="font-display text-xl tracking-wide text-gray-600">{slot.role}</p>
                  <p className="mb-3 mt-0.5 font-mono text-[10px] uppercase tracking-widest text-gray-700">
                    ???
                  </p>
                  <p className="flex-1 text-xs leading-relaxed text-gray-600">
                    A working engineer with real production experience.
                    Their course is currently in development.
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-dark-400/60 pt-4">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-gray-600">
                      Track: {slot.track}
                    </span>
                    <Link
                      href="/signup"
                      className="font-mono text-[10px] uppercase tracking-widest text-primary-300/60 transition-colors hover:text-primary-300"
                    >
                      Notify me →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Engineer recruitment CTA */}
          <div className="mt-12 flex flex-col gap-6 border border-dark-400 bg-dark-100 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-primary-300">Are you an engineer?</p>
              <h3 className="font-display text-2xl tracking-wide text-white">Want to own a course here?</h3>
              <p className="mt-2 max-w-md text-sm leading-[1.7] text-gray-400">
                If you&apos;ve built real things and can teach the workflow — not the theory — let&apos;s talk.
              </p>
            </div>
            <Link
              href="https://www.instagram.com/web.dev.george/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="DM Web.Dev.George on Instagram"
              className="btn-secondary min-h-[44px] shrink-0 whitespace-nowrap px-6 py-3 text-sm"
            >
              DM on Instagram
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="relative border-b border-dark-400/30 bg-dark py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-primary-300">Student Outcomes</span>
          </div>
          <h2 className="mb-16 text-center font-display text-4xl tracking-wide text-white md:text-5xl">
            Builders, not watchers.
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote: "I shipped my first client portal in a weekend. No Bubble, no Webflow. Just Next.js and Supabase — following George's exact workflow.",
                name: "Marcus T.",
                role: "Freelance Developer",
                metric: "1st app shipped"
              },
              {
                quote: "The VibeCode workflow files dropped straight into my project. I stopped fighting my AI assistant and started directing it.",
                name: "Priya S.",
                role: "Indie Hacker",
                metric: "Cancelled 3 SaaS tools"
              },
              {
                quote: "Every other course explains concepts. This one made me build. I now have a working AI chatbot in production.",
                name: "Daniel R.",
                role: "Software Engineer",
                metric: "Deployed to production"
              },
            ].map(({ quote, name, role, metric }) => (
              <figure key={name} className="flex flex-col border border-dark-400 bg-dark-100 p-6">
                <blockquote className="mb-6 flex-1 text-sm leading-[1.7] text-gray-300">
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <figcaption className="border-t border-dark-400 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs text-white">{name}</p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-gray-500">{role}</p>
                    </div>
                    <span className="border border-primary/20 bg-primary/5 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-primary-300">
                      {metric}
                    </span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHAT YOU GET ─────────────────────────────────────────── */}
      <section id="features" className="relative bg-dark-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-primary-300">What You Get</span>
          </div>
          <h2 className="mb-16 text-center font-display text-4xl tracking-wide text-white md:text-5xl">
            Three things.{' '}
            <span className="text-gradient">All you need.</span>
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {/* The Path */}
            <div className="flex flex-col border border-dark-400 bg-dark-100 p-6">
              <div className="mb-6 border-b border-dark-400 pb-4">
                <h3 className="font-display text-2xl tracking-wide text-white">The Path</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-400">Zero to shipping real apps.</p>
              </div>
              <div className="relative ml-3 space-y-6 border-l-2 border-dark-300 pb-2">
                {[
                  { num: '01', label: 'Foundations', desc: 'Environment config & AI prompting', color: 'bg-primary', textColor: 'text-primary' },
                  { num: '02', label: 'Tech Stack', desc: 'Next.js, Supabase, Tailwind setup', color: 'bg-primary', textColor: 'text-primary' },
                  { num: '03', label: 'First Build', desc: 'Shipping a production app', color: 'bg-dark-300', textColor: 'text-gray-500' },
                ].map(({ num, label, desc, color, textColor }) => (
                  <div key={num} className="relative pl-6">
                    <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-dark-100 ${color}`} aria-hidden="true" />
                    <h4 className={`mb-1 font-mono text-xs uppercase tracking-wider ${textColor}`}>{num} {label}</h4>
                    <p className="text-sm text-gray-400">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* The Workflows */}
            <div className="flex flex-col border border-dark-400 bg-dark-100 p-6">
              <div className="mb-6 border-b border-dark-400 pb-4">
                <h3 className="font-display text-2xl tracking-wide text-white">The Workflows</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-400">Clonable prompt rules that drop into any project.</p>
              </div>
              <div className="space-y-3">
                {[
                  { name: '.cursorrules_base', desc: 'AI behavior baseline', active: true },
                  { name: 'auth_supabase_v2.md', desc: 'Full auth scaffold', active: false },
                  { name: 'architect_prompt.md', desc: 'System design prompts', active: false },
                ].map(({ name, desc, active }) => (
                  <div
                    key={name}
                    className={`flex cursor-default items-center gap-3 border bg-dark-200 p-3 transition-colors ${active ? 'border-primary/30' : 'border-dark-300'}`}
                  >
                    <svg
                      className={`h-5 w-5 shrink-0 ${active ? 'text-primary' : 'text-gray-500'}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <div>
                      <span className="block font-mono text-xs text-gray-300">{name}</span>
                      <span className="mt-0.5 block font-mono text-[10px] text-gray-600">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ask George */}
            <div className="flex flex-col overflow-hidden border border-dark-400 bg-dark-100 p-6">
              <div className="mb-6 border-b border-dark-400 pb-4">
                <h3 className="font-display text-2xl tracking-wide text-white">Ask George</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-400">Real answers from real experience.</p>
              </div>
              <div className="flex flex-1 flex-col gap-4 border border-dark-300 bg-dark-50 p-3 text-sm" role="log" aria-label="Sample chat with Ask George">
                <div className="self-end max-w-[90%] rounded-2xl rounded-tr-sm border border-primary/20 bg-primary/20 px-4 py-2 text-primary-100">
                  <p className="leading-snug">Cursor keeps losing context on my large files.</p>
                </div>
                <div className="self-start max-w-[95%] rounded-2xl rounded-tl-sm border border-dark-300 bg-dark-200 px-4 py-2 text-gray-300">
                  <p className="text-xs leading-snug">
                    Split the file. Anything over 300 lines, break into modules. Claude handles smaller chunks better — you stop getting &quot;I don&apos;t see that function&quot; nonsense.
                  </p>
                </div>
              </div>
              <div className="mt-4 border-t border-dark-400/50 pt-3">
                <p className="text-center font-mono text-[10px] uppercase tracking-wider text-primary-300/80">
                  No docs. No sponsorships. No BS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COURSE PREVIEW ───────────────────────────────────────── */}
      <section id="preview" className="relative border-t border-dark-400/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-primary-300">Inside the Academy</span>
          </div>
          <h2 className="mb-4 text-center font-display text-4xl tracking-wide text-white md:text-5xl">
            Every lesson ends with{' '}
            <span className="text-gradient">something shipped.</span>
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-center text-base leading-[1.7] text-gray-400">
            Not just watched. Not just understood. Shipped.
          </p>

          {/* Lesson cards — now clickable */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {lessons?.map((lesson: Lesson, i: number) => (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.slug}`}
                className="group relative flex flex-col overflow-hidden border border-dark-400 bg-dark-100 transition-colors hover:border-primary/30"
              >
                <article className="flex flex-1 flex-col p-5">
                  <div className="mb-4 flex items-center justify-between border-b border-dark-400/50 pb-3">
                    <span className="font-mono text-xs text-gray-500">
                      MOD_{String(i + 1).padStart(2, '0')}
                    </span>
                    {lesson.is_free ? (
                      <span className="border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-400">
                        FREE
                      </span>
                    ) : (
                      <svg className="h-3.5 w-3.5 text-gray-500" fill="currentColor" viewBox="0 0 24 24" aria-label="Premium content">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white transition-colors group-hover:text-primary-300">
                    {lesson.title}
                  </h3>
                  <p className="border-l-2 border-primary/30 pl-3 font-sans text-sm leading-[1.7] text-gray-400">
                    {lesson.description}
                  </p>
                </article>
              </Link>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href={user ? '/dashboard' : '/signup'}
              className="btn-primary min-h-[44px] px-8 py-3 text-base"
            >
              {user ? 'Go to My Workspace' : 'Start Building Free'}
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────── */}
      <section className="relative border-t border-dark-400/30 bg-dark-50 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-4 text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-primary-300">Common Questions</span>
          </div>
          <h2 className="mb-16 text-center font-display text-4xl tracking-wide text-white">
            No fluff. Real answers.
          </h2>
          <div className="divide-y divide-dark-400">
            {[
              {
                q: "Is this for beginners?",
                a: "If you can write basic HTML/CSS and understand what a function is — you're ready. The Foundation module assumes no framework experience. Everything is taught in context, not in isolation."
              },
              {
                q: "How is this different from YouTube tutorials?",
                a: "YouTube shows you what was built. This teaches you the workflow that builds anything. You get the exact prompt files, AI instructions, and decision frameworks — not just the outcome."
              },
              {
                q: "What if I get stuck?",
                a: "Every lesson has an Ask George button. The AI assistant is trained on George's actual experience — not generic docs. Step-by-step checkpoints are built into every lesson."
              },
              {
                q: "Is there a subscription?",
                a: "No. One-time access to the full curriculum. No monthly billing. No renewal. Own your education the same way you'll own your stack."
              },
              {
                q: "What stack does this use?",
                a: "Next.js 14 (App Router), Supabase for auth and database, Tailwind CSS for styling, and TypeScript. The same stack George ships real client work with every week."
              },
            ].map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg tracking-wide text-white">
                  {q}
                  <svg
                    className="h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 group-open:rotate-45"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </summary>
                <p className="mt-4 max-w-2xl text-sm leading-[1.7] text-gray-400">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-dark-400/30 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center border border-primary/20 bg-primary/10">
                <span className="font-mono text-xs font-bold text-primary" aria-hidden="true">V</span>
              </div>
              <span className="text-sm font-medium text-gray-500">VibeCode Academy</span>
            </div>
            <nav className="flex items-center gap-6" aria-label="Footer navigation">
              <Link href="#" className="text-xs text-gray-600 transition-colors hover:text-gray-400">Terms</Link>
              <Link href="#" className="text-xs text-gray-600 transition-colors hover:text-gray-400">Privacy</Link>
              <Link
                href="https://instagram.com/web.dev.george"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-600 transition-colors hover:text-primary-300"
              >
                @web.dev.george
              </Link>
            </nav>
            <p className="text-xs text-gray-700">© 2026 VibeCode Academy. Built with vibes.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
