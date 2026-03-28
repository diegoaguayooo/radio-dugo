import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Library as LibraryIcon, Music2, Trash2 } from 'lucide-react'
import { PlaylistIcon } from '../shared/PlaylistIcons'
import { useAuth } from '../../contexts/AuthContext'
import { useIsMobile } from '../../hooks/useIsMobile'
import { db } from '../../firebase'
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

export default function Library() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [playlists, setPlaylists] = useState([])
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'users', user.uid, 'playlists'),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (snap) => {
      setPlaylists(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
  }, [user])

  const createPlaylist = async () => {
    if (!newName.trim()) return
    const ref = await addDoc(collection(db, 'users', user.uid, 'playlists'), {
      name: newName.trim(),
      description: '',
      tracks: [],
      createdAt: serverTimestamp(),
    })
    setCreating(false)
    setNewName('')
    navigate(`/app/playlist/${ref.id}`)
  }

  const deletePlaylist = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this playlist?')) return
    await deleteDoc(doc(db, 'users', user.uid, 'playlists', id))
  }

  return (
    <div className="page-enter" style={{ padding: isMobile ? '20px 16px 32px' : '32px 32px 40px', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Your Library</h1>
        {/* Desktop: show inline button */}
        {!isMobile && (
          <button
            onClick={() => setCreating(true)}
            style={{
              background: '#1E90FF',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 18px',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#3aa3ff')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#1E90FF')}
          >
            <Plus size={16} />
            New Playlist
          </button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div style={{ background: '#111', border: '1px solid #1E90FF30', borderRadius: '14px', padding: '20px 24px', marginBottom: '24px' }}>
          <p style={{ color: '#fff', fontWeight: 600, marginBottom: '14px' }}>Name your playlist</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') createPlaylist(); if (e.key === 'Escape') { setCreating(false); setNewName('') } }}
              placeholder="My Playlist"
              style={{ flex: 1, minWidth: 0, background: '#0d0d0d', border: '1px solid #222', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={createPlaylist}
                style={{ background: '#1E90FF', border: 'none', borderRadius: '8px', padding: '10px 18px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                Create
              </button>
              <button
                onClick={() => { setCreating(false); setNewName('') }}
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 16px', color: '#888', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {playlists.length === 0 && !creating && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#444' }}>
          <LibraryIcon size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.5 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#555', marginBottom: '8px' }}>
            Your library is empty
          </p>
          <p style={{ fontSize: '0.88rem' }}>Create a playlist to organize your music</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
        {playlists.map((pl) => (
          <div
            key={pl.id}
            onClick={() => navigate(`/app/playlist/${pl.id}`)}
            style={{
              background: '#111',
              border: '1px solid #1a1a1a',
              borderRadius: '14px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.15s',
              position: 'relative',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.querySelector('.del-btn').style.opacity = '1' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#111'; e.currentTarget.querySelector('.del-btn').style.opacity = '0' }}
          >
            {/* Cover */}
            <div style={{ width: '100%', paddingTop: '100%', background: '#1a1a1a', borderRadius: '10px', marginBottom: '14px', position: 'relative', overflow: 'hidden', border: '1px solid #222' }}>
              {pl.iconId
                ? <PlaylistIcon id={pl.iconId} size={200} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 0 }} />
                : pl.coverUrl
                  ? <img src={pl.coverUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Music2 size={32} color="#2a2a2a" /></div>
              }
            </div>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
              {pl.name}
            </p>
            <p style={{ color: '#555', fontSize: '0.78rem' }}>{(pl.tracks || []).length} tracks</p>

            {/* Delete button */}
            <button
              className="del-btn"
              onClick={(e) => deletePlaylist(e, pl.id)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.7)',
                border: '1px solid #333',
                borderRadius: '6px',
                padding: '4px',
                cursor: 'pointer',
                color: '#888',
                opacity: isMobile ? 1 : 0,
                transition: 'opacity 0.15s, color 0.15s',
                display: 'flex',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Mobile floating + button */}
      {isMobile && (
        <button
          onClick={() => setCreating(true)}
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: '#1E90FF',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(30,144,255,0.45)',
            zIndex: 90,
          }}
        >
          <Plus size={24} color="#fff" />
        </button>
      )}
    </div>
  )
}
