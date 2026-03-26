import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Pause, Heart, Clock, Library, TrendingUp, Music2, X, Shuffle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { usePlayer } from '../../contexts/PlayerContext'
import { useIsMobile } from '../../hooks/useIsMobile'
import { db } from '../../firebase'
import { collection, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore'
import TrackCard from '../shared/TrackCard'

const getGreeting = (firstName) => {
  const h = new Date().getHours()
  const name = firstName || 'Name'
  if (h >= 5 && h < 12) return `Good morning, ${name}.`
  if (h >= 12 && h < 17) return `Good afternoon, ${name}.`
  if (h >= 17 && h < 22) return `Good evening, ${name}.`
  return `Welcome back, ${name}.`
}

// Featured demo tracks (YouTube video IDs)
const DEMO_TRACKS = [
  { id: '4NRXx6U8ABQ', title: 'Blinding Lights', artist: 'The Weeknd', artwork_url: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/mqdefault.jpg', duration: 0 },
  { id: 'JGwWNGJdvx8', title: 'Shape of You', artist: 'Ed Sheeran', artwork_url: 'https://i.ytimg.com/vi/JGwWNGJdvx8/mqdefault.jpg', duration: 0 },
  { id: 'TUVcZfQe-Kw', title: 'Levitating', artist: 'Dua Lipa', artwork_url: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/mqdefault.jpg', duration: 0 },
  { id: 'E07s5ZYygMg', title: 'Watermelon Sugar', artist: 'Harry Styles', artwork_url: 'https://i.ytimg.com/vi/E07s5ZYygMg/mqdefault.jpg', duration: 0 },
]

const QUICK_LINKS = [
  { label: 'Liked Songs', to: '/app/liked', color: '#1E90FF', icon: Heart },
  { label: 'Recently Played', to: '/app/recent', color: '#8B5CF6', icon: Clock },
  { label: 'Your Library', to: '/app/library', color: '#10B981', icon: Library },
]

export default function Home() {
  const { userProfile } = useAuth()
  const { user } = useAuth()
  const { playTrack, currentTrack } = usePlayer()
  const navigate = useNavigate()
  const [recentTracks, setRecentTracks] = useState([])
  const [likedTracks, setLikedTracks] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [artistTracks, setArtistTracks] = useState([])
  const [artistName, setArtistName] = useState('')
  const [dailyMixes, setDailyMixes] = useState([])
  const [activeMix, setActiveMix] = useState(null) // open mix detail modal

  useEffect(() => {
    if (!user) return

    // Recently played
    const recentQ = query(
      collection(db, 'users', user.uid, 'recentlyPlayed'),
      orderBy('playedAt', 'desc'),
      limit(6)
    )
    const unsubRecent = onSnapshot(recentQ, (snap) => {
      setRecentTracks(snap.docs.map((d) => ({ ...d.data(), _id: d.id })))
    })

    // Liked songs
    const likedQ = query(
      collection(db, 'users', user.uid, 'likedSongs'),
      orderBy('likedAt', 'desc'),
      limit(6)
    )
    const unsubLiked = onSnapshot(likedQ, (snap) => {
      setLikedTracks(snap.docs.map((d) => ({ ...d.data(), _id: d.id })))
    })

    // Playlists
    const playQ = query(
      collection(db, 'users', user.uid, 'playlists'),
      orderBy('createdAt', 'desc'),
      limit(4)
    )
    const unsubPlay = onSnapshot(playQ, (snap) => {
      setPlaylists(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })

    return () => { unsubRecent(); unsubLiked(); unsubPlay() }
  }, [user])

  // Daily Mixes based on recently played artists
  useEffect(() => {
    if (!recentTracks.length) return

    // Tally artists from recently played
    const artistMap = {}
    recentTracks.forEach((t) => {
      if (!t.artist) return
      if (!artistMap[t.artist]) artistMap[t.artist] = { artist: t.artist, count: 0, coverUrl: t.artwork_url }
      artistMap[t.artist].count++
    })
    const topArtists = Object.values(artistMap).sort((a, b) => b.count - a.count).slice(0, 3)
    if (!topArtists.length) return

    const apiKey = userProfile?.settings?.youtubeApiKey
    if (!apiKey) {
      // Show cards without pre-loaded tracks — they'll fetch on click
      setDailyMixes(topArtists.map((a, i) => ({
        name: `Daily Mix ${i + 1}`,
        artist: a.artist,
        coverUrl: a.coverUrl,
        tracks: [],
      })))
      return
    }

    let cancelled = false
    const fetchMixes = async () => {
      const mixes = await Promise.all(
        topArtists.map(async (a, i) => {
          try {
            const q = encodeURIComponent(a.artist + ' official music')
            const url = apiKey
              ? `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&q=${q}&maxResults=12&key=${apiKey}`
              : `/api/youtube-search?q=${q}&maxResults=12`
            const res = await fetch(url)
            const data = await res.json()
            const tracks = (data.items || [])
              .filter((item) => item.id?.videoId)
              .map((item) => ({
                id: item.id.videoId,
                title: item.snippet.title,
                artist: item.snippet.channelTitle,
                artwork_url: `https://i.ytimg.com/vi/${item.id.videoId}/mqdefault.jpg`,
                duration: 0,
              }))
            return {
              name: `Daily Mix ${i + 1}`,
              artist: a.artist,
              coverUrl: a.coverUrl || tracks[0]?.artwork_url,
              tracks,
            }
          } catch {
            return { name: `Daily Mix ${i + 1}`, artist: a.artist, coverUrl: a.coverUrl, tracks: [] }
          }
        })
      )
      if (!cancelled) setDailyMixes(mixes)
    }
    fetchMixes()
    return () => { cancelled = true }
  }, [recentTracks, userProfile?.settings?.youtubeApiKey])

  // Artist-based suggestions
  useEffect(() => {
    const apiKey = userProfile?.settings?.youtubeApiKey
    if (!currentTrack?.artist || !apiKey) { setArtistTracks([]); return }
    const artist = currentTrack.artist
    const currentTitle = currentTrack.title?.toLowerCase() || ''
    setArtistName(artist)
    let cancelled = false

    const run = async () => {
      try {
        const q = encodeURIComponent(artist + ' official')
        const searchUrl = apiKey
          ? `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&q=${q}&maxResults=15&key=${apiKey}`
          : `/api/youtube-search?q=${q}&maxResults=15`
        const searchRes = await fetch(searchUrl)
        const data = await searchRes.json()
        const candidates = (data.items || []).filter(
          (i) => i.id?.videoId && i.id.videoId !== currentTrack.id
        )
        if (!candidates.length || cancelled) return

        // Fetch durations to filter out Shorts (<90s)
        const ids = candidates.map((i) => i.id.videoId).join(',')
        const detailsUrl = apiKey
          ? `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${apiKey}`
          : `/api/youtube-details?ids=${encodeURIComponent(ids)}`
        const detailsRes = await fetch(detailsUrl)
        const detailsData = detailsRes.ok ? await detailsRes.json() : { items: [] }
        const durationMap = {}
        for (const v of detailsData.items || []) {
          const d = v.contentDetails?.duration || ''
          const m = d.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
          if (m) durationMap[v.id] = ((+m[1]||0)*3600 + (+m[2]||0)*60 + (+m[3]||0)) * 1000
        }

        const titleKeywords = currentTitle.split(' ').filter((w) => w.length > 3)
        const tracks = candidates
          .filter((i) => {
            const dur = durationMap[i.id.videoId] || 0
            if (dur > 0 && dur < 90000) return false  // filter Shorts
            // Skip tracks whose title contains all the same keywords as the current track
            const itemTitle = i.snippet.title.toLowerCase()
            if (titleKeywords.length > 0 && titleKeywords.every((w) => itemTitle.includes(w))) return false
            return true
          })
          .slice(0, 6)
          .map((i) => ({
            id: i.id.videoId,
            title: i.snippet.title,
            artist: i.snippet.channelTitle,
            artwork_url: `https://i.ytimg.com/vi/${i.id.videoId}/mqdefault.jpg`,
            duration: durationMap[i.id.videoId] || 0,
          }))

        if (!cancelled) setArtistTracks(tracks)
      } catch (_) {}
    }

    run()
    return () => { cancelled = true }
  }, [currentTrack?.artist, currentTrack?.id, userProfile?.settings?.youtubeApiKey])

  const greeting = getGreeting(userProfile?.firstName)
  const isMobile = useIsMobile()

  return (
    <div style={{ padding: isMobile ? '20px 16px 32px' : '32px 32px 40px', maxWidth: '1400px' }}>
      {/* Greeting */}
      <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, marginBottom: '32px', letterSpacing: '-0.02em' }}>
        {greeting}
      </h1>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '48px' }}>
        {QUICK_LINKS.map(({ label, to, color, icon: Icon }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            style={{
              background: '#111',
              border: '1px solid #1a1a1a',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.15s',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#111'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ width: 42, height: 42, borderRadius: '10px', background: `${color}22`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Daily Mixes */}
      {dailyMixes.length > 0 && (
        <Section title={`Made for ${userProfile?.firstName || 'You'}`}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {dailyMixes.map((mix, i) => (
              <MixCard
                key={i}
                mix={mix}
                onClick={() => setActiveMix(mix)}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Daily Mix detail modal */}
      {activeMix && (
        <DailyMixModal mix={activeMix} onClose={() => setActiveMix(null)} />
      )}

      {/* Recently played */}
      {recentTracks.length > 0 && (
        <Section title="Recently Played" onMore={() => navigate('/app/recent')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {recentTracks.map((t, i) => (
              <TrackCard key={t._id} track={t} queue={recentTracks} index={i} />
            ))}
          </div>
        </Section>
      )}

      {/* Liked songs */}
      {likedTracks.length > 0 && (
        <Section title="Liked Songs" onMore={() => navigate('/app/liked')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {likedTracks.map((t, i) => (
              <TrackCard key={t._id} track={t} queue={likedTracks} index={i} />
            ))}
          </div>
        </Section>
      )}

      {/* Playlists */}
      {playlists.length > 0 && (
        <Section title="Your Playlists" onMore={() => navigate('/app/library')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {playlists.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} onClick={() => navigate(`/app/playlist/${pl.id}`)} />
            ))}
          </div>
        </Section>
      )}

      {/* Artist suggestions */}
      {artistTracks.length > 0 && (
        <Section title={`More from ${artistName}`}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {artistTracks.map((t, i) => (
              <TrackCard key={t.id} track={t} queue={artistTracks} index={i} />
            ))}
          </div>
        </Section>
      )}

      {/* Featured / discover */}
      <Section title="Featured on Radio Dugo">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
          {DEMO_TRACKS.map((t, i) => (
            <TrackCard key={t.id} track={t} queue={DEMO_TRACKS} index={i} />
          ))}
        </div>
      </Section>

      {/* Tips when no content and nothing playing yet */}
      {recentTracks.length === 0 && likedTracks.length === 0 && !currentTrack && (
        <div
          style={{
            background: 'rgba(30,144,255,0.06)',
            border: '1px solid rgba(30,144,255,0.15)',
            borderRadius: '16px',
            padding: '28px 32px',
            marginBottom: '40px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <TrendingUp size={20} color="#1E90FF" />
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>Getting Started</h3>
          </div>
          <ul style={{ color: '#888', fontSize: '0.88rem', lineHeight: 1.8, paddingLeft: '0', listStyle: 'none' }}>
            <li>→ Head to <span style={{ color: '#1E90FF', cursor: 'pointer' }} onClick={() => navigate('/app/search')}>Search</span> to find and play music</li>
            <li>→ Go to <span style={{ color: '#1E90FF', cursor: 'pointer' }} onClick={() => navigate('/app/settings')}>Settings</span> to add your YouTube Data API v3 key for full search</li>
            <li>→ Press <kbd style={{ background: '#222', border: '1px solid #333', borderRadius: '4px', padding: '2px 6px', fontSize: '0.78rem' }}>Space</kbd> to play/pause. <kbd style={{ background: '#222', border: '1px solid #333', borderRadius: '4px', padding: '2px 6px', fontSize: '0.78rem' }}>Alt+→</kbd> / <kbd style={{ background: '#222', border: '1px solid #333', borderRadius: '4px', padding: '2px 6px', fontSize: '0.78rem' }}>Alt+←</kbd> to skip</li>
          </ul>
        </div>
      )}
    </div>
  )
}

function Section({ title, onMore, children }) {
  return (
    <div style={{ marginBottom: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
          {title}
        </h2>
        {onMore && (
          <button
            onClick={onMore}
            style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
          >
            See all
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function DailyMixModal({ mix, onClose }) {
  const { playTrack, currentTrack, isPlaying, togglePlay, toggleShuffle, shuffle } = usePlayer()

  const playAll = () => {
    if (mix.tracks.length > 0) playTrack(mix.tracks[0], mix.tracks, 0)
  }

  const playShuffle = () => {
    if (mix.tracks.length === 0) return
    const idx = Math.floor(Math.random() * mix.tracks.length)
    if (!shuffle) toggleShuffle()
    playTrack(mix.tracks[idx], mix.tracks, idx)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '700px',
          background: '#111', borderTop: '1px solid #222',
          borderRadius: '20px 20px 0 0',
          maxHeight: '85vh', display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Modal header */}
        <div style={{ padding: '28px 28px 20px', display: 'flex', gap: '20px', alignItems: 'flex-end', background: 'linear-gradient(180deg, #1a2744 0%, #111 100%)', flexShrink: 0 }}>
          {/* Cover */}
          <div style={{ width: 110, height: 110, borderRadius: '12px', overflow: 'hidden', flexShrink: 0, position: 'relative', border: '1px solid #222' }}>
            {mix.coverUrl && (
              <img src={mix.coverUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(30,144,255,0.4), rgba(99,102,241,0.35))' }} />
            <div style={{ position: 'absolute', bottom: '8px', left: '8px' }}>
              <p style={{ color: '#fff', fontWeight: 900, fontSize: '0.85rem' }}>{mix.name}</p>
            </div>
          </div>
          {/* Info */}
          <div style={{ flex: 1 }}>
            <p style={{ color: '#888', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Daily Mix</p>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.02em', marginBottom: '4px' }}>{mix.name}</h2>
            <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '16px' }}>Based on {mix.artist} · {mix.tracks.length} tracks</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={playAll}
                title="Play"
                style={{ width: 48, height: 48, borderRadius: '50%', background: '#1E90FF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(30,144,255,0.4)', transition: 'transform 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Play size={20} color="#fff" fill="#fff" style={{ marginLeft: '2px' }} />
              </button>
              <button
                onClick={playShuffle}
                title="Shuffle play"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: shuffle ? '#1E90FF' : '#888', display: 'flex', padding: '12px', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = shuffle ? '#1E90FF' : '#888')}
              >
                <Shuffle size={22} />
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex', padding: '4px', alignSelf: 'flex-start', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
          >
            <X size={22} />
          </button>
        </div>

        {/* Track list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0 24px' }}>
          {mix.tracks.length === 0 ? (
            <p style={{ color: '#555', textAlign: 'center', padding: '48px', fontSize: '0.88rem' }}>Add your YouTube API key in Settings to load tracks</p>
          ) : (
            mix.tracks.map((track, i) => {
              const isActive = currentTrack?.id === track.id
              return (
                <div
                  key={track.id}
                  onClick={() => isActive ? togglePlay() : playTrack(track, mix.tracks, i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '8px 28px', cursor: 'pointer', transition: 'background 0.15s',
                    background: isActive ? 'rgba(30,144,255,0.08)' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#1a1a1a' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ color: isActive ? '#1E90FF' : '#555', fontSize: '0.8rem', minWidth: '20px', textAlign: 'right' }}>
                    {isActive && isPlaying ? '▶' : i + 1}
                  </span>
                  <div style={{ width: 42, height: 42, borderRadius: '6px', background: '#1a1a1a', flexShrink: 0, overflow: 'hidden' }}>
                    {track.artwork_url && <img src={track.artwork_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ color: isActive ? '#1E90FF' : '#fff', fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title}</p>
                    <p style={{ color: '#555', fontSize: '0.76rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>{track.artist}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

function MixCard({ mix, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#111',
        border: '1px solid #1a1a1a',
        borderRadius: '14px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'background 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1a1a')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#111')}
    >
      {/* Cover */}
      <div style={{ width: '100%', paddingTop: '100%', borderRadius: '10px', background: 'linear-gradient(135deg, #0d1b3e, #1a0d3e)', position: 'relative', overflow: 'hidden', marginBottom: '12px', border: '1px solid #222' }}>
        {mix.coverUrl && (
          <img
            src={mix.coverUrl}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(30,144,255,0.4) 0%, rgba(99,102,241,0.35) 100%)' }} />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px' }}>
          <p style={{ color: '#fff', fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.01em', textShadow: '0 1px 8px rgba(0,0,0,0.7)' }}>
            {mix.name}
          </p>
        </div>
      </div>
      <p style={{ color: '#888', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        Based on {mix.artist}
      </p>
    </div>
  )
}

function PlaylistCard({ playlist, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '14px', padding: '16px', cursor: 'pointer', transition: 'background 0.2s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1a1a')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#111')}
    >
      <div style={{ width: '100%', paddingTop: '100%', background: '#1a1a1a', borderRadius: '10px', marginBottom: '12px', position: 'relative', overflow: 'hidden', border: '1px solid #222' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {playlist.coverUrl
            ? <img src={playlist.coverUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Library size={28} color="#333" />
          }
        </div>
      </div>
      <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{playlist.name}</p>
      <p style={{ color: '#555', fontSize: '0.78rem', marginTop: '4px' }}>{(playlist.tracks || []).length} tracks</p>
    </div>
  )
}
