import React, { useState, useRef, useEffect } from 'react'
import { useIsMobile } from '../../hooks/useIsMobile'
import MobileFullPlayer from './MobileFullPlayer'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  ListMusic,
} from 'lucide-react'
import { usePlayer } from '../../contexts/PlayerContext'

const fmt = (ms) => {
  if (!ms || isNaN(ms)) return '0:00'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    currentPos,
    volume,
    shuffle,
    repeat,
    togglePlay,
    skipNext,
    skipPrev,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    isLiked,
    toggleLike,
    showQueue,
    setShowQueue,
  } = usePlayer()

  const [prevVol, setPrevVol] = useState(70)

  const progressRef = useRef(null)
  const volRef = useRef(null)
  const isDraggingVol = useRef(false)
  const isDraggingProgress = useRef(false)

  const getProgressFromEvent = (e) => {
    const rect = progressRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
  }

  const handleProgressMouseDown = (e) => {
    isDraggingProgress.current = true
    seekTo(getProgressFromEvent(e))
    const onMove = (ev) => { if (isDraggingProgress.current) seekTo(getProgressFromEvent(ev)) }
    const onUp = () => { isDraggingProgress.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const handleProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect()
    const pct = ((e.clientX - rect.left) / rect.width) * 100
    seekTo(Math.max(0, Math.min(100, pct)))
  }

  const getVolFromEvent = (e) => {
    const rect = volRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)))
  }

  const handleVolMouseDown = (e) => {
    isDraggingVol.current = true
    setVolume(getVolFromEvent(e))
    const onMove = (ev) => { if (isDraggingVol.current) setVolume(getVolFromEvent(ev)) }
    const onUp = () => { isDraggingVol.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVol(volume)
      setVolume(0)
    } else {
      setVolume(prevVol || 70)
    }
  }

  const VolumeIcon = volume === 0 ? VolumeX : volume < 40 ? Volume1 : Volume2
  const liked = currentTrack ? isLiked(currentTrack.id) : false
  const isMobile = useIsMobile()
  const [fullPlayerOpen, setFullPlayerOpen] = useState(false)

  const artwork = currentTrack?.artwork_url || null

  // ─── Mobile compact player ───────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {fullPlayerOpen && <MobileFullPlayer onClose={() => setFullPlayerOpen(false)} />}
        <div
          onClick={() => setFullPlayerOpen(true)}
          style={{ position: 'fixed', bottom: '60px', left: 0, right: 0, zIndex: 98, cursor: 'pointer' }}
        >
          {/* Thin progress strip */}
          <div style={{ height: '3px', background: '#1a1a1a' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#1E90FF', transition: 'width 0.1s linear' }} />
          </div>
          {/* Bar */}
          <div style={{ height: '72px', background: '#0d0d0d', borderTop: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '10px' }}>
            {/* Artwork */}
            <div style={{ width: 46, height: 46, borderRadius: 8, flexShrink: 0, overflow: 'hidden', background: '#1a1a1a', border: '1px solid #222', position: 'relative' }}>
              {artwork && <img src={artwork} alt={currentTrack?.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            {/* Title / artist */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentTrack?.title}</p>
              <p style={{ color: '#666', fontSize: '0.73rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>{currentTrack?.artist}</p>
            </div>
            {/* Like */}
            <button onClick={(e) => { e.stopPropagation(); toggleLike(currentTrack) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#1E90FF' : '#555', display: 'flex', padding: '8px', flexShrink: 0 }}>
              <Heart size={18} fill={liked ? '#1E90FF' : 'none'} />
            </button>
            {/* Prev */}
            <button onClick={(e) => { e.stopPropagation(); skipPrev() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', padding: '8px', flexShrink: 0 }}>
              <SkipBack size={22} />
            </button>
            {/* Play / Pause */}
            <button
              onClick={(e) => { e.stopPropagation(); togglePlay() }}
              style={{ width: 42, height: 42, borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              {isPlaying ? <Pause size={18} color="#000" fill="#000" /> : <Play size={18} color="#000" fill="#000" style={{ marginLeft: '2px' }} />}
            </button>
            {/* Next */}
            <button onClick={(e) => { e.stopPropagation(); skipNext() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', padding: '8px', flexShrink: 0 }}>
              <SkipForward size={22} />
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '88px',
        background: '#0d0d0d',
        borderTop: '1px solid #1e1e1e',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: '16px',
        zIndex: 100,
      }}
    >
      {/* ─── Left: track info ─── */}
      <div style={{ flex: '0 0 260px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '8px',
            background: '#1a1a1a',
            flexShrink: 0,
            overflow: 'hidden',
            border: '1px solid #222',
            position: 'relative',
          }}
        >
          {artwork && (
            <img
              src={artwork}
              alt={currentTrack?.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <p
            style={{
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {currentTrack?.title || 'No track playing'}
          </p>
          <p
            style={{
              color: '#777',
              fontSize: '0.75rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginTop: '2px',
            }}
          >
            {currentTrack?.artist || ''}
          </p>
        </div>
        {currentTrack && (
          <button
            onClick={() => toggleLike(currentTrack)}
            title={liked ? 'Remove from liked' : 'Like'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: liked ? '#1E90FF' : '#555',
              transition: 'color 0.2s, transform 0.15s',
              flexShrink: 0,
              display: 'flex',
              padding: '4px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Heart size={18} fill={liked ? '#1E90FF' : 'none'} />
          </button>
        )}
      </div>

      {/* ─── Center: controls + progress ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Control buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <ControlBtn
            onClick={toggleShuffle}
            active={shuffle}
            title="Shuffle"
          >
            <Shuffle size={18} />
          </ControlBtn>

          <ControlBtn onClick={skipPrev} title="Previous">
            <SkipBack size={20} />
          </ControlBtn>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#fff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s, background 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isPlaying
              ? <Pause size={18} color="#000" fill="#000" />
              : <Play size={18} color="#000" fill="#000" style={{ marginLeft: '2px' }} />
            }
          </button>

          <ControlBtn onClick={skipNext} title="Next">
            <SkipForward size={20} />
          </ControlBtn>

          <ControlBtn
            onClick={toggleRepeat}
            active={repeat !== 'none'}
            title={repeat === 'none' ? 'Enable repeat' : repeat === 'all' ? 'Repeat all' : 'Repeat one'}
          >
            {repeat === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </ControlBtn>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <span style={{ color: '#666', fontSize: '0.7rem', minWidth: '36px', textAlign: 'right' }}>
            {fmt(currentPos)}
          </span>
          <div
            ref={progressRef}
            className="progress-bar"
            onMouseDown={handleProgressMouseDown}
            onClick={handleProgressClick}
            style={{ flex: 1, position: 'relative', height: '16px', display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
          >
            <div className="progress-track" style={{ width: '100%', position: 'relative' }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
              {/* Drag thumb */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: `${progress}%`,
                transform: 'translate(-50%, -50%)',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                pointerEvents: 'none',
              }} />
            </div>
          </div>
          <span style={{ color: '#666', fontSize: '0.7rem', minWidth: '36px' }}>
            {fmt(duration)}
          </span>
        </div>
      </div>

      {/* ─── Right: volume + extras ─── */}
      <div style={{ flex: '0 0 260px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
        {/* Queue toggle */}
        <ControlBtn
          onClick={() => setShowQueue((v) => !v)}
          active={showQueue}
          title="Queue"
        >
          <ListMusic size={18} />
        </ControlBtn>

        {/* Volume */}
        <button
          onClick={toggleMute}
          title={volume === 0 ? 'Unmute' : 'Mute'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', transition: 'color 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
        >
          <VolumeIcon size={18} />
        </button>
        <div
          ref={volRef}
          onMouseDown={handleVolMouseDown}
          style={{ width: '90px', position: 'relative', height: '20px', display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: '#2a2a2a', position: 'relative' }}>
            <div style={{ width: `${volume}%`, height: '100%', borderRadius: '2px', background: '#1E90FF' }} />
            {/* Drag thumb */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: `${volume}%`,
              transform: 'translate(-50%, -50%)',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
              transition: 'transform 0.1s',
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ControlBtn({ children, onClick, active, title }) {
  const [tipVisible, setTipVisible] = useState(false)
  const tipTimer = useRef(null)

  const showTip = () => {
    clearTimeout(tipTimer.current)
    tipTimer.current = setTimeout(() => setTipVisible(true), 700)
  }
  const hideTip = () => {
    clearTimeout(tipTimer.current)
    setTipVisible(false)
  }

  useEffect(() => () => clearTimeout(tipTimer.current), [])

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={onClick}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: active ? '#1E90FF' : '#777',
          display: 'flex',
          padding: '4px',
          borderRadius: '6px',
          transition: 'color 0.2s, transform 0.15s',
          position: 'relative',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = active ? '#3aa3ff' : '#fff'; e.currentTarget.style.transform = 'scale(1.1)'; showTip() }}
        onMouseLeave={(e) => { e.currentTarget.style.color = active ? '#1E90FF' : '#777'; e.currentTarget.style.transform = 'scale(1)'; hideTip() }}
      >
        {children}
        {active && (
          <span style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: '#1E90FF' }} />
        )}
      </button>
      {tipVisible && title && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1a1a1a',
          color: '#e0e0e0',
          fontSize: '0.7rem',
          fontWeight: 600,
          padding: '5px 10px',
          borderRadius: '7px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 10000,
          border: '1px solid #2a2a2a',
          letterSpacing: '0.02em',
          animation: 'tooltip-in 0.12s ease forwards',
        }}>
          {title}
        </div>
      )}
    </div>
  )
}
