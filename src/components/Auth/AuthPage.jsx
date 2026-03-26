import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, checkAuthRateLimit, recordFailedAuthAttempt, clearAuthAttempts } from '../../contexts/AuthContext'
import { Eye, EyeOff, ArrowLeft, Music, Radio, Mic2, ListMusic } from 'lucide-react'
import RadioDugoLogo from '../../assets/RadioDugoLogo'
import { sanitizeEmail, sanitizeName, LIMITS } from '../../utils/sanitize'
import { useIsMobile } from '../../hooks/useIsMobile'

const FEATURES = [
  { icon: Radio, text: 'Stream millions of tracks via YouTube' },
  { icon: Mic2, text: 'Synced lyrics that follow along' },
  { icon: ListMusic, text: 'Build playlists and queue tracks' },
  { icon: Music, text: 'Like songs and rediscover them anytime' },
]

export default function AuthPage({ mode }) {
  const { login, signup, resetPassword } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [lockedUntil, setLockedUntil] = useState(null) // minutes until unlock

  const isSignup = mode === 'signup'
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (forgotMode) {
      if (!form.email) return setError('Enter your email address.')
      setLoading(true)
      try {
        await resetPassword(sanitizeEmail(form.email))
        setInfo('Password reset email sent. Check your inbox.')
      } catch (err) {
        setError(friendlyError(err.code))
      } finally {
        setLoading(false)
      }
      return
    }

    // ── Input validation ──────────────────────────────────────────
    const email = sanitizeEmail(form.email)
    if (!email) return setError('Enter a valid email address.')

    if (isSignup) {
      const firstName = sanitizeName(form.firstName)
      if (!firstName) return setError('First name is required.')
      if (form.firstName.length > LIMITS.NAME) return setError(`First name must be under ${LIMITS.NAME} characters.`)
      if (form.password.length < 6) return setError('Password must be at least 6 characters.')
      if (form.password.length > LIMITS.PASSWORD) return setError('Password is too long.')
      if (form.password !== form.confirmPassword) return setError('Passwords do not match.')
    }

    // ── Client-side rate limit: 5 attempts / 15 min / email ───────
    const rl = checkAuthRateLimit(email)
    if (!rl.allowed) {
      setLockedUntil(rl.resetIn)
      return setError(`Too many failed attempts. Try again in ${rl.resetIn} minute${rl.resetIn === 1 ? '' : 's'}.`)
    }

    setLoading(true)
    try {
      if (isSignup) {
        await signup(email, form.password, sanitizeName(form.firstName), sanitizeName(form.lastName))
        clearAuthAttempts(email) // reset on success
      } else {
        await login(email, form.password)
        clearAuthAttempts(email) // reset on success
      }
      navigate('/app/home')
    } catch (err) {
      // Record the failed attempt for login (not signup — Firebase handles that)
      if (!isSignup) recordFailedAuthAttempt(email)

      const msg = friendlyError(err.code)
      setError(msg)

      // Re-check limit so we can show the updated remaining count
      const updated = checkAuthRateLimit(email)
      if (!updated.allowed) {
        setLockedUntil(updated.resetIn)
        setError(`Too many failed attempts. Try again in ${updated.resetIn} minute${updated.resetIn === 1 ? '' : 's'}.`)
      } else if (!isSignup && updated.remaining <= 2 && updated.remaining > 0) {
        setError(`${msg} (${updated.remaining} attempt${updated.remaining === 1 ? '' : 's'} left)`)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Mobile: form-only single column ─────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ minHeight: '100dvh', background: '#080808', display: 'flex', flexDirection: 'column', padding: '0 24px 40px', position: 'relative', overflow: 'hidden' }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,144,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 28px' }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RadioDugoLogo size={28} />
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>Radio Dugo</span>
          </div>
          <div style={{ width: 60 }} />
        </div>

        {/* Form header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
            {forgotMode ? 'Reset password' : isSignup ? 'Create account' : 'Welcome back'}
          </h2>
          <p style={{ color: '#555', fontSize: '0.88rem' }}>
            {forgotMode ? "We'll send a reset link to your inbox." : isSignup ? "Join Radio Dugo. It's free." : 'Sign in to pick up where you left off.'}
          </p>
        </div>

        {/* Form card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px 24px' }}>
          <form onSubmit={handleSubmit} noValidate>
            {isSignup && !forgotMode && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <AuthField label="First Name" value={form.firstName} onChange={set('firstName')} placeholder="Name" autoFocus maxLength={LIMITS.NAME} />
                <AuthField label="Last Name" value={form.lastName} onChange={set('lastName')} placeholder="Last name" maxLength={LIMITS.NAME} />
              </div>
            )}
            <div style={{ marginBottom: '16px' }}>
              <AuthField label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" autoFocus={!isSignup} maxLength={LIMITS.EMAIL} />
            </div>
            {!forgotMode && (
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="••••••••"
                    required
                    maxLength={LIMITS.PASSWORD}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#1E90FF'; e.target.style.boxShadow = '0 0 0 3px rgba(30,144,255,0.12)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                  />
                  <button type="button" onClick={() => setShowPass((v) => !v)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}
            {isSignup && !forgotMode && (
              <div style={{ marginBottom: '24px' }}>
                <AuthField label="Confirm Password" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="••••••••" maxLength={LIMITS.PASSWORD} />
              </div>
            )}
            {!isSignup && !forgotMode && (
              <div style={{ textAlign: 'right', marginTop: '-4px', marginBottom: '20px' }}>
                <button type="button" onClick={() => { setForgotMode(true); setError(''); setInfo(''); setLockedUntil(null) }} style={{ background: 'none', border: 'none', color: '#1E90FF', fontSize: '0.8rem', cursor: 'pointer' }}>
                  Forgot password?
                </button>
              </div>
            )}
            {error && (
              <div style={{ background: lockedUntil ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${lockedUntil ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.2)'}`, borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', color: lockedUntil ? '#fbbf24' : '#f87171', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}
            {info && (
              <div style={{ background: 'rgba(30,144,255,0.08)', border: '1px solid rgba(30,144,255,0.2)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', color: '#60a5fa', fontSize: '0.85rem' }}>
                {info}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !!lockedUntil}
              style={{ width: '100%', background: (loading || lockedUntil) ? 'rgba(30,144,255,0.35)' : 'linear-gradient(135deg, #1E90FF 0%, #1260b0 100%)', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, cursor: (loading || lockedUntil) ? 'not-allowed' : 'pointer', marginBottom: forgotMode ? '10px' : '0' }}
            >
              {loading ? 'Please wait…' : lockedUntil ? `Locked for ${lockedUntil}m` : forgotMode ? 'Send Reset Email' : isSignup ? 'Create Account' : 'Sign In'}
            </button>
            {forgotMode && (
              <button type="button" onClick={() => { setForgotMode(false); setError(''); setInfo(''); setLockedUntil(null) }} style={{ width: '100%', background: 'none', border: 'none', color: '#555', fontSize: '0.85rem', cursor: 'pointer', padding: '10px', marginTop: '4px' }}>
                ← Back to login
              </button>
            )}
          </form>
        </div>

        {!forgotMode && (
          <p style={{ color: '#444', fontSize: '0.85rem', marginTop: '20px', textAlign: 'center' }}>
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <Link to={isSignup ? '/login' : '/signup'} style={{ color: '#1E90FF', textDecoration: 'none', fontWeight: 600 }}>
              {isSignup ? 'Sign In' : 'Create one'}
            </Link>
          </p>
        )}
      </div>
    )
  }

  // ── Desktop: two-column layout ───────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#080808', overflow: 'hidden', position: 'relative' }}>
      {/* ── Ambient orbs ── */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,144,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '35%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,144,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '30%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* ── Left panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 64px', position: 'relative', maxWidth: '560px' }}>
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          style={{ position: 'absolute', top: '32px', left: '32px', background: 'none', border: 'none', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', transition: 'color 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Logo + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '56px' }}>
          <RadioDugoLogo size={48} />
          <span style={{ color: '#fff', fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.03em' }}>Radio Dugo</span>
        </div>

        {/* Hero text */}
        <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '20px' }}>
          Your music,<br />
          <span style={{ background: 'linear-gradient(135deg, #1E90FF 0%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            your way.
          </span>
        </h1>
        <p style={{ color: '#555', fontSize: '1rem', lineHeight: 1.65, marginBottom: '48px', maxWidth: '380px' }}>
          Stream, discover, and organize your favorite music. All in one beautifully simple app.
        </p>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(30,144,255,0.1)', border: '1px solid rgba(30,144,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color="#1E90FF" />
              </div>
              <span style={{ color: '#888', fontSize: '0.9rem' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ width: '1px', background: 'linear-gradient(to bottom, transparent, #1a1a1a 20%, #1a1a1a 80%, transparent)', flexShrink: 0, alignSelf: 'stretch' }} />

      {/* ── Right panel: form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Form header */}
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
              {forgotMode ? 'Reset password' : isSignup ? 'Create account' : 'Welcome back'}
            </h2>
            <p style={{ color: '#555', fontSize: '0.88rem' }}>
              {forgotMode
                ? "We'll send a reset link to your inbox."
                : isSignup
                ? "Join Radio Dugo. It's free."
                : 'Sign in to pick up where you left off.'}
            </p>
          </div>

          {/* Card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '36px 32px', backdropFilter: 'blur(20px)' }}>
            <form onSubmit={handleSubmit} noValidate>
              {isSignup && !forgotMode && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <AuthField label="First Name" value={form.firstName} onChange={set('firstName')} placeholder="Name" autoFocus maxLength={LIMITS.NAME} />
                  <AuthField label="Last Name" value={form.lastName} onChange={set('lastName')} placeholder="Last name" maxLength={LIMITS.NAME} />
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <AuthField label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" autoFocus={!isSignup} maxLength={LIMITS.EMAIL} />
              </div>

              {!forgotMode && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={set('password')}
                      placeholder="••••••••"
                      required
                      maxLength={LIMITS.PASSWORD}
                      style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = '#1E90FF'; e.target.style.boxShadow = '0 0 0 3px rgba(30,144,255,0.12)' }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex' }}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {isSignup && !forgotMode && (
                <div style={{ marginBottom: '24px' }}>
                  <AuthField label="Confirm Password" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="••••••••" maxLength={LIMITS.PASSWORD} />
                </div>
              )}

              {!isSignup && !forgotMode && (
                <div style={{ textAlign: 'right', marginTop: '-4px', marginBottom: '24px' }}>
                  <button
                    type="button"
                    onClick={() => { setForgotMode(true); setError(''); setInfo(''); setLockedUntil(null) }}
                    style={{ background: 'none', border: 'none', color: '#1E90FF', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div style={{ background: lockedUntil ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${lockedUntil ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.2)'}`, borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', color: lockedUntil ? '#fbbf24' : '#f87171', fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}
              {info && (
                <div style={{ background: 'rgba(30,144,255,0.08)', border: '1px solid rgba(30,144,255,0.2)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', color: '#60a5fa', fontSize: '0.85rem' }}>
                  {info}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !!lockedUntil}
                style={{
                  width: '100%',
                  background: (loading || lockedUntil) ? 'rgba(30,144,255,0.35)' : 'linear-gradient(135deg, #1E90FF 0%, #1260b0 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: (loading || lockedUntil) ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.02em',
                  transition: 'opacity 0.2s, transform 0.15s',
                  boxShadow: (loading || lockedUntil) ? 'none' : '0 4px 20px rgba(30,144,255,0.3)',
                  marginBottom: forgotMode ? '12px' : '0',
                }}
                onMouseEnter={(e) => { if (!loading && !lockedUntil) e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {loading ? 'Please wait…' : lockedUntil ? `Locked for ${lockedUntil}m` : forgotMode ? 'Send Reset Email' : isSignup ? 'Create Account' : 'Sign In'}
              </button>

              {forgotMode && (
                <button
                  type="button"
                  onClick={() => { setForgotMode(false); setError(''); setInfo(''); setLockedUntil(null) }}
                  style={{ width: '100%', background: 'none', border: 'none', color: '#555', fontSize: '0.85rem', cursor: 'pointer', padding: '10px', marginTop: '4px' }}
                >
                  ← Back to login
                </button>
              )}
            </form>
          </div>

          {/* Switch mode */}
          {!forgotMode && (
            <p style={{ color: '#444', fontSize: '0.85rem', marginTop: '20px', textAlign: 'center' }}>
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
              <Link to={isSignup ? '/login' : '/signup'} style={{ color: '#1E90FF', textDecoration: 'none', fontWeight: 600 }}>
                {isSignup ? 'Sign In' : 'Create one'}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function AuthField({ label, type = 'text', value, onChange, placeholder, autoFocus, maxLength }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={maxLength}
        style={inputStyle}
        onFocus={(e) => { e.target.style.borderColor = '#1E90FF'; e.target.style.boxShadow = '0 0 0 3px rgba(30,144,255,0.12)' }}
        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}

const labelStyle = {
  display: 'block',
  color: '#666',
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: '8px',
}

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  padding: '12px 14px',
  color: '#fff',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
}

function friendlyError(code) {
  const map = {
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  }
  return map[code] || 'Something went wrong. Please try again.'
}
