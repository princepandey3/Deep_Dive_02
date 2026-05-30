import React from 'react'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

export default function RootLayout({ children }) {
  return (
    <div className="relative min-h-dvh flex flex-col overflow-x-hidden" style={{ backgroundColor: '#09090b' }}>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(79,110,247,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,110,247,0.07) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      {/* Ambient depth blobs */}
      <div className="pointer-events-none fixed top-[-25%] left-[-12%] w-[65vw] h-[65vw] rounded-full blur-[140px]"
        style={{ background: 'rgba(79,110,247,0.06)' }} aria-hidden="true" />
      <div className="pointer-events-none fixed bottom-[-20%] right-[-10%] w-[55vw] h-[55vw] rounded-full blur-[110px]"
        style={{ background: 'rgba(224,92,58,0.04)' }} aria-hidden="true" />
      <div className="pointer-events-none fixed top-[40%] left-[50%] w-[30vw] h-[30vw] rounded-full blur-[90px]"
        style={{ background: 'rgba(139,92,246,0.03)' }} aria-hidden="true" />

      <Navbar />
      <main className="relative z-10 flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  )
}
