/**
 * src/components/layout/Footer.jsx
 * Premium dark-mode footer for DeepDive
 */
import React from 'react'
import { Link } from 'react-router-dom'
import { Github, Twitter, Linkedin } from 'lucide-react'

const PRODUCT_LINKS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Features',  to: '/#features'  },
  { label: 'Pricing',   to: '/#pricing'   },
]

const RESOURCE_LINKS = [
  { label: 'GitHub',        href: 'https://github.com' },
  { label: 'Documentation', href: '#' },
  { label: 'Support',       href: '#' },
]

const SOCIAL = [
  { icon: Github,   href: 'https://github.com',    label: 'GitHub'   },
  { icon: Twitter,  href: 'https://twitter.com',   label: 'Twitter'  },
  { icon: Linkedin, href: 'https://linkedin.com',  label: 'LinkedIn' },
]

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-white/[0.06]">

      {/* Base layer — zinc-950 with optional texture */}
      <div
        className="absolute inset-0 bg-zinc-950"
        style={{ backgroundImage: "url('/footer-texture.png')", backgroundRepeat: 'repeat' }}
        aria-hidden="true"
      />
      {/* Texture overlay tint */}
      <div className="absolute inset-0 bg-zinc-950/80" aria-hidden="true" />

      {/* Ambient top glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-accent/[0.06] blur-[80px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Brand column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Textured logo text */}
            <Link to="/" className="inline-flex items-center gap-3 group select-none w-fit">
              {/* Icon mark */}
              <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-all duration-200 ease-in-out group-hover:-translate-y-0.5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 13 L5 4 L8 10 L11 6 L14 13" stroke="#4F6EF7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="8" cy="3" r="1.2" fill="#E05C3A" />
                </svg>
              </span>

              {/* Texture-clipped wordmark */}
              <span
                className="font-display text-2xl font-bold leading-none text-transparent bg-clip-text bg-cover bg-center"
                style={{
                  backgroundImage: "url('/text-texture.png'), linear-gradient(135deg, #F4F3EF 0%, #8A8F9E 60%, #4F6EF7 100%)",
                }}
              >
                DEEPDIVE
              </span>
            </Link>

            <p className="text-slate/60 text-sm leading-relaxed max-w-xs">
              Built for depth, not breadth. AI-powered technical interviews tailored to your résumé and target role.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2 mt-1">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03]
                    flex items-center justify-center text-slate/50
                    hover:text-fog hover:border-white/20 hover:bg-white/[0.07]
                    hover:-translate-y-0.5
                    transition-all duration-200 ease-in-out"
                >
                  <Icon size={13} />
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[10px] tracking-widest uppercase text-accent/70 mb-1">Product</p>
            {PRODUCT_LINKS.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="text-slate/50 text-sm hover:text-blue-400 transition-colors duration-200 w-fit"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Resource links */}
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[10px] tracking-widest uppercase text-accent/70 mb-1">Resources</p>
            {RESOURCE_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate/50 text-sm hover:text-blue-400 transition-colors duration-200 w-fit"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-slate/35">
            © {new Date().getFullYear()} DeepDive. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-slate/25 tracking-widest uppercase">
              AI-Powered Interview Prep
            </span>
            <span className="w-1 h-1 rounded-full bg-accent/40 inline-block" />
            <span className="font-mono text-[10px] text-slate/25">RAG · LLM · STT · TTS</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
