import React from 'react'
import DashboardIntakeForm from '@/components/intake/DashboardIntakeForm.jsx'
import { Mic2, BrainCircuit, Zap } from 'lucide-react'

/* ─── Capability pills shown below the header ─── */
const CAPS = [
  { icon: BrainCircuit, label: 'RAG Context Engine' },
  { icon: Mic2,         label: 'Voice Interview' },
  { icon: Zap,          label: 'Instant Analysis' },
]

function DashboardHeader() {
  return (
    <div className="mb-10 animate-fade-up">
      {/* Glowing top accent line */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <span className="font-mono text-[10px] tracking-widest uppercase text-accent/60">
          Interview Setup
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      </div>

      <h1 className="font-display text-4xl sm:text-5xl text-fog mb-4 leading-tight">
        Ready to practice?<br />
        <span className="text-gradient">Let's build your session.</span>
      </h1>

      <p className="text-slate/60 max-w-lg leading-relaxed text-sm mb-6">
        Upload your résumé and drop the job description. The RAG pipeline will
        embed both and craft hyper-relevant questions with voice-enabled feedback.
      </p>

      {/* Capability chips */}
      <div className="flex flex-wrap gap-2">
        {CAPS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                       bg-accent/8 border border-accent/15 text-accent/80
                       font-mono text-[11px] tracking-wide"
          >
            <Icon size={11} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-2xl w-full px-6 py-16">
      <DashboardHeader />
      <div className="glass-card p-8 animate-fade-up animate-delay-200">
        <DashboardIntakeForm />
      </div>
    </div>
  )
}
