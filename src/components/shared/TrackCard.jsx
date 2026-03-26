import React from 'react'
import { Play } from 'lucide-react'
import { usePlayer } from '../../contexts/PlayerContext'

export default function TrackCard({ track, queue, index = 0 }) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer()
  const isActive = currentTrack?.id === track.id
  const art = track.artwork_url || null

  const handlePlay = (e) => {
    e.stopPropagation()
    if (isActive) togglePlay()
    else playTrack(track, queue || [track], index)
  }

  return (
    <div
      onClick={handlePlay}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', JSON.stringify(track))}
      style={{
        background: '#111',
        border: '1px solid #1a1a1a',
        borderRadius: '14px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#1a1a1a'
        e.currentTarget.style.borderColor = '#2a2a2a'
        e.currentTarget.querySelector('.play-fab').style.opacity = '1'
        e.currentTarget.querySelector('.play-fab').style.transform = 'translateY(0) scale(1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#111'
        e.currentTarget.style.borderColor = '#1a1a1a'
        e.currentTarget.querySelector('.play-fab').style.opacity = '0'
        e.currentTarget.querySelector('.play-fab').style.transform = 'translateY(6px) scale(0.9)'
      }}
    >
      {/* Artwork */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <div
          style={{
            width: '100%',
            paddingTop: '100%',
            borderRadius: '10px',
            background: '#1a1a1a',
            overflow: 'hidden',
            position: 'relative',
            border: isActive ? '2px solid #1E90FF' : '1px solid #222',
          }}
        >
          {art && (
            <img
              src={art}
              alt={track.title}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '9px',
              }}
            />
          )}
        </div>

        {/* Play FAB */}
        <button
          className="play-fab"
          onClick={handlePlay}
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#1E90FF',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isActive ? 1 : 0,
            transform: isActive ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.9)',
            transition: 'opacity 0.2s, transform 0.2s',
            boxShadow: '0 4px 20px rgba(30,144,255,0.4)',
          }}
        >
          <Play size={18} color="#fff" fill="#fff" style={{ marginLeft: '2px' }} />
        </button>
      </div>

      {/* Info */}
      <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
        {track.title}
      </p>
      <p style={{ color: '#666', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {track.artist}
      </p>
    </div>
  )
}
