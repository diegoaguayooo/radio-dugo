import { rateLimit } from './_rateLimiter.js'

const ALLOWED_ORIGINS = [
  'https://radio-dugo.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
]
const MAX_Q_LEN = 150
const MAX_RESULTS_CAP = 25

export default async function handler(req, res) {
  // ── CORS ─────────────────────────────────────────────────────────
  const origin = req.headers.origin || ''
  const allowed = process.env.ALLOWED_ORIGIN
    ? [process.env.ALLOWED_ORIGIN, 'http://localhost:5173', 'http://localhost:4173']
    : ALLOWED_ORIGINS
  const corsOrigin = allowed.includes(origin) ? origin : allowed[0]

  res.setHeader('Access-Control-Allow-Origin', corsOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  // ── Rate limiting: 30 requests / min / IP ─────────────────────
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
    .split(',')[0].trim()
  const rl = rateLimit(`search:${ip}`, 30, 60_000)
  res.setHeader('X-RateLimit-Remaining', String(rl.remaining))

  if (!rl.allowed) {
    return res.status(429).json({ error: `Rate limit exceeded. Try again in ${rl.resetIn}s.` })
  }

  // ── API key ───────────────────────────────────────────────────
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API not configured on server.' })

  // ── Input validation & sanitisation ──────────────────────────
  let { q, maxResults = '10' } = req.query

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid query parameter.' })
  }

  // Strip HTML tags and control characters, enforce max length
  q = q.replace(/<[^>]*>/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim().slice(0, MAX_Q_LEN)

  if (!q) return res.status(400).json({ error: 'Query cannot be empty.' })

  const numResults = Math.min(Math.max(parseInt(maxResults, 10) || 10, 1), MAX_RESULTS_CAP)

  // ── Proxy to YouTube ─────────────────────────────────────────
  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search')
    url.searchParams.set('part', 'snippet')
    url.searchParams.set('q', q)
    url.searchParams.set('type', 'video')
    url.searchParams.set('videoCategoryId', '10')
    url.searchParams.set('maxResults', numResults)
    url.searchParams.set('key', apiKey)

    const upstream = await fetch(url.toString())
    const data = await upstream.json()

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: data?.error?.message || 'YouTube API error.' })
    }
    return res.status(200).json(data)
  } catch {
    return res.status(500).json({ error: 'Failed to reach YouTube API.' })
  }
}
