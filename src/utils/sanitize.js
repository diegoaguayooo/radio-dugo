/**
 * Client-side input sanitization utilities.
 * All user-supplied strings should be run through these before display or storage.
 */

export const LIMITS = {
  NAME: 100,
  EMAIL: 254,
  PASSWORD: 256,
  SEARCH_QUERY: 150,
  PLAYLIST_NAME: 100,
  DESCRIPTION: 500,
}

/**
 * Strips HTML tags and dangerous control characters, trims whitespace,
 * and enforces a maximum length.
 */
export function sanitizeText(str, maxLen = 200) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/<[^>]*>/g, '')                         // strip HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')   // strip dangerous control chars
    .trim()
    .slice(0, maxLen)
}

/** For user display names and playlist names. */
export function sanitizeName(str) {
  return sanitizeText(str, LIMITS.NAME)
}

/** For search query inputs. */
export function sanitizeSearch(str) {
  return sanitizeText(str, LIMITS.SEARCH_QUERY)
}

/** For email fields — lowercase + trim + length cap. */
export function sanitizeEmail(str) {
  if (typeof str !== 'string') return ''
  return str.trim().toLowerCase().slice(0, LIMITS.EMAIL)
}

/**
 * Returns true if a string is within the allowed length and
 * does not consist solely of whitespace.
 */
export function isNonEmpty(str, maxLen = 200) {
  return typeof str === 'string' && str.trim().length > 0 && str.length <= maxLen
}
