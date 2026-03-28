import React from 'react'
import { Play, Pause } from 'lucide-react'
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
      className="track-card-hover"
      style={{
        background: isActive ? 'rgba(30,144,255,0.06)' : '#111',
        border: `1px solid ${isActive ? 'rgba(30,144,255,0.25)' : '#1a1a1a'}`,
        borderRadius: '14px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isActive ? 'rgba(30,144,255,0.1)' : '#181818'
        e.currentTarget.style.borderColor = isActive ? 'rgba(30,144,255,0.35)' : '#2a2a2a'
        e.currentTarget.style.transform = 'translateY(-2px)'
        const fab = e.currentTarget.querySelector('.play-fab')
        if (fab) { fab.style.opacity = '1'; fab.style.transform = 'translateY(0) scale(1)' }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isActive ? 'rgba(30,144,255,0.06)' : '#111'
        e.currentTarget.style.borderColor = isActive ? 'rgba(30,144,255,0.25)' : '#1a1a1a'
        e.currentTarget.style.transform = 'translateY(0)'
        const fab = e.currentTarget.querySelector('.play-fab')
        if (fab && !isActive) { fab.style.opacity = '0'; fab.style.transform = 'translateY(8px) scale(0.88)' }
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
            border: isActive ? '1.5px solid rgba(30,144,255,0.4)' : '1px solid #222',
            boxShadow: isActive ? '0 0 20px rgba(30,144,255,0.15)' : 'none',
            transition: 'box-shadow 0.3s, border-color 0.3s',
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

        {/* Play FAB — slides up from below */}
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
            background: 'linear-gradient(135deg, #1E90FF, #38b6ff)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isActive ? 1 : 0,
            transform: isActive ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.88)',
            transition: 'opacity 0.18s ease-out, transform 0.18s ease-out',
            boxShadow: '0 4px 20px rgba(30,144,255,0.45)',
          }}
        >
          {isActive && isPlaying
            ? <Pause size={17} color="#fff" fill="#fff" />
            : <Play size={17} color="#fff" fill="#fff" style={{ marginLeft: '2px' }} />
          }
        </button>
      </div>

      {/* Info */}
      <p style={{ color: isActive ? '#5badff' : '#fff', fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px', transition: 'color 0.2s' }}>
        {track.title}
      </p>
      <p style={{ color: '#555', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {track.artist}
      </p>
    </div>
  )
}
