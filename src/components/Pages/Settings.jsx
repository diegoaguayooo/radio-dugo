import React, { useState, useEffect } from 'react'
import { Settings as SettingsIcon, User, Save, Check, LogOut, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { AVATARS, AvatarIcon } from '../shared/AvatarIcons'
import { sanitizeName, LIMITS } from '../../utils/sanitize'
import { useIsMobile } from '../../hooks/useIsMobile'

export default function Settings() {
  const { user, userProfile, updateUserProfile, logout } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [firstName, setFirstName] = useState(userProfile?.firstName || '')
  const [lastName, setLastName] = useState(userProfile?.lastName || '')
  const [saved, setSaved] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile?.avatarId || '')
  const [editMode, setEditMode] = useState(false)

  // Sync form state if userProfile loads after initial render
  useEffect(() => {
    if (userProfile) {
      setFirstName((prev) => prev || userProfile.firstName || '')
      setLastName((prev) => prev || userProfile.lastName || '')
      setSelectedAvatar((prev) => prev || userProfile.avatarId || '')
    }
  }, [userProfile])

  const saveProfile = async () => {
    const cleanFirst = sanitizeName(firstName)
    const cleanLast = sanitizeName(lastName)
    await updateUserProfile({ firstName: cleanFirst, lastName: cleanLast, avatarId: selectedAvatar })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    if (isMobile) setEditMode(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const displayName = userProfile?.firstName
    ? `${userProfile.firstName}${userProfile.lastName ? ' ' + userProfile.lastName : ''}`
    : user?.displayName || 'User'

  // ─── Mobile Profile Page ──────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ padding: '20px 16px 40px', maxWidth: '600px' }}>
        {/* Profile card */}
        <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '18px', padding: '28px 24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
            marginBottom: '16px', border: '2px solid rgba(30,144,255,0.4)',
            background: 'rgba(30,144,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {selectedAvatar
              ? <AvatarIcon id={selectedAvatar} size={80} />
              : userProfile?.photoURL
                ? <img src={userProfile.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <User size={36} color="#1E90FF" />
            }
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.01em' }}>{displayName}</h1>
          <p style={{ color: '#555', fontSize: '0.82rem', marginBottom: '20px' }}>{user?.email}</p>

          {/* Edit Profile toggle */}
          <button
            onClick={() => setEditMode((v) => !v)}
            style={{
              background: editMode ? '#1a1a1a' : '#1E90FF',
              border: editMode ? '1px solid #2a2a2a' : 'none',
              borderRadius: '10px', padding: '10px 22px',
              color: '#fff', fontWeight: 600, fontSize: '0.88rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            {editMode ? <ChevronUp size={16} /> : <User size={16} />}
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Edit form — only shown when editMode */}
        {editMode && (
          <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '18px', padding: '24px', marginBottom: '16px' }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '20px' }}>Choose Avatar</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {AVATARS.map((avatar) => {
                const isSelected = selectedAvatar === avatar.id
                return (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    title={avatar.label}
                    style={{
                      background: isSelected ? 'rgba(30,144,255,0.12)' : 'none',
                      border: `2px solid ${isSelected ? '#1E90FF' : 'transparent'}`,
                      borderRadius: '50%',
                      padding: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'border-color 0.2s, transform 0.15s',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: isSelected ? '0 0 0 4px rgba(30,144,255,0.15)' : 'none',
                    }}
                  >
                    <AvatarIcon id={avatar.id} size={54} />
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <Field label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" maxLength={LIMITS.NAME} />
              <Field label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name (optional)" maxLength={LIMITS.NAME} />
              <Field label="Email" value={user?.email || ''} disabled type="email" hint="Email cannot be changed here" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <SaveBtn onClick={saveProfile} saved={saved} />
              {saved && <span style={{ color: '#10B981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14} /> Saved!</span>}
            </div>
          </div>
        )}

        {/* Logout */}
        <div style={{ marginTop: '8px' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              width: '100%', background: '#111', border: '1px solid #1a1a1a',
              borderRadius: '14px', padding: '16px 20px',
              color: '#888', fontWeight: 600, fontSize: '0.92rem',
              cursor: 'pointer', textAlign: 'left',
            }}
            onTouchStart={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
            onTouchEnd={(e) => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#1a1a1a' }}
          >
            <LogOut size={18} color="#555" />
            Log Out
          </button>
        </div>
      </div>
    )
  }

  // ─── Desktop Settings Page ────────────────────────────────────────────────
  return (
    <div style={{ padding: '32px 32px 60px', maxWidth: '720px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
        <SettingsIcon size={26} color="#1E90FF" />
        <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Settings</h1>
      </div>

      {/* ─── Profile section ─── */}
      <Card>
        <SectionHeader icon={<User size={18} />} title="Profile" />

        {/* Avatar picker */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 600, marginBottom: '4px' }}>Your avatar</p>
          <p style={{ color: '#555', fontSize: '0.78rem', marginBottom: '16px' }}>Pick a character that represents you</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(54px, 1fr))', gap: '14px' }}>
            {AVATARS.map((avatar) => {
              const isSelected = selectedAvatar === avatar.id
              return (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  title={avatar.label}
                  style={{
                    background: isSelected ? 'rgba(30,144,255,0.12)' : 'none',
                    border: `2px solid ${isSelected ? '#1E90FF' : 'transparent'}`,
                    borderRadius: '50%',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'border-color 0.2s, transform 0.15s',
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: isSelected ? '0 0 0 4px rgba(30,144,255,0.15)' : 'none',
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.transform = 'scale(1.07)' }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.transform = 'scale(1)' }}
                >
                  <AvatarIcon id={avatar.id} size={54} />
                </button>
              )
            })}
          </div>
          {selectedAvatar && (
            <p style={{ color: '#1E90FF', fontSize: '0.78rem', marginTop: '12px', fontWeight: 600 }}>
              ✓ {AVATARS.find(a => a.id === selectedAvatar)?.label} selected
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <Field label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" maxLength={LIMITS.NAME} />
          <Field label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name (optional)" maxLength={LIMITS.NAME} />
        </div>
        <Field label="Email" value={user?.email || ''} disabled type="email" hint="Email cannot be changed here" />
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SaveBtn onClick={saveProfile} saved={saved} />
          {saved && <span style={{ color: '#10B981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14} /> Saved!</span>}
        </div>
      </Card>

      {/* ─── Keyboard shortcuts ─── */}
      <Card>
        <SectionHeader icon={<SettingsIcon size={18} />} title="Keyboard Shortcuts" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[['Space', 'Play / Pause'], ['Alt + →', 'Next track'], ['Alt + ←', 'Previous track']].map(([key, label]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#0d0d0d', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
              <span style={{ color: '#888', fontSize: '0.85rem' }}>{label}</span>
              <kbd style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '5px', padding: '3px 10px', color: '#ccc', fontSize: '0.78rem', fontFamily: 'monospace' }}>{key}</kbd>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ textAlign: 'center', padding: '20px 0', color: '#2a2a2a' }}>
        <p style={{ fontSize: '0.8rem' }}>Radio Dugo · Built with ♥</p>
      </div>
    </div>
  )
}

function Card({ children }) {
  return <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '18px', padding: '28px', marginBottom: '20px' }}>{children}</div>
}

function SectionHeader({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1a1a1a' }}>
      <span style={{ color: '#1E90FF' }}>{icon}</span>
      <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{title}</h2>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', disabled, hint, maxLength }) {
  return (
    <div>
      <label style={{ display: 'block', color: '#777', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} maxLength={maxLength}
        style={{ width: '100%', background: disabled ? '#0a0a0a' : '#0d0d0d', border: '1px solid #222', borderRadius: '10px', padding: '11px 14px', color: disabled ? '#444' : '#fff', fontSize: '0.9rem', outline: 'none', cursor: disabled ? 'not-allowed' : 'text', boxSizing: 'border-box' }}
      />
      {hint && <p style={{ color: '#444', fontSize: '0.72rem', marginTop: '5px' }}>{hint}</p>}
    </div>
  )
}

function SaveBtn({ onClick, saved, label = 'Save Changes' }) {
  return (
    <button
      onClick={onClick}
      style={{ background: saved ? '#10B981' : '#1E90FF', border: 'none', borderRadius: '10px', padding: '11px 22px', color: '#fff', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.3s' }}
    >
      {saved ? <Check size={16} /> : <Save size={16} />}
      {saved ? 'Saved!' : label}
    </button>
  )
}
