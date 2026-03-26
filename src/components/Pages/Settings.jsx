import React, { useState, useRef } from 'react'
import { Settings as SettingsIcon, Key, User, Save, Check, ExternalLink, Eye, EyeOff, Info, Camera } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { storage } from '../../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export default function Settings() {
  const { user, userProfile, updateUserProfile } = useAuth()
  const [clientId, setClientId] = useState(userProfile?.settings?.youtubeApiKey || '')
  const [firstName, setFirstName] = useState(userProfile?.firstName || '')
  const [lastName, setLastName] = useState(userProfile?.lastName || '')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(null) // 'profile' | 'api'
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef(null)

  const saveProfile = async () => {
    if (!firstName.trim()) return
    await updateUserProfile({ firstName: firstName.trim(), lastName: lastName.trim() })
    setSaved('profile')
    setTimeout(() => setSaved(null), 2500)
  }

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setAvatarUploading(true)
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      await updateUserProfile({ photoURL: url })
      setSaved('avatar')
      setTimeout(() => setSaved(null), 2500)
    } catch (err) {
      console.error('Avatar upload failed:', err)
    } finally {
      setAvatarUploading(false)
    }
  }

  const saveApiKey = async () => {
    await updateUserProfile({ settings: { youtubeApiKey: clientId.trim() } })
    setSaved('api')
    setTimeout(() => setSaved(null), 2500)
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

        {/* Avatar upload */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          <div
            style={{ position: 'relative', width: 80, height: 80, borderRadius: '50%', flexShrink: 0, cursor: 'pointer' }}
            onClick={() => avatarInputRef.current?.click()}
          >
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: 'rgba(30,144,255,0.15)', border: '2px solid rgba(30,144,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 700, color: '#1E90FF' }}>
              {userProfile?.photoURL
                ? <img src={userProfile.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (userProfile?.firstName || user?.displayName || 'U')[0].toUpperCase()
              }
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#1E90FF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #111' }}>
              <Camera size={13} color="#fff" />
            </div>
          </div>
          <div>
            <p style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 600, marginBottom: '4px' }}>Profile picture</p>
            <p style={{ color: '#555', fontSize: '0.78rem', marginBottom: '10px' }}>JPG, PNG or GIF · Max 5 MB</p>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              style={{ background: 'rgba(30,144,255,0.12)', border: '1px solid rgba(30,144,255,0.25)', borderRadius: '8px', padding: '7px 14px', color: '#1E90FF', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {avatarUploading ? 'Uploading…' : saved === 'avatar' ? '✓ Uploaded!' : 'Upload photo'}
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadAvatar} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <Field
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
          />
          <Field
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name (optional)"
          />
        </div>
        <Field
          label="Email"
          value={user?.email || ''}
          disabled
          type="email"
          hint="Email cannot be changed here"
        />
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SaveBtn onClick={saveProfile} saved={saved === 'profile'} />
          {saved === 'profile' && <span style={{ color: '#10B981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14} /> Saved!</span>}
        </div>
      </Card>

      {/* ─── SoundCloud API ─── */}
      <Card>
        <SectionHeader icon={<Key size={18} />} title="YouTube API Key" />

        <div style={{ background: 'rgba(30,144,255,0.06)', border: '1px solid rgba(30,144,255,0.15)', borderRadius: '12px', padding: '16px 18px', marginBottom: '20px', display: 'flex', gap: '12px' }}>
          <Info size={18} color="#1E90FF" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p style={{ color: '#ccc', fontSize: '0.88rem', lineHeight: 1.65 }}>
              A <strong style={{ color: '#fff' }}>YouTube Data API v3</strong> key is required for Search.
              Get a free key from{' '}
              <a
                href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#1E90FF', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                Google Cloud Console <ExternalLink size={12} />
              </a>
              .
            </p>
            <ol style={{ color: '#888', fontSize: '0.82rem', lineHeight: 1.8, marginTop: '10px', paddingLeft: '20px' }}>
              <li>Go to <strong style={{ color: '#ccc' }}>Google Cloud Console</strong> → create or select a project</li>
              <li>Enable <strong style={{ color: '#ccc' }}>YouTube Data API v3</strong></li>
              <li>Go to <strong style={{ color: '#ccc' }}>APIs & Services → Credentials</strong></li>
              <li>Click <strong style={{ color: '#ccc' }}>Create Credentials → API key</strong></li>
              <li>Copy the key and paste below</li>
            </ol>
          </div>
        </div>

        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#777', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
            API Key
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Paste your YouTube Data API v3 key"
              style={{
                width: '100%',
                background: '#0d0d0d',
                border: '1px solid #222',
                borderRadius: '10px',
                padding: '12px 48px 12px 14px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: showKey ? 'monospace' : 'inherit',
              }}
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex' }}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {clientId && (
            <p style={{ color: '#555', fontSize: '0.75rem', marginTop: '6px' }}>
              {clientId.length} characters · {clientId ? '✓ Key entered' : ''}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SaveBtn onClick={saveApiKey} saved={saved === 'api'} label="Save API Key" />
          {saved === 'api' && <span style={{ color: '#10B981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14} /> Saved!</span>}
        </div>
      </Card>

      {/* ─── Keyboard shortcuts ─── */}
      <Card>
        <SectionHeader icon={<SettingsIcon size={18} />} title="Keyboard Shortcuts" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            ['Space', 'Play / Pause'],
            ['Alt + →', 'Next track'],
            ['Alt + ←', 'Previous track'],
          ].map(([key, label]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#0d0d0d', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
              <span style={{ color: '#888', fontSize: '0.85rem' }}>{label}</span>
              <kbd style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '5px', padding: '3px 10px', color: '#ccc', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </Card>

      {/* ─── About ─── */}
      <div style={{ textAlign: 'center', padding: '20px 0', color: '#2a2a2a' }}>
        <p style={{ fontSize: '0.8rem' }}>Radio Dugo · Built with ♥</p>
      </div>
    </div>
  )
}

function Card({ children }) {
  return (
    <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '18px', padding: '28px', marginBottom: '20px' }}>
      {children}
    </div>
  )
}

function SectionHeader({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1a1a1a' }}>
      <span style={{ color: '#1E90FF' }}>{icon}</span>
      <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{title}</h2>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', disabled, hint }) {
  return (
    <div>
      <label style={{ display: 'block', color: '#777', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          background: disabled ? '#0a0a0a' : '#0d0d0d',
          border: '1px solid #222',
          borderRadius: '10px',
          padding: '11px 14px',
          color: disabled ? '#444' : '#fff',
          fontSize: '0.9rem',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
      {hint && <p style={{ color: '#444', fontSize: '0.72rem', marginTop: '5px' }}>{hint}</p>}
    </div>
  )
}

function SaveBtn({ onClick, saved, label = 'Save Changes' }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: saved ? '#10B981' : '#1E90FF',
        border: 'none',
        borderRadius: '10px',
        padding: '11px 22px',
        color: '#fff',
        fontWeight: 600,
        fontSize: '0.88rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background 0.3s',
      }}
    >
      {saved ? <Check size={16} /> : <Save size={16} />}
      {saved ? 'Saved!' : label}
    </button>
  )
}
