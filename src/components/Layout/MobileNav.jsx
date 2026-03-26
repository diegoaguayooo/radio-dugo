import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Search, Library, BarChart2 } from 'lucide-react'

const NAV = [
  { to: '/app/home', icon: Home, label: 'Home' },
  { to: '/app/search', icon: Search, label: 'Search' },
  { to: '/app/library', icon: Library, label: 'Library' },
  { to: '/app/stats', icon: BarChart2, label: 'Stats' },
]

export default function MobileNav() {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: '#0d0d0d',
        borderTop: '1px solid #1e1e1e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 99,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            color: isActive ? '#1E90FF' : '#666',
            textDecoration: 'none',
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            padding: '4px 16px',
            transition: 'color 0.15s',
            minWidth: 60,
          })}
        >
          <Icon size={21} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
