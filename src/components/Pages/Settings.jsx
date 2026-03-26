import React, { useState, useEffect } from 'react'
import { Settings as SettingsIcon, User, Save, Check } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { AVATARS, AvatarIcon } from '../shared/AvatarIcons'
import { sanitizeName, LIMITS } from '../../utils/sanitize'

export default function Settings() {
  const { user, userProfile, updateUserProfile } = useAuth()
  const [firstName, setFirstName] = useState(userProfile?.firstName || '')
  const [lastName, setLastName] = useState(userProfile?.lastName || '')
  const [saved, setSaved] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile?.avatarId || '')

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
    if (!cleanFirst) return
    await updateUserProfile({ firstName: cleanFirst, lastName: cleanLast, avatarId: selectedAvatar })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
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
        style={{ width: '100%', background: disabled ? '#0a0a0a' : '#0d0d0d', border: '1px solid #222', borderRadius: '10px', padding: '11px 14px', color: disabled ? '#444' : '#fff', fontSize: '0.9rem', outline: 'none', cursor: disabled ? 'not-allowed' : 'text' }}
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
