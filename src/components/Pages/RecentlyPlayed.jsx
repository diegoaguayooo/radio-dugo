import React, { useEffect, useState } from 'react'
import { Clock, Play } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { usePlayer } from '../../contexts/PlayerContext'
import { db } from '../../firebase'
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore'
import TrackRow from '../shared/TrackRow'

const fmtTime = (ts) => {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return d.toLocaleDateString()
}

export default function RecentlyPlayed() {
  const { user } = useAuth()
  const { playTrack } = usePlayer()
  const [tracks, setTracks] = useState([])

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'users', user.uid, 'recentlyPlayed'),
      orderBy('playedAt', 'desc'),
      limit(50)
    )
    return onSnapshot(q, (snap) => {
      setTracks(snap.docs.map((d) => ({ ...d.data(), _docId: d.id })))
    })
  }, [user])

  return (
    <div style={{ padding: '32px 32px 40px', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div
          style={{
            width: 180, height: 180, borderRadius: '16px',
            background: 'linear-gradient(135deg, #8B5CF622, #8B5CF655)',
            border: '1px solid #8B5CF633',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <Clock size={64} color="#8B5CF6" strokeWidth={1.5} />
        </div>
        <div>
          <p style={{ color: '#999', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>History</p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '12px' }}>
            Recently Played
          </h1>
          <p style={{ color: '#666', fontSize: '0.88rem' }}>{tracks.length} tracks</p>
        </div>
      </div>

      {/* Play all */}
      {tracks.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <button
            onClick={() => playTrack(tracks[0], tracks, 0)}
            style={{
              width: 54, height: 54, borderRadius: '50%', background: '#8B5CF6', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(139,92,246,0.35)', transition: 'transform 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Play size={22} color="#fff" fill="#fff" style={{ marginLeft: '3px' }} />
          </button>
        </div>
      )}

      {tracks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#444' }}>
          <Clock size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.4 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#555', marginBottom: '8px' }}>Nothing played yet</p>
          <p style={{ fontSize: '0.88rem' }}>Tracks you play will appear here</p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '40px 48px 1fr 80px 48px', gap: '12px', padding: '0 12px 10px', borderBottom: '1px solid #1a1a1a', marginBottom: '8px' }}>
            <span style={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center' }}>#</span>
            <span />
            <span style={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Title</span>
            <span style={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, textAlign: 'right' }}>Played</span>
            <span />
          </div>
          {tracks.map((t, i) => (
            <TrackRow
              key={t._docId}
              track={t}
              index={i}
              queue={tracks}
              durationLabel={t.playedAt ? fmtTime(t.playedAt) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
