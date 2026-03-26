import React, { useEffect, useState, useRef } from 'react'
import { X, Mic2 } from 'lucide-react'
import { usePlayer } from '../../contexts/PlayerContext'
import { useIsMobile } from '../../hooks/useIsMobile'

const parseLRC = (lrc) => {
  if (!lrc) return []
  return lrc
    .split('\n')
    .map((line) => {
      const m = line.match(/^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
      if (!m) return null
      const ms =
        (parseInt(m[1]) * 60 + parseInt(m[2])) * 1000 +
        parseInt(m[3].padEnd(3, '0').slice(0, 3))
      return { time: ms, text: m[4].trim() }
    })
    .filter(Boolean)
}

export default function LyricsPanel() {
  const { currentTrack, currentPos, setShowLyrics } = usePlayer()
  const isMobile = useIsMobile()
  const [lyrics, setLyrics] = useState([])
  const [loading, setLoading] = useState(false)
  const [noLyrics, setNoLyrics] = useState(false)
  const activeRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!currentTrack) { setLyrics([]); setNoLyrics(false); return }
    setLoading(true)
    setNoLyrics(false)
    setLyrics([])

    const q = encodeURIComponent(`${currentTrack.title} ${currentTrack.artist}`)
    fetch(`https://lrclib.net/api/search?q=${q}`)
      .then((r) => r.json())
      .then((data) => {
        const item = Array.isArray(data) ? data[0] : null
        if (item?.syncedLyrics) {
          setLyrics(parseLRC(item.syncedLyrics))
        } else if (item?.plainLyrics) {
          setLyrics(
            item.plainLyrics
              .split('\n')
              .map((text, i) => ({ time: -1, text }))
          )
        } else {
          setNoLyrics(true)
        }
      })
      .catch(() => setNoLyrics(true))
      .finally(() => setLoading(false))
  }, [currentTrack?.id])

  // Current line index based on playback position
  const currentIndex = lyrics.reduce((best, line, i) => {
    if (line.time !== -1 && line.time <= currentPos) return i
    return best
  }, -1)

  // Auto-scroll current line into view
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentIndex])

  const isSynced = lyrics.some((l) => l.time !== -1)

  const mobileStyle = {
    position: 'fixed', inset: 0, zIndex: 201,
    width: '100%', height: '100%',
    background: '#0f0f0f',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  }
  const desktopStyle = {
    width: '300px', minWidth: '300px',
    background: '#0f0f0f',
    borderLeft: '1px solid #1a1a1a',
    display: 'flex', flexDirection: 'column',
    height: '100vh', overflow: 'hidden',
  }

  return (
    <div style={isMobile ? mobileStyle : desktopStyle}>
      {/* Header */}
      <div
        style={{
          padding: '24px 20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1a1a1a',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mic2 size={16} color="#1E90FF" />
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>Lyrics</h2>
        </div>
        <button
          onClick={() => setShowLyrics(false)}
          style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', display: 'flex', padding: '4px', transition: 'color 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
        >
          <X size={18} />
        </button>
      </div>

      {/* Track info */}
      {currentTrack && (
        <div style={{ padding: '16px 20px 0', flexShrink: 0 }}>
          <p style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentTrack.title}
          </p>
          <p style={{ color: '#555', fontSize: '0.78rem', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentTrack.artist}
          </p>
        </div>
      )}

      {/* Lyrics body */}
      <div
        ref={containerRef}
        style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 80px' }}
      >
        {!currentTrack && (
          <p style={{ color: '#444', textAlign: 'center', marginTop: '60px', fontSize: '0.88rem' }}>
            Play a song to see lyrics
          </p>
        )}
        {currentTrack && loading && (
          <p style={{ color: '#555', textAlign: 'center', marginTop: '60px', fontSize: '0.88rem' }}>
            Loading lyrics…
          </p>
        )}
        {currentTrack && !loading && noLyrics && (
          <p style={{ color: '#444', textAlign: 'center', marginTop: '60px', fontSize: '0.88rem' }}>
            No lyrics found for this track
          </p>
        )}

        {!isSynced && lyrics.length > 0 && (
          <p style={{ color: '#555', fontSize: '0.72rem', marginBottom: '16px', fontStyle: 'italic' }}>
            Static lyrics, no sync available
          </p>
        )}

        {lyrics.map((line, i) => {
          const isActive = isSynced && i === currentIndex
          const isPast = isSynced && i < currentIndex
          return (
            <p
              key={i}
              ref={isActive ? activeRef : null}
              style={{
                color: isActive ? '#fff' : isPast ? '#333' : '#555',
                fontSize: isActive ? '1.05rem' : '0.95rem',
                fontWeight: isActive ? 700 : 400,
                lineHeight: 1.7,
                marginBottom: line.text ? '8px' : '16px',
                transition: 'color 0.4s, font-size 0.3s',
                cursor: 'default',
                minHeight: line.text ? undefined : '8px',
              }}
            >
              {line.text || '\u00A0'}
            </p>
          )
        })}
      </div>
    </div>
  )
}
