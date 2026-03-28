import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  Search,
  Library,
  Heart,
  Clock,
  Settings,
  LogOut,
  Plus,
  Music2,
  BarChart2,
} from 'lucide-react'
import RadioDugoLogo from '../../assets/RadioDugoLogo'
import { useAuth } from '../../contexts/AuthContext'
import { usePlayer } from '../../contexts/PlayerContext'
import { AvatarIcon } from '../shared/AvatarIcons'
import { PlaylistIcon } from '../shared/PlaylistIcons'
import { db } from '../../firebase'
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  doc,
  updateDoc,
} from 'firebase/firestore'

const NAV = [
  { to: '/app/home', icon: Home, label: 'Home' },
  { to: '/app/search', icon: Search, label: 'Search' },
  { to: '/app/library', icon: Library, label: 'Your Library' },
  { to: '/app/stats', icon: BarChart2, label: 'Stats' },
]

const SECONDARY = [
  { to: '/app/liked', icon: Heart, label: 'Liked Songs' },
  { to: '/app/recent', icon: Clock, label: 'Recently Played' },
]

export default function Sidebar() {
  const { user, userProfile, logout } = useAuth()
  const { currentTrack } = usePlayer()
  const navigate = useNavigate()
  const [playlists, setPlaylists] = useState([])
  const [dropTarget, setDropTarget] = useState(null) // playlist id being hovered

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'users', user.uid, 'playlists'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(
      q,
      (snap) => setPlaylists(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error('Playlist subscription error:', err)
    )
    return unsub
  }, [user])

  const createPlaylist = async () => {
    if (!user) return
    const name = `My Playlist #${playlists.length + 1}`
    const ref = await addDoc(collection(db, 'users', user.uid, 'playlists'), {
      name,
      description: '',
      tracks: [],
      createdAt: serverTimestamp(),
    })
    navigate(`/app/playlist/${ref.id}`)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleDrop = async (e, pl) => {
    e.preventDefault()
    setDropTarget(null)
    try {
      const track = JSON.parse(e.dataTransfer.getData('text/plain'))
      const tracks = [...(pl.tracks || []), track]
      await updateDoc(doc(db, 'users', user.uid, 'playlists', pl.id), { tracks })
    } catch (_) {}
  }

  return (
    <div
      style={{
        width: '240px',
        minWidth: '240px',
        background: '#0d0d0d',
        display: 'flex',
        flexDirection: 'column',
        height: currentTrack ? 'calc(100vh - 88px)' : '100vh',
        borderRight: '1px solid #1a1a1a',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '28px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <RadioDugoLogo size={36} />
          <span
            style={{
              color: '#fff',
              fontWeight: 900,
              fontSize: '1.25rem',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            Radio Dugo
          </span>
        </div>
      </div>

      {/* Primary nav */}
      <nav style={{ padding: '0 10px' }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ height: '1px', background: '#1a1a1a', margin: '16px 20px' }} />

      {/* Secondary nav */}
      <nav style={{ padding: '0 10px' }}>
        {SECONDARY.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ height: '1px', background: '#1a1a1a', margin: '16px 20px' }} />

      {/* Playlists section */}
      <div style={{ padding: '0 10px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 10px 8px' }}>
          <span style={{ color: '#555', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Playlists
          </span>
          <button
            onClick={createPlaylist}
            title="Create playlist"
            style={{
              background: 'none',
              border: 'none',
              color: '#555',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              borderRadius: '4px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
          >
            <Plus size={16} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {playlists.length === 0 && (
            <p style={{ color: '#444', fontSize: '0.8rem', padding: '8px 10px' }}>
              No playlists yet
            </p>
          )}
          {playlists.map((pl) => (
            <NavLink
              key={pl.id}
              to={`/app/playlist/${pl.id}`}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              style={{ fontSize: '0.82rem', outline: dropTarget === pl.id ? '1px solid #1E90FF' : 'none', borderRadius: '8px', transition: 'background 0.15s' }}
              onDragOver={(e) => { e.preventDefault(); setDropTarget(pl.id) }}
              onDragLeave={() => setDropTarget(null)}
              onDrop={(e) => handleDrop(e, pl)}
            >
              <div
                style={{
                  width: 28, height: 28, borderRadius: '6px', flexShrink: 0, overflow: 'hidden',
                  border: dropTarget === pl.id ? '1px solid #1E90FF' : '1px solid #222',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: pl.iconId || pl.coverUrl ? 'transparent' : '#1a1a1a',
                }}
              >
                {pl.iconId
                  ? <PlaylistIcon id={pl.iconId} size={28} style={{ borderRadius: 5 }} />
                  : pl.coverUrl
                    ? <img src={pl.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Music2 size={14} color={dropTarget === pl.id ? '#1E90FF' : '#444'} />
                }
              </div>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {pl.name}
              </span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* User footer */}
      <div style={{ borderTop: '1px solid #1a1a1a', padding: '16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'rgba(30,144,255,0.2)',
              border: '1px solid rgba(30,144,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#1E90FF',
              fontWeight: 700,
              fontSize: '0.85rem',
              overflow: 'hidden',
            }}
          >
            {userProfile?.avatarId
              ? <AvatarIcon id={userProfile.avatarId} size={34} />
              : userProfile?.photoURL
                ? <img src={userProfile.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (userProfile?.firstName || user?.displayName || 'U')[0].toUpperCase()
            }
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userProfile?.firstName || user?.displayName || 'User'}
            </p>
            <p style={{ color: '#555', fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <NavLink
              to="/app/settings"
              title="Settings"
              style={{ color: '#555', display: 'flex', padding: '4px', borderRadius: '6px', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
            >
              <Settings size={16} />
            </NavLink>
            <button
              onClick={handleLogout}
              title="Log out"
              style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', display: 'flex', padding: '4px', borderRadius: '6px', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
