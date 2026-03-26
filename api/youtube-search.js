// Vercel serverless function — proxies YouTube Data API v3 search
// Keeps the API key server-side so users don't need their own key.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'YouTube API key not configured on server.' })

  const { q, maxResults = 25 } = req.query
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' })

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&q=${encodeURIComponent(q)}&maxResults=${maxResults}&key=${apiKey}`
    const upstream = await fetch(url)
    const data = await upstream.json()

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: data?.error?.message || 'YouTube API error' })
    }

    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
