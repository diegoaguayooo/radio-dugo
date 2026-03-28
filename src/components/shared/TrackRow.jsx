import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Heart, Plus, Check } from 'lucide-react'
import { usePlayer } from '../../contexts/PlayerContext'
import { useAuth } from '../../contexts/AuthContext'
import { useIsMobile } from '../../hooks/useIsMobile'
import { db } from '../../firebase'
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore'

const fmt = (ms) => {
  if (!ms) return '--:--'
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function TrackRow({ track, index, queue, showIndex = true, durationLabel }) {
  const { currentTrack, isPlaying, playTrack, togglePlay, isLiked, toggleLike } = usePlayer()
  const { user } = useAuth()
  const isMobile = useIsMobile()

  const isActive = currentTrack?.id === track.id
  const liked = isLiked(track.id)

  const [showMenu, setShowMenu] = useState(false)
  const [playlists, setPlaylists] = useState([])
  const [added, setAdded] = useState(null)
  const [menuPos, setMenuPos] = useState({ top: 0 })
  const menuRef = useRef(null)
  const plusBtnRef = useRef(null)

  // Pre-load playlists so the menu opens instantly
  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(
      query(collection(db, 'users', user.uid, 'playlists'), orderBy('createdAt', 'desc')),
      (snap) => setPlaylists(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => {}
    )
    return unsub
  }, [user])

  const handlePlay = () => {
    if (isActive) togglePlay()
    else playTrack(track, queue || [track], index ?? 0)
  }

  const art = track.artwork_url || null

  const openMenu = async (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (!user) return
    if (showMenu) { setShowMenu(false); return }

    const snap = await getDocs(
      query(collection(db, 'users', user.uid, 'playlists'), orderBy('createdAt', 'desc'))
    )
    setPlaylists(snap.docs.map((d) => ({ id: d.id, ...d.data() })))

    // Position dropdown relative to viewport so it never clips
    if (plusBtnRef.current) {
      const rect = plusBtnRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      if (spaceBelow < 240) {
        setMenuPos({ bottom: window.innerHeight - rect.top + 6, top: 'auto' })
      } else {
        setMenuPos({ top: rect.bottom + 6, bottom: 'auto' })
      }
    }
    setAdded(null)
    setShowMenu(true)
  }

  const addToPlaylist = async (e, pl) => {
    e.stopPropagation()
    e.preventDefault()
    const tracks = [...(pl.tracks || []), track]
    await updateDoc(doc(db, 'users', user.uid, 'playlists', pl.id), { tracks })
    setAdded(pl.id)
    setTimeout(() => { setShowMenu(false); setAdded(null) }, 800)
  }

  // Close on outside click/tap
  useEffect(() => {
    if (!showMenu) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [showMenu])

  if (isMobile) {
    // ── Mobile layout ─────────────────────────────────────────────
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 4px',
          borderRadius: '10px',
          position: 'relative',
        }}
      >
        {/* Artwork — tap to play */}
        <div
          onClick={handlePlay}
          style={{
            width: 48, height: 48, borderRadius: '8px',
            background: '#1a1a1a', overflow: 'hidden', flexShrink: 0,
            border: isActive ? '1.5px solid rgba(30,144,255,0.5)' : '1px solid #222',
            position: 'relative', cursor: 'pointer',
          }}
        >
          {art && <img src={art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          {isActive && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isPlaying ? <Pause size={16} color="#fff" fill="#fff" /> : <Play size={16} color="#fff" fill="#fff" />}
            </div>
          )}
        </div>

        {/* Title + artist */}
        <div style={{ flex: 1, overflow: 'hidden', cursor: 'pointer' }} onClick={handlePlay}>
          <p style={{ color: isActive ? '#5badff' : '#fff', fontSize: '0.88rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {track.title}
          </p>
          <p style={{ color: '#666', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
            {track.artist}
          </p>
        </div>

        {/* Action buttons — clearly separated, large tap targets */}
        <div ref={menuRef} style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <button
            onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); toggleLike(track) }}
            onClick={(e) => { e.stopPropagation(); toggleLike(track) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: liked ? '#1E90FF' : '#888',
              display: 'flex', padding: '10px', borderRadius: '8px',
              minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Heart size={19} fill={liked ? '#1E90FF' : 'none'} />
          </button>
          <span ref={plusBtnRef} style={{ display: 'inline-flex' }}>
            <button
              onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); openMenu(e) }}
              onClick={(e) => { e.stopPropagation(); openMenu(e) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#888',
                display: 'flex', padding: '10px', borderRadius: '8px',
                minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Plus size={19} />
            </button>
          </span>
        </div>

        {/* Playlist dropdown — fixed to viewport */}
        {showMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: menuPos.top,
              bottom: menuPos.bottom,
              right: 12,
              background: '#1e1e1e',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              minWidth: '210px',
              zIndex: 2000,
              boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
              overflow: 'hidden',
            }}
          >
            <p style={{ color: '#555', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 16px 6px' }}>
              Add to playlist
            </p>
            {playlists.length === 0 ? (
              <p style={{ color: '#444', fontSize: '0.82rem', padding: '8px 16px 14px' }}>No playlists yet</p>
            ) : (
              playlists.map((pl) => (
                <button
                  key={pl.id}
                  onTouchEnd={(e) => { e.stopPropagation(); addToPlaylist(e, pl) }}
                  onClick={(e) => addToPlaylist(e, pl)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                    padding: '14px 16px', color: added === pl.id ? '#1E90FF' : '#ccc',
                    fontSize: '0.9rem', textAlign: 'left', minHeight: 48,
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pl.name}</span>
                  {added === pl.id && <Check size={14} color="#1E90FF" />}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    )
  }

  // ── Desktop layout ───────────────────────────────────────────────
  return (
    <div
      onDoubleClick={handlePlay}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', JSON.stringify(track))}
      style={{
        display: 'grid',
        gridTemplateColumns: showIndex ? '40px 48px 1fr 80px 48px' : '48px 1fr 80px 48px',
        alignItems: 'center',
        gap: '12px',
        padding: '6px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        background: 'transparent',
        transition: 'background 0.15s',
        position: 'relative',
      }}
      className="track-row"
      onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1a1a')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Index / play button */}
      {showIndex && (
        <div style={{ textAlign: 'center', position: 'relative', width: '40px' }}>
          <span
            className="idx"
            style={{ color: isActive ? '#1E90FF' : '#666', fontSize: '0.85rem', display: 'block' }}
          >
            {isActive && isPlaying ? <WaveAnim /> : (index !== undefined ? index + 1 : '•')}
          </span>
          <button
            className="play-btn"
            onClick={handlePlay}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#fff', display: 'none', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {isActive && isPlaying ? <Pause size={16} /> : <Play size={16} fill="#fff" />}
          </button>
        </div>
      )}

      {/* Artwork */}
      <div style={{ width: 42, height: 42, borderRadius: '6px', background: '#1a1a1a', overflow: 'hidden', flexShrink: 0 }}>
        {art && <img src={art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>

      {/* Title + artist */}
      <div style={{ overflow: 'hidden' }}>
        <p style={{ color: isActive ? '#1E90FF' : '#fff', fontSize: '0.88rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {track.title}
        </p>
        <p style={{ color: '#666', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
          {track.artist}
        </p>
      </div>

      {/* Duration */}
      <div style={{ textAlign: 'right' }}>
        <span style={{ color: '#555', fontSize: '0.8rem' }}>{durationLabel ?? fmt(track.duration)}</span>
      </div>

      {/* Actions */}
      <div
        style={{ display: 'flex', gap: '4px', justifyContent: 'center', position: 'relative' }}
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
      >
        <ActionBtn onClick={(e) => { e.stopPropagation(); toggleLike(track) }} active={liked} title={liked ? 'Unlike' : 'Like'}>
          <Heart size={15} fill={liked ? '#1E90FF' : 'none'} />
        </ActionBtn>
        <span ref={plusBtnRef} style={{ display: 'inline-flex' }}>
          <ActionBtn onClick={openMenu} title="Add to playlist">
            <Plus size={15} />
          </ActionBtn>
        </span>

        {showMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: menuPos.top,
              bottom: menuPos.bottom,
              right: 'auto',
              background: '#1a1a1a', border: '1px solid #2a2a2a',
              borderRadius: '10px', minWidth: '180px', zIndex: 1000,
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)', overflow: 'hidden',
            }}
          >
            <p style={{ color: '#555', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 14px 6px' }}>
              Add to playlist
            </p>
            {playlists.length === 0 ? (
              <p style={{ color: '#444', fontSize: '0.82rem', padding: '8px 14px 12px' }}>No playlists yet</p>
            ) : (
              playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={(e) => addToPlaylist(e, pl)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                    padding: '8px 14px', color: added === pl.id ? '#1E90FF' : '#ccc',
                    fontSize: '0.85rem', transition: 'background 0.15s', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#252525')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pl.name}</span>
                  {added === pl.id && <Check size={13} />}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ActionBtn({ children, onClick, active, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: active ? '#1E90FF' : '#444',
        display: 'flex', padding: '5px', borderRadius: '4px', transition: 'color 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = active ? '#3aa3ff' : '#fff')}
      onMouseLeave={(e) => (e.currentTarget.style.color = active ? '#1E90FF' : '#444')}
    >
      {children}
    </button>
  )
}

function WaveAnim() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: '2px', height: '16px' }}>
      {[0, 0.2, 0.4].map((delay, i) => (
        <span
          key={i}
          className="wave-bar"
          style={{ height: '14px', animationDelay: `${delay}s`, animationDuration: '0.8s' }}
        />
      ))}
    </span>
  )
}
