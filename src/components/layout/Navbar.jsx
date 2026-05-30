import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '@/components/ui/Logo.jsx'
import NavLink from '@/components/ui/NavLink.jsx'
import StatusBadge from '@/components/ui/StatusBadge.jsx'

const NAV_ITEMS = [
  { label: 'Home',      to: '/'          },
  { label: 'Dashboard', to: '/dashboard' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="sticky top-0 z-50 w-full transition-all duration-300"
      style={scrolled ? {
        background: 'rgba(9,9,11,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.5)',
      } : {
        background: 'transparent',
        borderBottom: '1px solid transparent',
      }}
    >
      <nav className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-6">
        <Logo />

        <ul className="hidden sm:flex items-center gap-7">
          {NAV_ITEMS.map(({ label, to }) => (
            <li key={to}><NavLink to={to}>{label}</NavLink></li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          
          <Link to="/dashboard" className="btn-primary hidden sm:inline-flex">
            Start Interview
          </Link>
        </div>
      </nav>
    </header>
  )
}
