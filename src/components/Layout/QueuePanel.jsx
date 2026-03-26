import React from 'react'
import { X, Music2, Trash2 } from 'lucide-react'
import { usePlayer } from '../../contexts/PlayerContext'

export default function QueuePanel() {
  const { queue, queueIndex, currentTrack, playTrack, removeFromQueue, setShowQueue } = usePlayer()

  return (
    <div
      style={{
        width: '320px',
        minWidth: '320px',
        background: '#0f0f0f',
        borderLeft: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1a1a1a' }}>
        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>Queue</h2>
        <button
          onClick={() => setShowQueue(false)}
          style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', display: 'flex', padding: '4px' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
        {/* Now playing */}
        {currentTrack && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: '#555', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px', padding: '0 8px' }}>Now Playing</p>
            <TrackRow track={currentTrack} active />
          </div>
        )}

        {/* Up next */}
        <p style={{ color: '#555', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px', padding: '0 8px' }}>Up Next</p>
        {queue.length === 0 && (
          <p style={{ color: '#444', fontSize: '0.82rem', padding: '12px 8px' }}>Queue is empty</p>
        )}
        {queue.map((track, idx) => (
          <div key={`${track.id}-${idx}`} style={{ position: 'relative' }} className="group">
            <TrackRow
              track={track}
              active={idx === queueIndex}
              onClick={() => playTrack(track, queue, idx)}
              onRemove={() => removeFromQueue(idx)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function TrackRow({ track, active, onClick, onRemove }) {
  const art = track.artwork_url?.replace('-large', '-t200x200') || null

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px',
        borderRadius: '8px',
        cursor: onClick ? 'pointer' : 'default',
        background: active ? 'rgba(30,144,255,0.08)' : 'transparent',
        transition: 'background 0.15s',
        marginBottom: '2px',
      }}
      onMouseEnter={(e) => { if (!active && onClick) e.currentTarget.style.background = '#1a1a1a' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = active ? 'rgba(30,144,255,0.08)' : 'transparent' }}
    >
      <div style={{ width: 36, height: 36, borderRadius: '6px', background: '#1a1a1a', flexShrink: 0, overflow: 'hidden' }}>
        {art
          ? <img src={art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Music2 size={14} color="#444" /></div>
        }
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <p style={{ color: active ? '#1E90FF' : '#fff', fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {track.title}
        </p>
        <p style={{ color: '#666', fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {track.artist}
        </p>
      </div>
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', display: 'flex', padding: '4px', flexShrink: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#444')}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}
