import React from 'react'

/**
 * Radio Dugo mark: bold "D" letterform broadcasting outward.
 * The vertical bar + curved stroke form the letter D (for Dugo),
 * while two concentric arcs on the right side represent radio broadcast.
 */
export default function RadioDugoLogo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Black background */}
      <rect width="44" height="44" rx="12" fill="#000000" />

      {/* Subtle inner glow ring */}
      <rect width="44" height="44" rx="12" stroke="#1E90FF" strokeWidth="1" opacity="0.2" />

      {/* ── Bold D letterform ─────────────────────────────────── */}
      {/* Vertical stroke */}
      <rect x="10" y="10" width="5" height="24" rx="2.5" fill="#ffffff" />

      {/* Curved outer stroke of the D */}
      <path
        d="M15 11 C24 11 29 15.5 29 22 C29 28.5 24 33 15 33"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* ── Radio broadcast arcs ──────────────────────────────── */}
      {/* Inner arc */}
      <path
        d="M31 17.5 C33.5 19.5 33.5 24.5 31 26.5"
        stroke="#1E90FF"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Outer arc */}
      <path
        d="M34 14.5 C38 17.5 38 26.5 34 29.5"
        stroke="#1E90FF"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
    </svg>
  )
}
