import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Search, Library } from 'lucide-react'

const NAV = [
  { to: '/app/home',    icon: Home,    label: 'Home'    },
  { to: '/app/search',  icon: Search,  label: 'Search'  },
  { to: '/app/library', icon: Library, label: 'Library' },
]

export default function MobileNav() {
  return (
    <nav className="glass-player" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: '60px',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-around', zIndex: 99,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to}
          style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '3px', color: isActive ? '#fff' : '#555',
            textDecoration: 'none', fontSize: '0.6rem', fontWeight: 700,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            padding: '4px 24px', transition: 'color 0.15s', minWidth: 72,
            position: 'relative',
          })}
        >
          {({ isActive }) => (
            <>
              <div style={{ position: 'relative' }}>
                <Icon size={22} />
                {isActive && <span className="nav-pill-dot" />}
              </div>
              <span style={{ color: isActive ? '#1E90FF' : '#555' }}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
