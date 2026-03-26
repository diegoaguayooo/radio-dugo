import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Search as SearchIcon, X, Music2, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../../contexts/PlayerContext'
import { useIsMobile } from '../../hooks/useIsMobile'
import TrackRow from '../shared/TrackRow'

const RECENT_KEY = 'radio_dugo_recent_searches'
const MAX_RECENT = 8

function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}
function saveRecentSearch(q) {
  const trimmed = q.trim()
  if (!trimmed) return
  const prev = getRecentSearches().filter((s) => s !== trimmed)
  localStorage.setItem(RECENT_KEY, JSON.stringify([trimmed, ...prev].slice(0, MAX_RECENT)))
}
function removeRecentSearch(q) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(getRecentSearches().filter((s) => s !== q)))
}

const parseISO8601 = (d) => {
  if (!d) return 0
  const m = d.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return 0
  return ((+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0)) * 1000
}

const GENRES = [
  { label: 'Hip-Hop', color: '#F59E0B', q: 'hip hop', icon: '🧢' },
  { label: 'Electronic', color: '#1E90FF', q: 'electronic music', icon: '⚡' },
  { label: 'Lo-Fi', color: '#8B5CF6', q: 'lofi chill beats', icon: '📼' },
  { label: 'Rock', color: '#EF4444', q: 'rock music', icon: '🎸' },
  { label: 'Pop', color: '#EC4899', q: 'pop music', icon: '💃' },
  { label: 'Jazz', color: '#10B981', q: 'jazz', icon: '🎷' },
  { label: 'Classical', color: '#6366F1', q: 'classical music', icon: '🎻' },
  { label: 'Ambient', color: '#0EA5E9', q: 'ambient music', icon: '🌊' },
  { label: 'R&B', color: '#F97316', q: 'rnb soul', icon: '💜' },
  { label: 'House', color: '#14B8A6', q: 'house music', icon: '🏠' },
]

