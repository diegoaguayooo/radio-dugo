import { rateLimit } from './_rateLimiter.js'

const ALLOWED_ORIGINS = [
  'https://radio-dugo.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
]
const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/
const MAX_IDS = 50

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

  // ── Rate limiting: 60 requests / min / IP ────────────────────────
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
    .split(',')[0].trim()
  const rl = rateLimit(`details:${ip}`, 60, 60_000)
  res.setHeader('X-RateLimit-Remaining', String(rl.remaining))

  if (!rl.allowed) {
    return res.status(429).json({ error: `Rate limit exceeded. Try again in ${rl.resetIn}s.` })
  }

  // ── API key ───────────────────────────────────────────────────────
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API not configured on server.' })

  // ── Input validation ──────────────────────────────────────────────
  const { ids } = req.query

  if (!ids || typeof ids !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid ids parameter.' })
  }

  // Validate each video ID — must be exactly 11 alphanumeric chars
  const rawIds = ids.split(',').map((s) => s.trim()).filter(Boolean)

  if (rawIds.length === 0) {
    return res.status(400).json({ error: 'No valid video IDs provided.' })
  }

  if (rawIds.length > MAX_IDS) {
    return res.status(400).json({ error: `Too many IDs. Max ${MAX_IDS} per request.` })
  }

  const invalidId = rawIds.find((id) => !VIDEO_ID_RE.test(id))
  if (invalidId) {
    return res.status(400).json({ error: 'One or more video IDs are invalid.' })
  }

  const safeIds = rawIds.join(',')

  // ── Proxy to YouTube ──────────────────────────────────────────────
  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/videos')
    url.searchParams.set('part', 'contentDetails')
    url.searchParams.set('id', safeIds)
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
