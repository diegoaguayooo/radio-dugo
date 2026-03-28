import React, { useEffect, useState } from 'react'
import { BarChart2, Music2, Heart, ListMusic, Users, Clock, TrendingUp } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../firebase'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'

export default function Stats() {
  const { user, userProfile } = useAuth()
  const [recentPlays, setRecentPlays] = useState([])
  const [likedCount, setLikedCount] = useState(0)
  const [playlistCount, setPlaylistCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let resolvedCount = 0
    const resolve = () => { if (++resolvedCount >= 3) setLoading(false) }

    const unsubRecent = onSnapshot(
      query(collection(db, 'users', user.uid, 'recentlyPlayed'), orderBy('playedAt', 'desc'), limit(50)),
      (snap) => { setRecentPlays(snap.docs.map((d) => ({ ...d.data(), _id: d.id }))); resolve() },
      (err) => { console.error(err); resolve() }
    )
    const unsubLiked = onSnapshot(
      collection(db, 'users', user.uid, 'likedSongs'),
      (snap) => { setLikedCount(snap.size); resolve() },
      (err) => { console.error(err); resolve() }
    )
    const unsubPlaylists = onSnapshot(
      collection(db, 'users', user.uid, 'playlists'),
      (snap) => { setPlaylistCount(snap.size); resolve() },
      (err) => { console.error(err); resolve() }
    )
    return () => { unsubRecent(); unsubLiked(); unsubPlaylists() }
  }, [user])

  // Compute top artists from recently played
  const artistMap = {}
  recentPlays.forEach((t) => {
    if (!t.artist) return
    if (!artistMap[t.artist]) artistMap[t.artist] = { name: t.artist, count: 0, artwork: t.artwork_url }
    artistMap[t.artist].count++
  })
  const topArtists = Object.values(artistMap).sort((a, b) => b.count - a.count).slice(0, 5)
  const maxArtistCount = topArtists[0]?.count || 1

  const totalListenMs = recentPlays.reduce((acc, t) => acc + (t.duration || 0), 0)
  const totalMinutes = Math.round(totalListenMs / 60000)

  // Build a 7-day sparkline for songs played per day
  const dayMap = {}
  const now = Date.now()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 86400000)
    dayMap[d.toDateString()] = 0
  }
  recentPlays.forEach((t) => {
    if (!t.playedAt) return
    const ts = t.playedAt.toDate ? t.playedAt.toDate() : new Date(t.playedAt)
    const key = ts.toDateString()
    if (key in dayMap) dayMap[key]++
  })
  const sparkData = Object.values(dayMap)
  const sparkMax = Math.max(...sparkData, 1)

  if (loading) {
    return (
      <div className="page-enter" style={{ padding: '60px 32px' }}>
        {/* Skeleton cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '14px', marginBottom: '32px' }}>
          {[0,1,2,3,4].map((i) => (
            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '16px' }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: '200px', borderRadius: '16px' }} />
      </div>
    )
  }

  return (
    <div className="page-enter" style={{ padding: '32px 32px 60px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
        <BarChart2 size={26} color="#1E90FF" />
        <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}>
          Your Stats
        </h1>
      </div>
      <p style={{ color: '#444', fontSize: '0.88rem', marginBottom: '40px' }}>
        Based on your listening history · Last 50 plays
      </p>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '14px', marginBottom: '48px' }}>
        <StatCard icon={<Music2 size={20} />} label="Songs Played" value={recentPlays.length} sub="recently tracked" color="#1E90FF" sparkData={sparkData} sparkMax={sparkMax} />
        <StatCard icon={<Heart size={20} />} label="Liked Songs" value={likedCount} sub="in your library" color="#EC4899" />
        <StatCard icon={<ListMusic size={20} />} label="Playlists" value={playlistCount} sub="created" color="#8B5CF6" />
        <StatCard icon={<Users size={20} />} label="Artists" value={Object.keys(artistMap).length} sub="in recent plays" color="#10B981" />
        {totalMinutes > 0 && (
          <StatCard
            icon={<Clock size={20} />}
            label="Listen Time"
            value={totalMinutes < 60 ? `${totalMinutes}m` : `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}
            sub="estimated total"
            color="#F59E0B"
          />
        )}
      </div>

      {/* Top Artists */}
      {topArtists.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <TrendingUp size={18} color="#1E90FF" />
            <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}>Top Artists</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topArtists.map((a, i) => (
              <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: '#111', borderRadius: '12px', border: '1px solid #1a1a1a' }}>
                <span style={{ color: '#333', fontSize: '0.85rem', fontWeight: 700, minWidth: '20px', textAlign: 'right' }}>
                  {i + 1}
                </span>
                <div
                  style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: '#1a1a1a', overflow: 'hidden', flexShrink: 0, border: '1px solid #222',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {a.artwork
                    ? <img src={a.artwork} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Users size={18} color="#333" />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{a.name}</span>
                    <span style={{ color: '#444', fontSize: '0.78rem' }}>{a.count} play{a.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ height: '4px', borderRadius: '2px', background: '#1a1a1a', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${(a.count / maxArtistCount) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #1E90FF, #8B5CF6)',
                        borderRadius: '2px',
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent plays */}
      {recentPlays.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Clock size={18} color="#1E90FF" />
            <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}>Recently Played</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recentPlays.slice(0, 15).map((t, i) => (
              <div
                key={t._id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '10px 16px', background: '#111', borderRadius: '12px',
                  border: '1px solid #1a1a1a',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#161616')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#111')}
              >
                <span style={{ color: '#2a2a2a', fontSize: '0.8rem', fontWeight: 700, minWidth: '22px', textAlign: 'right' }}>
                  {i + 1}
                </span>
                <div style={{ width: 42, height: 42, borderRadius: '8px', background: '#1a1a1a', overflow: 'hidden', flexShrink: 0, border: '1px solid #222' }}>
                  {t.artwork_url && (
                    <img src={t.artwork_url} alt={t.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.title}
                  </p>
                  <p style={{ color: '#555', fontSize: '0.76rem', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.artist}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {recentPlays.length === 0 && likedCount === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <BarChart2 size={52} color="#1a1a1a" style={{ margin: '0 auto 16px', display: 'block' }} />
          <p style={{ color: '#555', fontWeight: 700, fontSize: '1.1rem' }}>No data yet</p>
          <p style={{ color: '#333', fontSize: '0.88rem', marginTop: '8px' }}>Start playing music to see your listening stats here</p>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, sub, color, sparkData, sparkMax }) {
  return (
    <div
      style={{
        background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px',
        padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px',
        transition: 'border-color 0.2s, background 0.2s',
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}30`; e.currentTarget.style.background = '#141414' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.background = '#111' }}
    >
      <div
        style={{
          width: 42, height: 42, borderRadius: '12px',
          background: `${color}14`, border: `1px solid ${color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ color: '#fff', fontWeight: 900, fontSize: '1.9rem', letterSpacing: '-0.03em', lineHeight: 1, fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}>
          {value}
        </p>
        <p style={{ color: '#ccc', fontWeight: 600, fontSize: '0.85rem', marginTop: '6px' }}>{label}</p>
        <p style={{ color: '#333', fontSize: '0.72rem', marginTop: '3px' }}>{sub}</p>
      </div>
      {/* Mini sparkline */}
      {sparkData && sparkMax > 0 && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '24px', marginTop: '2px' }}>
          {sparkData.map((v, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${Math.max(2, (v / sparkMax) * 100)}%`,
                background: v > 0 ? color : '#222',
                borderRadius: '2px',
                opacity: v > 0 ? 0.7 + (v / sparkMax) * 0.3 : 0.3,
                transition: 'height 0.4s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
