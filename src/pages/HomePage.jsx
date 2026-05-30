import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText, BrainCircuit, MessageSquareCode, Zap } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge.jsx'

/* ─── Feature card data ─────────────────────────────────────── */
const FEATURES = [
  {
    icon: FileText,
    title: 'Resume Parsing',
    body: 'Drop your PDF. The system extracts skills, experience, and projects to build a targeted question bank.',
    step: 'Step 1',
  },
  {
    icon: BrainCircuit,
    title: 'RAG-Powered Context',
    body: 'Your resume and the job description are embedded and retrieved in real-time to craft hyper-relevant questions.',
    step: 'Step 2',
  },
  {
    icon: MessageSquareCode,
    title: 'Live Mock Interview',
    body: 'A conversational AI interviewer adapts follow-ups based on your answers, just like the real thing.',
    step: 'Step 3',
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    body: 'Receive structured post-interview analysis: strengths, blind spots, and suggested study topics.',
    step: 'Step 4',
  },
]

/* ─── Lightning Background with cursor-reveal effect ────────── */
function LightningBackground() {
  const maskRef = useRef(null)
  const spotRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef(null)

  const onMouseMove = useCallback((e) => {
    spotRef.current = { x: e.clientX, y: e.clientY }

    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      if (!maskRef.current) return
      const { x, y } = spotRef.current
      // Update CSS custom properties for both the reveal mask and the glass shimmer
      maskRef.current.style.setProperty('--mx', `${x}px`)
      maskRef.current.style.setProperty('--my', `${y}px`)
    })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [onMouseMove])

  return (
    <div
      ref={maskRef}
      className="lightning-bg-wrapper"
      aria-hidden="true"
      style={{ '--mx': '-9999px', '--my': '-9999px' }}
    >
      {/* Base image — very faint, always present */}
      <div className="lightning-base" />

      {/* Cursor-revealed glowing layer */}
      <div className="lightning-reveal" />

      {/* Glassmorphic shimmer ring at cursor */}
      <div className="lightning-glass-ring" />
    </div>
  )
}

/* ─── Hero ───────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">

      <div className="animate-fade-up">
        <StatusBadge variant="accent" className="mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          Now in Development
        </StatusBadge>
      </div>

      <h1 className="animate-fade-up animate-delay-100 font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight text-gradient mb-6">
        Ace your next<br />
        technical interview.
      </h1>

      <p className="animate-fade-up animate-delay-200 max-w-xl mx-auto text-slate text-lg leading-relaxed mb-10">
        Upload your résumé, paste a job description, and step into a{' '}
        <span className="text-fog/80">RAG-powered mock interview</span> tailored
        exactly to the role you're targeting.
      </p>

      <div className="animate-fade-up animate-delay-300 flex flex-wrap items-center justify-center gap-3">
        <Link to="/dashboard" className="btn-primary text-base px-6 py-3">
          Open Dashboard
          <ArrowRight size={16} />
        </Link>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-base px-6 py-3"
        >
          View on GitHub
        </a>
      </div>

      <TerminalPreview />
    </section>
  )
}

function TerminalPreview() {
  return (
    <div className="animate-fade-up animate-delay-400 mt-16 mx-auto max-w-2xl glass-card p-0 overflow-hidden text-left">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
        <span className="w-3 h-3 rounded-full bg-pulse/70" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
        <span className="w-3 h-3 rounded-full bg-emerald-500/50" />
        <span className="ml-3 font-mono text-xs text-slate">interview_session.log</span>
      </div>
      <div className="p-5 font-mono text-sm space-y-2">
        <p>
          <span className="text-accent">system</span>
          <span className="text-slate mx-2">›</span>
          <span className="text-fog/80">Loading resume context...</span>
          <span className="text-emerald-400 ml-2">✓</span>
        </p>
        <p>
          <span className="text-accent">system</span>
          <span className="text-slate mx-2">›</span>
          <span className="text-fog/80">Matching job description (Senior React Engineer)</span>
          <span className="text-emerald-400 ml-2">✓</span>
        </p>
        <p>
          <span className="text-pulse">interviewer</span>
          <span className="text-slate mx-2">›</span>
          <span className="text-fog/90">Tell me about a time you optimised a React render cycle at scale.</span>
        </p>
        <p className="flex items-center gap-1">
          <span className="text-slate">you</span>
          <span className="text-slate mx-2">›</span>
          <span className="text-slate/60 italic">waiting for your response</span>
          <span className="animate-blink text-accent font-bold">|</span>
        </p>
      </div>
    </div>
  )
}

/* ─── Features ───────────────────────────────────────────────── */
function FeaturesSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="text-center mb-14">
        <p className="label-mono mb-3">How it works</p>
        <h2 className="font-display text-3xl sm:text-4xl text-fog">
          Built for depth, not breadth.
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map(({ icon: Icon, title, body, step }, i) => (
          <GlowCard
            key={title}
            icon={Icon}
            title={title}
            body={body}
            step={step}
            delay={i * 100}
          />
        ))}
      </div>
    </section>
  )
}

function GlowCard({ icon: Icon, title, body, step, delay }) {
  const cardRef = useRef(null)

  function handleMouseMove(e) {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--glow-x', `${x}px`)
    card.style.setProperty('--glow-y', `${y}px`)
    card.style.setProperty('--glow-opacity', '1')
  }

  function handleMouseLeave() {
    const card = cardRef.current
    if (!card) return
    card.style.setProperty('--glow-opacity', '0')
  }

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="glow-card glass-card p-6 flex flex-col gap-4 transition-colors duration-300 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="glow-spot" />

      <div className="flex items-start justify-between relative z-10">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 border border-accent/15">
          <Icon size={18} className="text-accent" />
        </span>
        <StatusBadge variant="accent">{step}</StatusBadge>
      </div>
      <div className="relative z-10">
        <h3 className="font-display text-lg text-fog mb-1.5">{title}</h3>
        <p className="text-slate text-sm leading-relaxed">{body}</p>
      </div>
    </article>
  )
}

/* ─── Page export ───────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="relative">
      <LightningBackground />
      <HeroSection />
      <FeaturesSection />
    </div>
  )
}
