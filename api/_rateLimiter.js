/**
 * In-memory rate limiter for Vercel serverless functions.
 * Note: each serverless instance has its own store — not globally shared.
 * This is a meaningful deterrent; for true global rate limiting a KV store is needed.
 */
const store = new Map()

function cleanup() {
  const now = Date.now()
  for (const [k, v] of store) {
    if (now > v.resetTime) store.delete(k)
  }
}

/**
 * @param {string}  key       - unique key (e.g. `search:<ip>`)
 * @param {number}  limit     - max requests per window
 * @param {number}  windowMs  - rolling window in ms
 * @returns {{ allowed: boolean, remaining: number, resetIn: number }}
 */
export function rateLimit(key, limit, windowMs) {
  if (store.size > 50_000) cleanup() // prevent unbounded growth
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetIn: windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetIn: Math.ceil((entry.resetTime - now) / 1000) }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetIn: Math.ceil((entry.resetTime - now) / 1000) }
}
