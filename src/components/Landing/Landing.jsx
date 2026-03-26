import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RadioDugoLogo from '../../assets/RadioDugoLogo'
import { useIsMobile } from '../../hooks/useIsMobile'

// 0→1 ramp clamped to [from, to]
const ramp = (p, from, to) => Math.max(0, Math.min(1, (p - from) / (to - from)))
// fade in then fade out
const fade = (p, i0, i1, o0, o1) => ramp(p, i0, i1) * (1 - ramp(p, o0, o1))

const BARS = [32, 68, 50, 82, 38, 92, 54, 76, 44, 70, 86, 52, 68, 42, 80, 60, 74, 46, 90, 62, 36, 78, 55, 85, 48]

const FAKE_LYRICS = [
  'Im blessed even though I may cry at night,',
  'But You take my tears and say',
  'Here the day comes',
  'Say, Lord',
]

export default function Landing() {
  const [p, setP] = useState(0)
  const containerRef = useRef(null)
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current
      if (!el) return
      const scrollable = el.offsetHeight - window.innerHeight
      setP(Math.max(0, Math.min(1, window.scrollY / scrollable)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Scroll chapters (800vh total) ──────────────────────────────────
  const phase1 = fade(p, 0.00, 0.07, 0.11, 0.16)  // "Close your eyes"
  const phase2 = fade(p, 0.16, 0.23, 0.28, 0.33)  // "Now open them"
  const phase3 = fade(p, 0.33, 0.41, 0.52, 0.57)  // Waveform + stream
  const phase4 = fade(p, 0.57, 0.64, 0.72, 0.77)  // Fake lyrics
  const phase5 = ramp(p, 0.77, 0.86)               // Brand reveal (stays)

  // Within brand phase
  const logoAppear  = ramp(p, 0.80, 0.89)
  const brandScale  = 0.58 + 0.42 * ramp(p, 0.77, 0.91)
  const subtitleIn  = ramp(p, 0.87, 0.93)
  const ctaIn       = ramp(p, 0.94, 1.00)
  const ctaY        = 28 * (1 - ctaIn)

  // Glow builds with brand
  const glowR = 200 + 850 * ramp(p, 0.77, 1.0)
  const glowA = 0.22 * ramp(p, 0.77, 1.0)
  // Flash on "Now open them"
  const flashA = fade(p, 0.20, 0.25, 0.26, 0.32) * 0.18

  // Lyrics highlight
  const lyricP      = ramp(p, 0.57, 0.74)
  const lyricActive = Math.floor(lyricP * (FAKE_LYRICS.length + 0.4))

  const p3y = 20 * (1 - ramp(p, 0.33, 0.43))
  const scrollIndOpacity = 1 - ramp(p, 0, 0.05)

  // Full-viewport overlay centering helper
  const ov = (extra = {}) => ({
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '0 24px',
    pointerEvents: 'none',
    ...extra,
  })

  // ── Mobile: single-screen landing (no 800vh scroll) ─────────────────────
  if (isMobile) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: '#080808',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 28px 56px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* Glow orb */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 480, height: 480,
          background: 'radial-gradient(circle, rgba(30,144,255,0.14) 0%, rgba(99,102,241,0.06) 45%, transparent 72%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ marginBottom: '20px' }}>
          <RadioDugoLogo size={64} />
        </div>

        {/* Title */}
        <h1 style={{
          color: '#fff',
          fontSize: 'clamp(2.6rem, 11vw, 4rem)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 0.95,
          marginBottom: '16px',
        }}>
          Radio Dugo
        </h1>

        {/* Tagline */}
        <p style={{
          color: '#505050',
          fontSize: '0.78rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          marginBottom: '14px',
          fontWeight: 700,
        }}>
          Your frequency. Your world.
        </p>

        {/* Waveform */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '3px', height: '36px', marginBottom: '40px' }}>
          {BARS.slice(0, 16).map((h, i) => (
            <div
              key={i}
              className="wave-bar"
              style={{
                height: `${h}%`,
                opacity: 0.3 + (i % 4) * 0.15,
                animationDelay: `${(i * 0.087) % 1.1}s`,
                animationDuration: `${0.72 + (i % 5) * 0.24}s`,
                background: i % 3 === 0 ? '#1E90FF' : i % 3 === 1 ? '#5aabff' : '#6366f1',
              }}
            />
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: 320 }}>
          <button
            onClick={() => navigate('/signup')}
            style={{
              background: 'linear-gradient(135deg, #1E90FF 0%, #1260b0 100%)',
              color: '#fff', border: 'none', padding: '16px',
              borderRadius: '50px', fontSize: '1rem', fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase',
              boxShadow: '0 4px 32px rgba(30,144,255,0.45)',
            }}
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'transparent', color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '16px', borderRadius: '50px',
              fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            Log In
          </button>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', marginTop: '28px', letterSpacing: '0.08em' }}>
          Free forever · No credit card required
        </p>
      </div>
    )
  }

  return (
    <div style={{ background: '#080808' }}>
      <div ref={containerRef} style={{ height: '800vh', position: 'relative' }}>
        <div className="landing-sticky">

          {/* ── Radial glow ── */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: glowR, height: glowR,
            background: `radial-gradient(circle,
              rgba(30,144,255,${glowA + flashA}) 0%,
              rgba(99,102,241,${(glowA + flashA) * 0.45}) 45%,
              transparent 72%)`,
            borderRadius: '50%',
            pointerEvents: 'none',
          }} />

          {/* ── Chapter 1: Are you ready for... ── */}
          <div style={ov({ opacity: phase1 })}>
            <p style={{
              color: 'rgba(255,255,255,0.95)',
              fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontWeight: 900,
            }}>
              Are you ready for...
            </p>
          </div>

          {/* ── Chapter 2: New era ── */}
          <div style={ov({ opacity: phase2 })}>
            <p style={{
              color: '#fff',
              fontSize: 'clamp(2.8rem, 8vw, 6rem)',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              fontWeight: 900,
              lineHeight: 1.05,
            }}>
              The new era of<br />music streaming.
            </p>
          </div>

          {/* ── Chapter 3: Waveform ── */}
          <div style={ov({ opacity: phase3, transform: `translateY(${p3y}px)` })}>
            <p style={{
              color: '#505050',
              fontSize: 'clamp(0.8rem, 1.2vw, 0.95rem)',
              letterSpacing: '0.48em',
              textTransform: 'uppercase',
              marginBottom: '30px',
              fontWeight: 700,
            }}>
              Stream anything
            </p>

            {/* Waveform bars */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: '3px',
              height: '72px',
              marginBottom: '38px',
            }}>
              {BARS.map((h, i) => (
                <div
                  key={i}
                  className="wave-bar"
                  style={{
                    height: `${h}%`,
                    opacity: 0.28 + (i % 5) * 0.14,
                    animationDelay: `${(i * 0.087) % 1.1}s`,
                    animationDuration: `${0.72 + (i % 5) * 0.24}s`,
                    background: i % 3 === 0
                      ? '#1E90FF'
                      : i % 3 === 1
                      ? '#5aabff'
                      : '#6366f1',
                  }}
                />
              ))}
            </div>

            <h2 style={{
              color: '#fff',
              fontSize: 'clamp(2.2rem, 6vw, 4rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
            }}>
              Millions of tracks,<br />instantly.
            </h2>
          </div>

          {/* ── Chapter 4: Lyrics ── */}
          <div style={ov({ opacity: phase4 })}>
            <p style={{
              color: '#282828',
              fontSize: '0.66rem',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              marginBottom: '34px',
            }}>
              Synced lyrics, always in time
            </p>

            <div style={{ maxWidth: '480px', width: '100%' }}>
              {FAKE_LYRICS.map((line, i) => {
                const lineP = ramp(lyricP, i * 0.22, i * 0.22 + 0.28)
                const isActive = lyricActive === i
                return (
                  <p key={i} style={{
                    color: isActive ? '#fff' : `rgba(255,255,255,${0.08 + lineP * 0.24})`,
                    fontSize: isActive
                      ? 'clamp(1.05rem, 2.6vw, 1.4rem)'
                      : 'clamp(0.88rem, 2vw, 1.1rem)',
                    fontWeight: isActive ? 700 : 400,
                    lineHeight: 2,
                    transition: 'color 0.5s, font-size 0.35s',
                  }}>
                    {line}
                  </p>
                )
              })}
            </div>
          </div>

          {/* ── Chapter 5-7: Brand + Subtitle + CTA ── */}
          <div style={ov({
            opacity: phase5,
            gap: 0,
            pointerEvents: phase5 > 0.3 ? 'auto' : 'none',
          })}>
            {/* Logo icon */}
            <div style={{
              marginBottom: '20px',
              opacity: logoAppear,
              transform: `scale(${0.4 + 0.6 * logoAppear})`,
              transition: 'none',
            }}>
              <RadioDugoLogo size={72} />
            </div>

            {/* "Radio Dugo" */}
            <h1 style={{
              fontSize: 'clamp(3.6rem, 12vw, 10.5rem)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              color: '#fff',
              lineHeight: 0.9,
              transform: `scale(${brandScale})`,
              transformOrigin: 'center center',
              willChange: 'transform',
            }}>
              Radio Dugo
            </h1>

            {/* Subtitle */}
            <div style={{
              opacity: subtitleIn,
              transform: `translateY(${(1 - subtitleIn) * 14}px)`,
              marginTop: '32px',
              transition: 'none',
            }}>
              <p style={{
                color: '#505050',
                fontSize: 'clamp(0.76rem, 1.5vw, 0.94rem)',
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
              }}>
                Your frequency. Your world.
              </p>
            </div>

            {/* CTA */}
            <div style={{
              opacity: ctaIn,
              transform: `translateY(${ctaY}px)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              marginTop: '52px',
              pointerEvents: ctaIn > 0.4 ? 'auto' : 'none',
              transition: 'none',
            }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  onClick={() => navigate('/signup')}
                  style={{
                    background: 'linear-gradient(135deg, #1E90FF 0%, #1260b0 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '16px 56px',
                    borderRadius: '50px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 40px rgba(30,144,255,0.5)',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  Get Started
                </button>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    background: 'transparent',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.16)',
                    padding: '16px 56px',
                    borderRadius: '50px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    transition: 'border-color 0.2s, background 0.2s, transform 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(30,144,255,0.55)'
                    e.currentTarget.style.background = 'rgba(30,144,255,0.08)'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  Log In
                </button>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.74rem', letterSpacing: '0.1em' }}>
                Free forever · No credit card required
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', letterSpacing: '0.12em', marginTop: '8px' }}>
                Created by Diego Aguayo · Radio Dugo LLC
              </p>
            </div>
          </div>

          {/* ── Scroll indicator ── */}
          <div style={{
            position: 'absolute',
            bottom: '52px',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: scrollIndOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '18px',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', letterSpacing: '0.45em', textTransform: 'uppercase', fontWeight: 700 }}>
              Scroll
            </span>
            <div className="animate-bounce-slow">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '2px', height: '64px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.75), transparent)' }} />
                <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
                  <path d="M2 2L20 20L38 2" stroke="rgba(255,255,255,0.85)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
