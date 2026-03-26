import React from 'react'

// 15 color options for playlist icons — white music note on colored background
export const PLAYLIST_COLORS = [
  { id: 'blue',    color: '#1E90FF', label: 'Electric Blue' },
  { id: 'purple',  color: '#8B5CF6', label: 'Purple' },
  { id: 'pink',    color: '#EC4899', label: 'Pink' },
  { id: 'orange',  color: '#F97316', label: 'Orange' },
  { id: 'red',     color: '#EF4444', label: 'Red' },
  { id: 'green',   color: '#22C55E', label: 'Green' },
  { id: 'teal',    color: '#14B8A6', label: 'Teal' },
  { id: 'yellow',  color: '#EAB308', label: 'Yellow' },
  { id: 'cyan',    color: '#06B6D4', label: 'Cyan' },
  { id: 'lime',    color: '#84CC16', label: 'Lime' },
  { id: 'rose',    color: '#F43F5E', label: 'Rose' },
  { id: 'indigo',  color: '#6366F1', label: 'Indigo' },
  { id: 'amber',   color: '#F59E0B', label: 'Amber' },
  { id: 'emerald', color: '#10B981', label: 'Emerald' },
  { id: 'violet',  color: '#7C3AED', label: 'Violet' },
]

// Double eighth note path as SVG elements
function MusicNote() {
  return (
    <g>
      {/* Stems */}
      <rect x="30" y="28" width="4" height="28" rx="2" fill="white"/>
      <rect x="56" y="22" width="4" height="28" rx="2" fill="white"/>
      {/* Beams connecting the stems */}
      <path d="M30 28 Q43 22 60 22" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M30 35 Q43 29 60 29" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      {/* Note heads */}
      <ellipse cx="28" cy="57" rx="9" ry="6.5" fill="white" transform="rotate(-15 28 57)"/>
      <ellipse cx="54" cy="51" rx="9" ry="6.5" fill="white" transform="rotate(-15 54 51)"/>
    </g>
  )
}

export function PlaylistIcon({ id, size = 40, style = {} }) {
  const pc = PLAYLIST_COLORS.find((c) => c.id === id)
  const bgColor = pc ? pc.color : '#1a1a1a'
  const radius = Math.round(size * 0.14)

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ display: 'block', borderRadius: radius, flexShrink: 0, ...style }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" fill={bgColor}/>
      {pc ? <MusicNote /> : <MusicNote opacity={0.25} />}
    </svg>
  )
}
