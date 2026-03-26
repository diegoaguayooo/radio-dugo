// Vercel serverless function — fetches video content details (duration) by IDs
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'YouTube API key not configured on server.' })

  const { ids } = req.query
  if (!ids) return res.status(400).json({ error: 'Missing ids parameter' })

  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${encodeURIComponent(ids)}&key=${apiKey}`
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
