import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { BarChart2, Clock, Heart, LogOut, X, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { AvatarIcon } from '../shared/AvatarIcons'

export default function MobileSidebar({ isOpen, onClose }) {
  const { user, userProfile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    onClose()
    await logout()
    navigate('/')
  }

  const handleNav = (to) => {
    onClose()
    navigate(to)
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 150,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 'min(300px, 85vw)',
        background: '#111',
        zIndex: 151,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 16px 0' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: '6px', display: 'flex', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        {/* Profile section */}
        <div
          onClick={() => handleNav('/app/settings')}
          style={{ padding: '12px 24px 24px', cursor: 'pointer' }}
        >
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            overflow: 'hidden', marginBottom: '14px',
            border: '2px solid rgba(30,144,255,0.4)',
            background: 'rgba(30,144,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {userProfile?.avatarId
              ? <AvatarIcon id={userProfile.avatarId} size={72} />
              : userProfile?.photoURL
                ? <img src={userProfile.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <User size={32} color="#1E90FF" />
            }
          </div>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: '3px' }}>
            {userProfile?.firstName
              ? `${userProfile.firstName}${userProfile.lastName ? ' ' + userProfile.lastName : ''}`
              : user?.displayName || 'User'}
          </p>
          <p style={{ color: '#555', fontSize: '0.78rem' }}>{user?.email}</p>
          <p style={{ color: '#1E90FF', fontSize: '0.75rem', fontWeight: 600, marginTop: '6px' }}>View Profile →</p>
        </div>

        <div style={{ height: '1px', background: '#1a1a1a', margin: '0 24px 8px' }} />

        {/* Nav links */}
        <div style={{ padding: '8px 12px' }}>
          {[
            { icon: BarChart2, label: 'Stats',            to: '/app/stats'   },
            { icon: Clock,     label: 'Recently Played',  to: '/app/recent'  },
            { icon: Heart,     label: 'Liked Songs',      to: '/app/liked'   },
          ].map(({ icon: Icon, label, to }) => (
            <button
              key={to}
              onClick={() => handleNav(to)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                width: '100%', background: 'none', border: 'none',
                color: '#ccc', fontSize: '0.95rem', fontWeight: 500,
                padding: '13px 12px', borderRadius: '10px',
                cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.15s, color 0.15s',
              }}
              onTouchStart={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#fff' }}
              onTouchEnd={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#ccc' }}
            >
              <Icon size={20} color="#666" />
              {label}
            </button>
          ))}
        </div>


        {/* Spacer to push logout down */}
        <div style={{ flex: 1, minHeight: 24 }} />

        <div style={{ height: '1px', background: '#1a1a1a', margin: '0 24px 8px' }} />

        {/* Logout */}
        <div style={{ padding: '8px 12px 24px' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              width: '100%', background: 'none', border: 'none',
              color: '#888', fontSize: '0.95rem', fontWeight: 500,
              padding: '13px 12px', borderRadius: '10px',
              cursor: 'pointer', textAlign: 'left',
              transition: 'background 0.15s, color 0.15s',
            }}
            onTouchStart={(e) => { e.currentTarget.style.color = '#ef4444' }}
            onTouchEnd={(e) => { e.currentTarget.style.color = '#888' }}
          >
            <LogOut size={20} color="#555" />
            Log Out
          </button>
        </div>
      </div>
    </>
  )
}