export default function Search() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [recentSearches, setRecentSearches] = useState(getRecentSearches)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  const search = useCallback(
    async (q) => {
      if (!q.trim()) {
        setResults([])
        setHasSearched(false)
        return
      }

      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(q)}&maxResults=25`)
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.error?.message || `API error ${res.status}`)
        }
        const data = await res.json()
        await processResults(data, q)
      } catch (e) {
        setError('api_error')
        console.error(e)
      } finally {
        setLoading(false)
      }
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const processResults = async (data, q) => {
    const items = (data.items || []).filter((item) => item.id?.videoId)
    const ids = items.map((i) => i.id.videoId).join(',')

    let durationMap = {}
    try {
      const detailsRes = await fetch(`/api/youtube-details?ids=${encodeURIComponent(ids)}`)
      const detailsData = detailsRes.ok ? await detailsRes.json() : { items: [] }
      for (const v of detailsData.items || []) {
        durationMap[v.id] = parseISO8601(v.contentDetails?.duration)
      }
    } catch (_) {}

    const tracks = items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      artwork_url: `https://i.ytimg.com/vi/${item.id.videoId}/mqdefault.jpg`,
      duration: durationMap[item.id.videoId] || 0,
    }))
    setResults(tracks)
    setHasSearched(true)
    saveRecentSearch(q)
    setRecentSearches(getRecentSearches())
  }

  const handleInput = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 400)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    clearTimeout(debounceRef.current)
    search(query)
  }

  const clear = () => {
    setQuery('')
    setResults([])
    setHasSearched(false)
    setError('')
    inputRef.current?.focus()
  }

  const runRecentSearch = (q) => {
    setQuery(q)
    clearTimeout(debounceRef.current)
    search(q)
  }

  const deleteRecent = (q, e) => {
    e.stopPropagation()
    removeRecentSearch(q)
    setRecentSearches(getRecentSearches())
  }

  return (
    <div style={{ padding: isMobile ? '20px 16px 32px' : '32px 32px 40px', maxWidth: '1000px' }}>
      <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.02em' }}>
        Search
      </h1>

      {/* Search bar */}
      <form onSubmit={handleSubmit} style={{ position: 'relative', marginBottom: '40px' }}>
        <SearchIcon
          size={20}
          color="#555"
          style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInput}
          placeholder="Search songs, artists…"
          autoFocus
          style={{
            width: '100%',
            background: '#111',
            border: '1px solid #1e1e1e',
            borderRadius: '50px',
            padding: '14px 48px 14px 52px',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#1E90FF')}
          onBlur={(e) => (e.target.style.borderColor = '#1e1e1e')}
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex' }}
          >
            <X size={18} />
          </button>
        )}
      </form>

      {/* API error */}
      {error === 'api_error' && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '20px 24px', marginBottom: '32px' }}>
          <p style={{ color: '#f87171', fontWeight: 600 }}>Search failed. Please try again.</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '32px' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 8, height: 8, borderRadius: '50%', background: '#1E90FF',
                animation: `pulse-glow 0.8s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
          <span style={{ color: '#555', fontSize: '0.85rem', marginLeft: '8px' }}>Searching…</span>
        </div>
      )}

      {/* Results */}
      {!loading && hasSearched && results.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#444' }}>
          <Music2 size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.5 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No results for "{query}"</p>
          <p style={{ fontSize: '0.88rem', marginTop: '8px' }}>Try different keywords or check the spelling</p>
        </div>
      )}

      {results.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
              Results for "{query}"
            </h2>
            <span style={{ color: '#555', fontSize: '0.8rem' }}>{results.length} tracks</span>
          </div>

          {/* Top result card */}
          {results[0] && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#777', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Top Result</h3>
              <TopResult track={results[0]} queue={results} />
            </div>
          )}

          {/* Rest as rows */}
          {results.length > 1 && (
            <div>
              <h3 style={{ color: '#777', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Tracks</h3>
              {results.slice(1).map((t, i) => (
                <TrackRow key={t.id} track={t} index={i + 1} queue={results} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent searches */}
      {!hasSearched && recentSearches.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem' }}>Recent Searches</h2>
            <button
              onClick={() => { localStorage.removeItem(RECENT_KEY); setRecentSearches([]) }}
              style={{ background: 'none', border: 'none', color: '#555', fontSize: '0.78rem', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
            >
              Clear all
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {recentSearches.map((s) => (
              <div
                key={s}
                onClick={() => runRecentSearch(s)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#111', border: '1px solid #1e1e1e', borderRadius: '50px',
                  padding: '8px 14px', cursor: 'pointer', transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1a1a')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#111')}
              >
                <Clock size={13} color="#555" />
                <span style={{ color: '#ccc', fontSize: '0.85rem' }}>{s}</span>
                <button
                  onClick={(e) => deleteRecent(s, e)}
                  style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', display: 'flex', padding: '0', marginLeft: '2px', lineHeight: 1 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#444')}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browse genres (shown when no search) */}
      {!hasSearched && (
        <div>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem', marginBottom: '20px' }}>Browse Genres</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {GENRES.map((g) => (
              <button
                key={g.label}
                onClick={() => { setQuery(g.q); search(g.q) }}
                style={{
                  background: `${g.color}18`,
                  border: `1px solid ${g.color}30`,
                  borderRadius: '14px',
                  padding: '20px 16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.2s, transform 0.15s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${g.color}28`; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = `${g.color}18`; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ color: g.color, fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>{g.label}</div>
                <div style={{ position: 'absolute', bottom: '-6px', right: '2px', fontSize: '2.8rem', lineHeight: 1, userSelect: 'none' }}>{g.icon}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TopResult({ track, queue }) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer()
  const isActive = currentTrack?.id === track.id
  const handlePlay = () => isActive ? togglePlay() : playTrack(track, queue, 0)

  return (
    <div
      style={{ display: 'flex', gap: '20px', background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'background 0.2s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1a1a')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#111')}
      onDoubleClick={handlePlay}
    >
      <div style={{ width: 100, height: 100, borderRadius: '12px', background: '#1a1a1a', flexShrink: 0, overflow: 'hidden', border: '1px solid #222' }}>
        {track.artwork_url && <img src={track.artwork_url} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ color: '#555', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Track</p>
        <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem', marginBottom: '4px' }}>{track.title}</h3>
        <p style={{ color: '#777', fontSize: '0.88rem' }}>{track.artist}</p>
      </div>
      <button
        onClick={handlePlay}
        style={{ width: 52, height: 52, borderRadius: '50%', background: '#1E90FF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'center', boxShadow: '0 4px 20px rgba(30,144,255,0.35)', transition: 'transform 0.15s' }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {isActive && isPlaying
          ? <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><rect x="3" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="12" rx="1"/></svg>
          : <svg width="16" height="16" viewBox="0 0 16 16" fill="white" style={{ marginLeft: '2px' }}><path d="M4 2L13 8L4 14V2Z"/></svg>
        }
      </button>
    </div>
  )
}
