import React, { useRef } from 'react'
import {
  Heart, SkipBack, SkipForward, Play, Pause,
  Shuffle, Repeat, Repeat1,
  ChevronDown, ListMusic,
} from 'lucide-react'
import { usePlayer } from '../../contexts/PlayerContext'

const fmt = (ms) => {
  if (!ms || isNaN(ms)) return '0:00'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export default function MobileFullPlayer({ onClose }) {
  const {
    currentTrack, isPlaying, progress, duration, currentPos,
    shuffle, repeat, togglePlay, skipNext, skipPrev, seekTo,
    toggleShuffle, toggleRepeat, isLiked, toggleLike,
    showQueue, setShowQueue,
  } = usePlayer()

  const progressRef = useRef(null)
  const touchStartY = useRef(null)
  const liked = currentTrack ? isLiked(currentTrack.id) : false
  const artwork = currentTrack?.artwork_url || null

  // ── Swipe down to close ──────────────────────────────────────────
  const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY }
  const onTouchEnd = (e) => {
    if (touchStartY.current !== null) {
      if (e.changedTouches[0].clientY - touchStartY.current > 80) onClose()
    }
    touchStartY.current = null
  }

  // ── Touch seek ───────────────────────────────────────────────────
  const handleProgressTouch = (e) => {
    e.stopPropagation()
    if (!progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const t = e.touches[0] || e.changedTouches[0]
    seekTo(Math.max(0, Math.min(100, ((t.clientX - rect.left) / rect.width) * 100)))
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(6,6,8,0.92)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 28px 36px',
        animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
      }}
    >
      {/* Blurred artwork background — more vibrant */}
      {artwork && (
        <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', pointerEvents: 'none' }}>
          <img
            src={artwork}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(60px) saturate(2.2)', opacity: 0.28, transform: 'scale(1.4)' }}
          />
          {/* Darken overlay so text stays readable */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,6,8,0.55) 0%, rgba(6,6,8,0.75) 60%, rgba(6,6,8,0.92) 100%)' }} />
        </div>
      )}

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', paddingTop: '14px', paddingBottom: '6px' }}>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', padding: '8px', marginLeft: '-8px' }}
        >
          <ChevronDown size={28} />
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ color: '#888', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Now Playing</p>
        </div>
        <div style={{ width: 44 }} />
      </div>

      {/* ── Artwork ─────────────────────────────────────────────── */}
      <div style={{
        width: '100%',
        paddingBottom: '100%',
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        background: '#1a1a1a',
        marginTop: '20px',
        marginBottom: '28px',
        boxShadow: '0 32px 72px rgba(0,0,0,0.8), 0 0 60px rgba(30,144,255,0.15)',
        border: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        {artwork && (
          <img
            src={artwork}
            alt={currentTrack?.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>

      {/* ── Track info + like ───────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <p style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
            {currentTrack?.title}
          </p>
          <p style={{ color: '#888', fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '4px' }}>
            {currentTrack?.artist}
          </p>
        </div>
        <button
          onClick={(e) => {
            toggleLike(currentTrack)
            e.currentTarget.classList.remove('like-pop')
            void e.currentTarget.offsetWidth
            e.currentTarget.classList.add('like-pop')
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#1E90FF' : '#666', display: 'flex', padding: '8px', flexShrink: 0, transition: 'color 0.2s' }}
        >
          <Heart size={26} fill={liked ? '#1E90FF' : 'none'} />
        </button>
      </div>

      {/* ── Progress bar ────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <div
          ref={progressRef}
          onTouchStart={handleProgressTouch}
          onTouchMove={handleProgressTouch}
          style={{ height: '5px', background: '#2a2a2a', borderRadius: '3px', position: 'relative', touchAction: 'none', marginBottom: '10px' }}
        >
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #1E90FF, #38b6ff)', borderRadius: '3px', transition: 'width 0.1s linear' }} />
          <div style={{
            position: 'absolute', top: '50%', left: `${progress}%`,
            transform: 'translate(-50%, -50%)',
            width: 16, height: 16, borderRadius: '50%',
            background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#555', fontSize: '0.72rem' }}>{fmt(currentPos)}</span>
          <span style={{ color: '#555', fontSize: '0.72rem' }}>{fmt(duration)}</span>
        </div>
      </div>

      {/* ── Playback controls ───────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        {/* Shuffle */}
        <button
          onClick={toggleShuffle}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: shuffle ? '#1E90FF' : '#555', display: 'flex', padding: '10px', position: 'relative', touchAction: 'manipulation' }}
        >
          <Shuffle size={22} />
          {shuffle && <span style={{ position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#1E90FF' }} />}
        </button>
        {/* Prev */}
        <button
          onClick={skipPrev}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', display: 'flex', padding: '8px', touchAction: 'manipulation' }}
        >
          <SkipBack size={34} fill="#ccc" />
        </button>
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          style={{
            width: 72, height: 72, borderRadius: '50%', background: '#fff', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 24px rgba(255,255,255,0.18)', flexShrink: 0, touchAction: 'manipulation',
          }}
        >
          {isPlaying
            ? <Pause size={30} color="#000" fill="#000" />
            : <Play size={30} color="#000" fill="#000" style={{ marginLeft: 4 }} />
          }
        </button>
        {/* Next */}
        <button
          onClick={skipNext}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', display: 'flex', padding: '8px', touchAction: 'manipulation' }}
        >
          <SkipForward size={34} fill="#ccc" />
        </button>
        {/* Repeat */}
        <button
          onClick={toggleRepeat}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: repeat !== 'none' ? '#1E90FF' : '#555', display: 'flex', padding: '10px', position: 'relative', touchAction: 'manipulation' }}
        >
          {repeat === 'one' ? <Repeat1 size={22} /> : <Repeat size={22} />}
          {repeat !== 'none' && <span style={{ position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#1E90FF' }} />}
        </button>
      </div>

      {/* ── Extra buttons ───────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '36px' }}>
        <button
          onClick={() => setShowQueue((v) => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: showQueue ? '#1E90FF' : '#555', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', touchAction: 'manipulation' }}
        >
          <ListMusic size={22} />
          <span>Queue</span>
        </button>
      </div>
    </div>
  )
}
