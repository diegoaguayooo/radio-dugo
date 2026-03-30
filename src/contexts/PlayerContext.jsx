import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react'
import {
  doc,
  collection,
  addDoc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  onSnapshot,
  deleteDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

const PlayerContext = createContext(null)

export const usePlayer = () => {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}

// Show/hide the fixed yt-player div (outside React)
const setYTPlayerVisible = (visible) => {
  const el = document.getElementById('yt-player')
  if (el) el.style.opacity = visible ? '1' : '0'
}

export const PlayerProvider = ({ children }) => {
  const { user } = useAuth()

  const [currentTrack, setCurrentTrack] = useState(null)
  const [queue, setQueue] = useState([])
  const [queueIndex, setQueueIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(70)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentPos, setCurrentPos] = useState(0)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState('none')
  const [playerReady, setPlayerReady] = useState(false)
  const [likedIds, setLikedIds] = useState(new Set())
  const [showQueue, setShowQueue] = useState(false)
  const [djEnabled, setDjEnabled] = useState(false)

  const toggleDJ = useCallback(() => setDjEnabled((v) => !v), [])

  const ytPlayerRef = useRef(null)
  const progressTimerRef = useRef(null)
  const handlersRef = useRef({})
  const silentAudioRef = useRef(null)

  const repeatRef = useRef(repeat)
  const shuffleRef = useRef(shuffle)
  const queueRef = useRef(queue)
  const queueIndexRef = useRef(queueIndex)

  repeatRef.current = repeat
  shuffleRef.current = shuffle
  queueRef.current = queue
  queueIndexRef.current = queueIndex

  // ─── Silent audio keepalive — keeps OS audio session alive so the OS
  //     shows lock screen controls and allows background playback (Android).
  //     iOS Safari cannot do background audio in web apps; this is a system limit.
  useEffect(() => {
    // Build a 1-second silent WAV in memory — no network request needed
    const rate = 8000
    const samples = rate
    const buf = new ArrayBuffer(44 + samples)
    const v = new DataView(buf)
    const s = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)) }
    s(0, 'RIFF'); v.setUint32(4, 36 + samples, true); s(8, 'WAVE')
    s(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
    v.setUint32(24, rate, true); v.setUint32(28, rate, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true)
    s(36, 'data'); v.setUint32(40, samples, true)
    new Uint8Array(buf, 44).fill(0x80) // 0x80 = silence for 8-bit unsigned PCM
    const url = URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }))
    const audio = new Audio(url)
    audio.loop = true
    audio.volume = 0
    silentAudioRef.current = audio
    return () => { audio.pause(); audio.src = ''; URL.revokeObjectURL(url) }
  }, [])

  // ─── Progress polling ──────────────────────────────────────────────────────
  const startProgressTimer = useCallback(() => {
    clearInterval(progressTimerRef.current)
    progressTimerRef.current = setInterval(() => {
      const p = ytPlayerRef.current
      if (!p || typeof p.getCurrentTime !== 'function') return
      const cur = p.getCurrentTime() * 1000
      const dur = p.getDuration() * 1000
      if (dur > 0) {
        setCurrentPos(cur)
        setProgress((cur / dur) * 100)
        setDuration(dur)
        // Keep lock screen progress bar in sync
        if ('mediaSession' in navigator && navigator.mediaSession.setPositionState) {
          try {
            navigator.mediaSession.setPositionState({
              duration: p.getDuration(),
              playbackRate: 1,
              position: p.getCurrentTime(),
            })
          } catch (_) {}
        }
      }
    }, 500)
  }, [])

  const stopProgressTimer = useCallback(() => {
    clearInterval(progressTimerRef.current)
  }, [])

  // ─── YouTube Player init (element lives in index.html, never destroyed) ───
  useEffect(() => {
    const create = () => {
      if (ytPlayerRef.current) return
      ytPlayerRef.current = new window.YT.Player('yt-player', {
        height: '56',
        width: '56',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          fs: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            setPlayerReady(true)
            ytPlayerRef.current.setVolume(70)
          },
          onStateChange: (e) => {
            const State = window.YT.PlayerState
            if (e.data === State.PLAYING) {
              setIsPlaying(true)
              startProgressTimer()
            } else if (e.data === State.PAUSED) {
              setIsPlaying(false)
              stopProgressTimer()
            } else if (e.data === State.ENDED) {
              stopProgressTimer()
              handlersRef.current.handleTrackEnd?.()
            }
          },
          onError: () => {
            handlersRef.current.handleSkipNext?.()
          },
        },
      })
    }

    if (window.YT && window.YT.Player) {
      create()
    } else {
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        prev?.()
        create()
      }
    }

    return () => stopProgressTimer()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Play a track ─────────────────────────────────────────────────────────
  const playTrack = useCallback(
    (track, newQueue = null, index = 0) => {
      const p = ytPlayerRef.current
      if (!p) return

      if (newQueue !== null) {
        setQueue(newQueue)
        setQueueIndex(index)
        queueRef.current = newQueue
        queueIndexRef.current = index
      }

      setCurrentTrack(track)
      setProgress(0)
      setCurrentPos(0)
      setDuration(0)
      // Keep the YouTube player hidden — artwork_url thumbnail is shown as cover instead
      setYTPlayerVisible(false)

      p.loadVideoById(track.id)
      // Explicit play command — needed in some browser autoplay contexts
      setTimeout(() => {
        try { p.playVideo() } catch (_) {}
      }, 100)

      if (user) saveRecentlyPlayed(track)
    },
    [user]
  )

  const saveRecentlyPlayed = async (track) => {
    try {
      const colRef = collection(db, 'users', user.uid, 'recentlyPlayed')
      const q = query(colRef, where('id', '==', track.id))
      const snap = await getDocs(q)
      snap.forEach((d) => deleteDoc(d.ref))
      await addDoc(colRef, { ...track, playedAt: serverTimestamp() })
      const all = await getDocs(query(colRef, orderBy('playedAt', 'asc')))
      if (all.size > 50) {
        all.docs.slice(0, all.size - 50).forEach((d) => deleteDoc(d.ref))
      }
    } catch (_) {}
  }

  const togglePlay = useCallback(() => {
    const p = ytPlayerRef.current
    if (!p || !currentTrack) return
    if (isPlaying) p.pauseVideo()
    else p.playVideo()
  }, [isPlaying, currentTrack])

  const handleSkipNext = useCallback(() => {
    const q = queueRef.current
    const idx = queueIndexRef.current
    if (q.length === 0) return

    let next
    if (shuffleRef.current) {
      next = Math.floor(Math.random() * q.length)
    } else {
      next = idx + 1
      if (next >= q.length) {
        if (repeatRef.current === 'all') next = 0
        else { setIsPlaying(false); return }
      }
    }

    setQueueIndex(next)
    queueIndexRef.current = next
    playTrack(q[next], null)
  }, [playTrack])

  const handleTrackEnd = useCallback(() => {
    if (repeatRef.current === 'one') {
      const p = ytPlayerRef.current
      if (p) { p.seekTo(0, true); p.playVideo() }
      return
    }
    handleSkipNext()
  }, [handleSkipNext])

  handlersRef.current.handleTrackEnd = handleTrackEnd
  handlersRef.current.handleSkipNext = handleSkipNext

  const handleSkipPrev = useCallback(() => {
    const p = ytPlayerRef.current
    if (currentPos > 3000) {
      if (p) p.seekTo(0, true)
      setProgress(0)
      return
    }
    const q = queueRef.current
    const idx = queueIndexRef.current
    if (q.length === 0) return
    let prev = idx - 1
    if (prev < 0) prev = repeatRef.current === 'all' ? q.length - 1 : 0
    setQueueIndex(prev)
    queueIndexRef.current = prev
    playTrack(q[prev], null)
  }, [currentPos, playTrack])

  const seekTo = useCallback((pct) => {
    const p = ytPlayerRef.current
    if (!p) return
    const dur = p.getDuration()
    if (dur > 0) p.seekTo((pct / 100) * dur, true)
  }, [])

  const changeVolume = useCallback((v) => {
    setVolume(v)
    const p = ytPlayerRef.current
    if (p) p.setVolume(v)
  }, [])

  const addToQueue = useCallback((track) => {
    setQueue((prev) => {
      const next = [...prev, track]
      queueRef.current = next
      return next
    })
  }, [])

  const removeFromQueue = useCallback((idx) => {
    setQueue((prev) => {
      const next = prev.filter((_, i) => i !== idx)
      queueRef.current = next
      return next
    })
  }, [])

  const toggleRepeat = useCallback(() => {
    setRepeat((prev) => {
      const next = prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none'
      repeatRef.current = next
      return next
    })
  }, [])

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => {
      shuffleRef.current = !prev
      return !prev
    })
  }, [])

  // ─── Liked songs — real-time onSnapshot keeps heart state always in sync ──
  useEffect(() => {
    if (!user) { setLikedIds(new Set()); return }
    const unsub = onSnapshot(
      collection(db, 'users', user.uid, 'likedSongs'),
      (snap) => setLikedIds(new Set(snap.docs.map((d) => d.id))),
      () => {}
    )
    return unsub
  }, [user])

  const isLiked = useCallback((trackId) => likedIds.has(String(trackId)), [likedIds])

  const toggleLike = useCallback(
    async (track) => {
      if (!user) return
      const id = String(track.id)
      const ref = doc(db, 'users', user.uid, 'likedSongs', id)
      if (likedIds.has(id)) {
        setLikedIds((prev) => { const s = new Set(prev); s.delete(id); return s })
        await deleteDoc(ref)
      } else {
        setLikedIds((prev) => new Set([...prev, id]))
        await setDoc(ref, { ...track, likedAt: new Date() })
      }
    },
    [user, likedIds]
  )

  // ─── Media Session API (lock screen controls + background audio) ──────────
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.setActionHandler('play', () => {
      const p = ytPlayerRef.current
      if (p) p.playVideo()
    })
    navigator.mediaSession.setActionHandler('pause', () => {
      const p = ytPlayerRef.current
      if (p) p.pauseVideo()
    })
    navigator.mediaSession.setActionHandler('nexttrack', () => handleSkipNext())
    navigator.mediaSession.setActionHandler('previoustrack', () => handleSkipPrev())
  }, [handleSkipNext, handleSkipPrev])

  useEffect(() => {
    if (!currentTrack || !('mediaSession' in navigator)) return
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title || 'Unknown Track',
        artist: currentTrack.artist || 'Radio Dugo',
        artwork: currentTrack.artwork_url
          ? [{ src: currentTrack.artwork_url, sizes: '300x300', type: 'image/jpeg' }]
          : [],
      })
    } catch (_) {}
  }, [currentTrack])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
    } catch (_) {}
    // Sync silent audio keepalive with playback state
    const sa = silentAudioRef.current
    if (!sa) return
    if (isPlaying) sa.play().catch(() => {})
    else sa.pause()
  }, [isPlaying])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.code === 'Space') { e.preventDefault(); togglePlay() }
      if (e.code === 'ArrowRight' && e.altKey) handleSkipNext()
      if (e.code === 'ArrowLeft' && e.altKey) handleSkipPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePlay, handleSkipNext, handleSkipPrev])

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        queueIndex,
        isPlaying,
        volume,
        progress,
        duration,
        currentPos,
        shuffle,
        repeat,
        playerReady,
        showQueue,
        likedIds,
        isLiked,
        toggleLike,
        playTrack,
        togglePlay,
        skipNext: handleSkipNext,
        skipPrev: handleSkipPrev,
        seekTo,
        setVolume: changeVolume,
        toggleRepeat,
        toggleShuffle,
        addToQueue,
        removeFromQueue,
        setQueue,
        setQueueIndex,
        setShowQueue,
        djEnabled,
        toggleDJ,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}
