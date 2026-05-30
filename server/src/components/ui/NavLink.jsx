import React from 'react'
import { NavLink as RouterNavLink } from 'react-router-dom'

export default function NavLink({ to, children }) {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        `nav-link ${isActive ? 'active' : ''}`
      }
    >
      {children}
    </RouterNavLink>
  )
}
