import React from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

/* ─── Animated SVG lightning bolt ─── */
function LightningBolt({ className = '' }) {
  return (
    <svg
      width="18" height="26" viewBox="0 0 18 26"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10 1L1 15h7l-1 10 9-14h-7L10 1z"
        stroke="currentColor" strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round"
        fill="rgba(147,197,253,0.15)"
        strokeDasharray="400"
        style={{
          animation: 'bolt-slide 0.9s ease-out infinite',
        }}
      />
    </svg>
  )
}

/* ─── Lightning loading overlay ─── */
function LightningLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-2">
      {/* Pulsing ring with bolt inside */}
      <div
        className="relative flex items-center justify-center
                   w-14 h-14 rounded-full
                   bg-accent/10 border border-accent/30
                   lightning-loader-ring"
      >
        {/* Orbiting sparks */}
        {[0, 72, 144, 216, 288].map((deg, i) => (
          <span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-300/70"
            style={{
              transform: `rotate(${deg}deg) translateX(26px)`,
              animation: `bolt-flicker ${0.6 + i * 0.1}s ease-in-out ${i * 0.12}s infinite`,
            }}
          />
        ))}
        {/* Center bolt */}
        <LightningBolt className="text-blue-300 drop-shadow-[0_0_6px_rgba(147,197,253,0.8)]" />
      </div>

      {/* Animated text */}
      <div className="flex flex-col items-center gap-1">
        <span className="lightning-loader-text font-mono text-xs tracking-widest uppercase">
          Initialising session…
        </span>
        {/* Travelling dots */}
        <div className="flex gap-1 mt-1">
          {[0, 1, 2, 3, 4].map(i => (
            <span
              key={i}
              className="w-1 h-1 rounded-full bg-accent/50"
              style={{ animation: `bolt-flicker 0.8s ease-in-out ${i * 0.15}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Main component ─── */
export default function IntakeSubmitBar({ isReady, isSubmitting, hasResume, hasJd }) {
  const disabled = !isReady || isSubmitting

  if (isSubmitting) {
    return (
      <div className="pt-2">
        <LightningLoader />
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">

      {/* Readiness indicators */}
      <div className="flex items-center gap-4">
        <Dot label="Résumé"          done={hasResume} />
        <Dot label="Job Description" done={hasJd}     />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={disabled}
        className={`
          inline-flex items-center gap-2
          px-6 py-3 rounded-xl
          font-medium text-sm
          transition-all duration-200
          ${!disabled
            ? 'bg-accent text-white hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/25 active:scale-[0.97]'
            : 'bg-white/[0.05] text-slate/50 cursor-not-allowed border border-white/[0.08]'}
        `}
      >
        Start Interview Setup
        <ArrowRight size={15} />
      </button>
    </div>
  )
}

function Dot({ label, done }) {
  return (
    <div className="flex items-center gap-1.5">
      {done
        ? <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
        : <span className="w-3.5 h-3.5 rounded-full border border-white/[0.15] flex-shrink-0" />
      }
      <span className={`font-mono text-[11px] ${done ? 'text-fog/70' : 'text-slate/50'}`}>
        {label}
      </span>
    </div>
  )
}
