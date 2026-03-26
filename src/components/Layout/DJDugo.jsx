import { useEffect, useRef, useState } from 'react'
import { usePlayer } from '../../contexts/PlayerContext'

const INTROS = [
  "DJ Dugo here. Let's get into it.",
  "You're tuned in to Radio Dugo. Let's keep the vibes flowing.",
  "Welcome back. DJ Dugo in the mix.",
  "Radio Dugo, baby. Let's go.",
]

const TRANSITIONS = [
  "Up next, {title} by {artist}.",
  "Here's {title} from {artist}. Enjoy the ride.",
  "We're keeping it going with {title} by {artist}.",
  "This one's for you. {title} by {artist}.",
  "Staying on the vibe. {title} by {artist}.",
  "{title} by {artist}. Let's go.",
  "You've got great taste. Here's {title} by {artist}.",
  "Can't stop now. {title} by {artist}.",
  "Feel this one. {title} by {artist}.",
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function buildLine(track, isFirst) {
  const title = track.title || 'this track'
  const artist = track.artist || 'the artist'
  const transition = pick(TRANSITIONS).replace('{title}', title).replace('{artist}', artist)
  if (isFirst) return `${pick(INTROS)} ${transition}`
  return transition
}

export default function DJDugo() {
  const { currentTrack, djEnabled, isPlaying } = usePlayer()
  const prevTrackId = useRef(null)
  const isFirstRef = useRef(true)
  const [voice, setVoice] = useState(null)
  const utterRef = useRef(null)

  // Load best available English voice
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || []
      const preferred =
        voices.find((v) => v.name === 'Samantha') ||
        voices.find((v) => v.name === 'Alex') ||
        voices.find((v) => v.name === 'Daniel') ||
        voices.find((v) => v.lang === 'en-US' && v.localService) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        null
      setVoice(preferred)
    }
    loadVoices()
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices)
  }, [])

  // Speak when track changes and DJ is enabled
  useEffect(() => {
    if (!djEnabled || !currentTrack) return
    if (currentTrack.id === prevTrackId.current) return

    const isFirst = isFirstRef.current
    prevTrackId.current = currentTrack.id
    isFirstRef.current = false

    const text = buildLine(currentTrack, isFirst)

    // Cancel any in-progress speech and wait a beat before speaking
    window.speechSynthesis?.cancel()
    const timer = setTimeout(() => {
      if (!window.speechSynthesis) return
      const utt = new SpeechSynthesisUtterance(text)
      utt.rate = 0.92
      utt.pitch = 1.05
      utt.volume = 0.9
      if (voice) utt.voice = voice
      utterRef.current = utt
      window.speechSynthesis.speak(utt)
    }, 1400)

    return () => clearTimeout(timer)
  }, [currentTrack?.id, djEnabled, voice])

  // Cancel speech when DJ is toggled off
  useEffect(() => {
    if (!djEnabled) {
      window.speechSynthesis?.cancel()
      isFirstRef.current = true
      prevTrackId.current = null
    }
  }, [djEnabled])

  return null
}
