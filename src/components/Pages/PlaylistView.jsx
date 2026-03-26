import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play, Shuffle, Edit2, Check, X, Trash2, Music2, Palette } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { usePlayer } from '../../contexts/PlayerContext'
import { db } from '../../firebase'
import { doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import TrackRow from '../shared/TrackRow'
import { PlaylistIcon, PLAYLIST_COLORS } from '../shared/PlaylistIcons'
import { sanitizeName, LIMITS } from '../../utils/sanitize'

export default function PlaylistView() {
  const { id } = useParams()
  const { user } = useAuth()
  const { playTrack, toggleShuffle, shuffle } = usePlayer()
  const navigate = useNavigate()

  const [playlist, setPlaylist] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [loading, setLoading] = useState(true)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)

  useEffect(() => {
    if (!user || !id) return
    const playlistDoc = doc(db, 'users', user.uid, 'playlists', id)
    const unsub = onSnapshot(playlistDoc, (snap) => {
      if (snap.exists()) {
        setPlaylist({ id: snap.id, ...snap.data() })
        setEditName(snap.data().name || '')
      } else {
        navigate('/app/library')
      }
      setLoading(false)
    })
    return unsub
  }, [user, id, navigate])

  const selectIcon = async (colorId) => {
    await updateDoc(doc(db, 'users', user.uid, 'playlists', id), { iconId: colorId })
    setIconPickerOpen(false)
  }

  const saveEdit = async () => {
    const cleanName = sanitizeName(editName)
    if (!cleanName) return
    await updateDoc(doc(db, 'users', user.uid, 'playlists', id), {
      name: cleanName,
    })
    setEditing(false)
  }

  const removeTrack = async (index) => {
    const tracks = [...(playlist.tracks || [])]
    tracks.splice(index, 1)
    await updateDoc(doc(db, 'users', user.uid, 'playlists', id), { tracks })
  }

  const deletePlaylist = async () => {
    if (!confirm(`Delete "${playlist.name}"?`)) return
    await deleteDoc(doc(db, 'users', user.uid, 'playlists', id))
    navigate('/app/library')
  }

  const playAll = () => {
    const tracks = playlist.tracks || []
    if (tracks.length > 0) playTrack(tracks[0], tracks, 0)
  }

  const handleShuffleToggle = () => {
    toggleShuffle()
  }

  if (loading) return <div style={{ padding: '60px', color: '#555' }}>Loading…</div>
  if (!playlist) return null

  const tracks = playlist.tracks || []

  return (
    <div style={{ padding: '32px 32px 40px', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap' }}>
        {/* Cover — click to open color/icon picker */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            onClick={() => setIconPickerOpen((v) => !v)}
            title="Change icon color"
            style={{ width: 180, height: 180, cursor: 'pointer', borderRadius: 16, overflow: 'hidden', position: 'relative' }}
            onMouseEnter={(e) => e.currentTarget.querySelector('.icon-overlay').style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.querySelector('.icon-overlay').style.opacity = '0'}
          >
            {playlist.iconId
              ? <PlaylistIcon id={playlist.iconId} size={180} style={{ borderRadius: 16 }} />
              : <div style={{ width: '100%', height: '100%', borderRadius: 16, background: '#1a1a1a', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Music2 size={52} color="#2a2a2a" />
                </div>
            }
            <div className="icon-overlay" style={{ position: 'absolute', inset: 0, borderRadius: 16, background: 'rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' }}>
              <Palette size={28} color="#fff" />
              <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>Change color</span>
            </div>
          </div>

          {/* Color picker dropdown */}
          {iconPickerOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, background: '#111', border: '1px solid #222', borderRadius: 16, padding: 14, marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, width: 240, boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>
              <p style={{ gridColumn: '1 / -1', color: '#666', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Pick a color</p>
              {PLAYLIST_COLORS.map((pc) => (
                <button
                  key={pc.id}
                  onClick={() => selectIcon(pc.id)}
                  title={pc.label}
                  style={{ background: 'none', border: `2px solid ${playlist.iconId === pc.id ? '#fff' : 'transparent'}`, borderRadius: 8, padding: 2, cursor: 'pointer', transition: 'transform 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <PlaylistIcon id={pc.id} size={38} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: '#999', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Playlist</p>

          {/* Editable title */}
          {editing ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
                maxLength={LIMITS.PLAYLIST_NAME}
                style={{ background: '#1a1a1a', border: '1px solid #1E90FF', borderRadius: '8px', padding: '8px 14px', color: '#fff', fontSize: '1.5rem', fontWeight: 800, outline: 'none', width: '100%', maxWidth: '400px' }}
              />
              <button onClick={saveEdit} style={{ background: '#1E90FF', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', color: '#fff', display: 'flex' }}><Check size={18} /></button>
              <button onClick={() => setEditing(false)} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', color: '#888', display: 'flex' }}><X size={18} /></button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
                {playlist.name}
              </h1>
              <button
                onClick={() => setEditing(true)}
                title="Edit name"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', display: 'flex', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#444')}
              >
                <Edit2 size={18} />
              </button>
            </div>
          )}

          <p style={{ color: '#666', fontSize: '0.88rem' }}>{tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}</p>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px' }}>
        {tracks.length > 0 && (
          <>
            <button
              onClick={playAll}
              title="Play playlist"
              style={{
                width: 54, height: 54, borderRadius: '50%', background: '#1E90FF', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(30,144,255,0.35)', transition: 'transform 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Play size={22} color="#fff" fill="#fff" style={{ marginLeft: '3px' }} />
            </button>

            <button
              onClick={handleShuffleToggle}
              title={shuffle ? 'Shuffle on' : 'Shuffle'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: shuffle ? '#1E90FF' : '#888', display: 'flex', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = shuffle ? '#1E90FF' : '#888')}
            >
              <Shuffle size={26} />
            </button>
          </>
        )}

        <div style={{ flex: 1 }} />

        <button
          onClick={deletePlaylist}
          title="Delete playlist"
          style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', transition: 'color 0.2s, border-color 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef444440' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#2a2a2a' }}
        >
          <Trash2 size={14} />
          Delete playlist
        </button>
      </div>

      {/* Track list */}
      {tracks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#444' }}>
          <Music2 size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.4 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#555', marginBottom: '8px' }}>This playlist is empty</p>
          <p style={{ fontSize: '0.88rem' }}>Add tracks from Search by clicking ＋</p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '40px 48px 1fr 80px 48px', gap: '12px', padding: '0 12px 10px', borderBottom: '1px solid #1a1a1a', marginBottom: '8px' }}>
            <span style={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center' }}>#</span>
            <span />
            <span style={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Title</span>
            <span style={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, textAlign: 'right' }}>Duration</span>
            <span />
          </div>
          {tracks.map((t, i) => (
            <div key={`${t.id}-${i}`} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <TrackRow track={t} index={i} queue={tracks} />
              </div>
              <button
                onClick={() => removeTrack(i)}
                title="Remove from playlist"
                style={{
                  position: 'absolute', right: '-4px', background: 'none', border: 'none',
                  color: '#333', cursor: 'pointer', padding: '4px', display: 'flex', transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#333')}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
