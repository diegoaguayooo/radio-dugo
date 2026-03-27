import React from 'react'
import RadioDugoLogo from '../../assets/RadioDugoLogo'

export default function WelcomeModal({ onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 301,
        background: '#111',
        border: '1px solid #1a1a1a',
        borderRadius: '24px',
        padding: '40px 32px 36px',
        width: 'min(420px, 90vw)',
        textAlign: 'center',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        animation: 'fadeInUp 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <RadioDugoLogo size={56} />
        </div>

        {/* Heading */}
        <h2 style={{
          color: '#fff', fontSize: '1.5rem', fontWeight: 800,
          letterSpacing: '-0.02em', marginBottom: '14px',
        }}>
          Welcome to Radio Dugo!
        </h2>

        {/* Message */}
        <p style={{
          color: '#888', fontSize: '0.95rem', lineHeight: 1.7,
          marginBottom: '28px',
        }}>
          Thanks for using Radio Dugo! If you find any bugs, please notify Diego so they can get squashed! Made with 🤍
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            background: 'linear-gradient(135deg, #1E90FF 0%, #1260b0 100%)',
            color: '#fff', border: 'none', borderRadius: '50px',
            padding: '13px 40px', fontSize: '0.92rem', fontWeight: 700,
            cursor: 'pointer', letterSpacing: '0.04em',
            boxShadow: '0 4px 20px rgba(30,144,255,0.4)',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
          onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Let's Go!
        </button>
      </div>
    </>
  )
}
