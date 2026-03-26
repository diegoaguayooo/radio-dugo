import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { AvatarIcon } from '../shared/AvatarIcons'
import { User } from 'lucide-react'
import RadioDugoLogo from '../../assets/RadioDugoLogo'

export default function MobileHeader({ onAvatarTap }) {
  const { user, userProfile } = useAuth()

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: '52px', background: '#0d0d0d',
      borderBottom: '1px solid #161616',
      display: 'flex', alignItems: 'center',
      padding: '0 16px', zIndex: 98,
      paddingTop: 'env(safe-area-inset-top, 0px)',
    }}>
      {/* Avatar button — opens sidebar */}
      <button
        onClick={onAvatarTap}
        style={{
          background: 'none', padding: 0,
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', borderRadius: '50%',
          width: 36, height: 36, overflow: 'hidden',
          border: '1.5px solid rgba(30,144,255,0.3)',
          flexShrink: 0,
        }}
      >
        {userProfile?.avatarId
          ? <AvatarIcon id={userProfile.avatarId} size={36} />
          : userProfile?.photoURL
            ? <img src={userProfile.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', background: 'rgba(30,144,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} color="#1E90FF" />
              </div>
        }
      </button>

      {/* Centered logo + name */}
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
        <RadioDugoLogo size={22} />
        <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>Radio Dugo</span>
      </div>
    </div>
  )
}
