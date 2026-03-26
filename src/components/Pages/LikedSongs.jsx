import React, { useEffect, useState } from 'react'
import { Heart, Play, Shuffle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { usePlayer } from '../../contexts/PlayerContext'
import { db } from '../../firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import TrackRow from '../shared/TrackRow'

export default function LikedSongs() {
  const { user } = useAuth()
  const { playTrack, toggleShuffle, shuffle } = usePlayer()
  const [tracks, setTracks] = useState([])

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'users', user.uid, 'likedSongs'),
      orderBy('likedAt', 'desc')
    )
    return onSnapshot(q, (snap) => {
      setTracks(snap.docs.map((d) => ({ ...d.data(), _docId: d.id })))
    })
  }, [user])

  const playAll = () => {
    if (tracks.length > 0) playTrack(tracks[0], tracks, 0)
  }

  const playShuffle = () => {
    if (tracks.length === 0) return
    const idx = Math.floor(Math.random() * tracks.length)
    if (!shuffle) toggleShuffle()
    playTrack(tracks[idx], tracks, idx)
  }

  return (
    <div style={{ padding: '32px 32px 40px', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1E90FF22, #1E90FF55)',
            border: '1px solid #1E90FF33',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Heart size={64} color="#1E90FF" fill="#1E90FF" strokeWidth={1} />
        </div>
        <div>
          <p style={{ color: '#999', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Playlist
          </p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '12px' }}>
            Liked Songs
          </h1>
          <p style={{ color: '#666', fontSize: '0.88rem' }}>
            {tracks.length} {tracks.length === 1 ? 'song' : 'songs'}
          </p>
        </div>
      </div>

      {/* Controls */}
      {tracks.length > 0 && (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px' }}>
          <button
            onClick={playAll}
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
            onClick={playShuffle}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: shuffle ? '#1E90FF' : '#888', transition: 'color 0.2s, transform 0.15s',
              display: 'flex',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1.1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = shuffle ? '#1E90FF' : '#888'; e.currentTarget.style.transform = 'scale(1)' }}
          >
            <Shuffle size={26} />
          </button>
        </div>
      )}

      {/* Track list */}
      {tracks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#444' }}>
          <Heart size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.4 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#555', marginBottom: '8px' }}>No liked songs yet</p>
          <p style={{ fontSize: '0.88rem' }}>Click the ♥ on any track to add it here</p>
        </div>
      ) : (
        <div>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '40px 48px 1fr 80px 48px', gap: '12px', padding: '0 12px 10px', borderBottom: '1px solid #1a1a1a', marginBottom: '8px' }}>
            <span style={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center' }}>#</span>
            <span />
            <span style={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Title</span>
            <span style={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, textAlign: 'right' }}>Duration</span>
            <span />
          </div>
          {tracks.map((t, i) => (
            <TrackRow key={t._docId} track={t} index={i} queue={tracks} />
          ))}
        </div>
      )}
    </div>
  )
}
