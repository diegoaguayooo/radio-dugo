import React from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// 15 Avatar Characters — Radio Dugo black & blue (#1E90FF) aesthetic
// ─────────────────────────────────────────────────────────────────────────────

const bg = '#0d0d0d'
const blue = '#1E90FF'
const w = '#d8d8d8'

export const AVATARS = [
  {
    id: 'dj-bot',
    label: 'DJ Bot',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={bg}/>
        <path d="M22 46 Q22 16 50 16 Q78 16 78 46" stroke={blue} strokeWidth="5" fill="none" strokeLinecap="round"/>
        <rect x="14" y="41" width="13" height="20" rx="6" fill={blue}/>
        <rect x="73" y="41" width="13" height="20" rx="6" fill={blue}/>
        <rect x="28" y="40" width="44" height="34" rx="8" fill={w}/>
        <circle cx="39" cy="53" r="7" fill={blue}/>
        <circle cx="61" cy="53" r="7" fill={blue}/>
        <circle cx="39" cy="53" r="3" fill="#fff"/>
        <circle cx="61" cy="53" r="3" fill="#fff"/>
        <rect x="34" y="64" width="7" height="5" rx="2" fill="#999"/>
        <rect x="45" y="64" width="7" height="5" rx="2" fill="#999"/>
        <rect x="56" y="64" width="7" height="5" rx="2" fill="#999"/>
      </svg>
    ),
  },
  {
    id: 'cosmo-cat',
    label: 'Cosmo Cat',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={bg}/>
        <polygon points="22,46 16,16 40,36" fill={w}/>
        <polygon points="78,46 84,16 60,36" fill={w}/>
        <polygon points="25,44 21,21 38,34" fill={blue}/>
        <polygon points="75,44 79,21 62,34" fill={blue}/>
        <ellipse cx="50" cy="60" rx="27" ry="23" fill={w}/>
        <ellipse cx="39" cy="56" rx="5.5" ry="8" fill={blue}/>
        <ellipse cx="61" cy="56" rx="5.5" ry="8" fill={blue}/>
        <ellipse cx="39" cy="56" rx="2" ry="5.5" fill="#000"/>
        <ellipse cx="61" cy="56" rx="2" ry="5.5" fill="#000"/>
        <circle cx="41" cy="52" r="1.5" fill="#fff" opacity="0.8"/>
        <circle cx="63" cy="52" r="1.5" fill="#fff" opacity="0.8"/>
        <path d="M46 64 Q50 68 54 64 Q50 62 46 64" fill={blue}/>
        <line x1="22" y1="63" x2="44" y2="65" stroke="#aaa" strokeWidth="1.5"/>
        <line x1="22" y1="68" x2="44" y2="67" stroke="#aaa" strokeWidth="1.5"/>
        <line x1="78" y1="63" x2="56" y2="65" stroke="#aaa" strokeWidth="1.5"/>
        <line x1="78" y1="68" x2="56" y2="67" stroke="#aaa" strokeWidth="1.5"/>
        <circle cx="80" cy="18" r="2.5" fill={blue}/>
        <circle cx="86" cy="28" r="1.5" fill={blue}/>
        <circle cx="16" cy="25" r="2" fill={blue}/>
      </svg>
    ),
  },
  {
    id: 'bass-bear',
    label: 'Bass Bear',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={bg}/>
        <circle cx="28" cy="30" r="14" fill={w}/>
        <circle cx="72" cy="30" r="14" fill={w}/>
        <circle cx="28" cy="30" r="8" fill={blue} opacity="0.25"/>
        <circle cx="72" cy="30" r="8" fill={blue} opacity="0.25"/>
        <circle cx="50" cy="58" r="30" fill={w}/>
        <ellipse cx="50" cy="67" rx="13" ry="9" fill="#c0c0c0"/>
        <ellipse cx="50" cy="62" rx="5" ry="3.5" fill={blue}/>
        <circle cx="38" cy="52" r="5" fill="#222"/>
        <circle cx="62" cy="52" r="5" fill="#222"/>
        <circle cx="40" cy="50" r="2" fill="#fff"/>
        <circle cx="64" cy="50" r="2" fill="#fff"/>
        <path d="M22 50 Q22 32 50 32 Q78 32 78 50" stroke={blue} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <rect x="16" y="46" width="9" height="12" rx="4" fill={blue}/>
        <rect x="75" y="46" width="9" height="12" rx="4" fill={blue}/>
      </svg>
    ),
  },
  {
    id: 'neon-alien',
    label: 'Neon Alien',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={bg}/>
        <line x1="38" y1="22" x2="30" y2="8" stroke={blue} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="30" cy="8" r="4" fill={blue}/>
        <line x1="62" y1="22" x2="70" y2="8" stroke={blue} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="70" cy="8" r="4" fill={blue}/>
        <ellipse cx="50" cy="54" rx="30" ry="34" fill="#b8d4d8"/>
        <ellipse cx="36" cy="50" rx="9" ry="13" fill={bg}/>
        <ellipse cx="64" cy="50" rx="9" ry="13" fill={bg}/>
        <ellipse cx="36" cy="50" rx="7" ry="11" fill={blue}/>
        <ellipse cx="64" cy="50" rx="7" ry="11" fill={blue}/>
        <ellipse cx="36" cy="50" rx="3.5" ry="6" fill="#0a2040"/>
        <ellipse cx="64" cy="50" rx="3.5" ry="6" fill="#0a2040"/>
        <circle cx="38" cy="46" r="2" fill="#fff" opacity="0.7"/>
        <circle cx="66" cy="46" r="2" fill="#fff" opacity="0.7"/>
        <path d="M43 70 Q50 74 57 70" stroke={blue} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'retro-bot',
    label: 'Retro Bot',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={bg}/>
        <line x1="50" y1="12" x2="50" y2="22" stroke={blue} strokeWidth="3" strokeLinecap="round"/>
        <circle cx="50" cy="9" r="4" fill={blue}/>
        <rect x="22" y="22" width="56" height="54" rx="8" fill={w}/>
        <rect x="30" y="30" width="40" height="28" rx="5" fill={bg}/>
        <rect x="36" y="38" width="10" height="8" rx="2" fill={blue}/>
        <rect x="54" y="38" width="10" height="8" rx="2" fill={blue}/>
        <circle cx="41" cy="42" r="3" fill="#fff" opacity="0.35"/>
        <circle cx="59" cy="42" r="3" fill="#fff" opacity="0.35"/>
        <rect x="34" y="50" width="5" height="4" rx="1" fill={blue} opacity="0.7"/>
        <rect x="43" y="50" width="5" height="4" rx="1" fill={blue} opacity="0.7"/>
        <rect x="52" y="50" width="5" height="4" rx="1" fill={blue} opacity="0.7"/>
        <rect x="61" y="50" width="5" height="4" rx="1" fill={blue} opacity="0.7"/>
        <circle cx="22" cy="46" r="7" fill="#aaa"/>
        <circle cx="22" cy="46" r="4" fill="#888"/>
        <circle cx="78" cy="46" r="7" fill="#aaa"/>
        <circle cx="78" cy="46" r="4" fill="#888"/>
        <rect x="35" y="68" width="30" height="8" rx="4" fill="#bbb"/>
      </svg>
    ),
  },
  {
    id: 'specter',
    label: 'Specter',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={bg}/>
        <path d="M20 72 Q20 22 50 22 Q80 22 80 72 Q72 62 64 72 Q58 62 50 72 Q42 62 36 72 Q28 62 20 72Z" fill={w}/>
        <circle cx="38" cy="50" r="7" fill={bg}/>
        <circle cx="62" cy="50" r="7" fill={bg}/>
        <circle cx="38" cy="50" r="5" fill={blue}/>
        <circle cx="62" cy="50" r="5" fill={blue}/>
        <circle cx="40" cy="48" r="2" fill="#fff" opacity="0.7"/>
        <circle cx="64" cy="48" r="2" fill="#fff" opacity="0.7"/>
        <path d="M42 62 Q50 68 58 62" stroke={bg} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <text x="66" y="36" fontSize="13" fill={blue} fontFamily="serif">♪</text>
      </svg>
    ),
  },
  {
    id: 'night-fox',
    label: 'Night Fox',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={bg}/>
        <polygon points="24,46 14,10 42,34" fill={w}/>
        <polygon points="76,46 86,10 58,34" fill={w}/>
        <polygon points="26,44 18,16 40,32" fill={blue}/>
        <polygon points="74,44 82,16 60,32" fill={blue}/>
        <ellipse cx="50" cy="58" rx="28" ry="24" fill={w}/>
        <ellipse cx="50" cy="66" rx="14" ry="10" fill="#e0e0e0"/>
        <ellipse cx="50" cy="62" rx="4" ry="3" fill={blue}/>
        <circle cx="38" cy="52" r="7" fill={bg}/>
        <circle cx="62" cy="52" r="7" fill={bg}/>
        <circle cx="38" cy="52" r="5" fill={blue}/>
        <circle cx="62" cy="52" r="5" fill={blue}/>
        <circle cx="40" cy="50" r="2" fill="#fff" opacity="0.7"/>
        <circle cx="64" cy="50" r="2" fill="#fff" opacity="0.7"/>
        <line x1="22" y1="61" x2="34" y2="65" stroke="#ccc" strokeWidth="2"/>
        <line x1="78" y1="61" x2="66" y2="65" stroke="#ccc" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    id: 'skull-wax',
    label: 'Skull Wax',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={bg}/>
        <ellipse cx="50" cy="45" rx="28" ry="30" fill={w}/>
        <rect x="34" y="62" width="32" height="18" rx="6" fill={w}/>
        <rect x="37" y="72" width="8" height="10" rx="2" fill={bg}/>
        <rect x="48" y="72" width="8" height="10" rx="2" fill={bg}/>
        <rect x="59" y="72" width="8" height="10" rx="2" fill={bg}/>
        <ellipse cx="37" cy="44" rx="9" ry="10" fill={bg}/>
        <ellipse cx="63" cy="44" rx="9" ry="10" fill={bg}/>
        <ellipse cx="37" cy="44" rx="6" ry="7" fill={blue}/>
        <ellipse cx="63" cy="44" rx="6" ry="7" fill={blue}/>
        <circle cx="37" cy="42" r="2" fill="#fff" opacity="0.5"/>
        <circle cx="63" cy="42" r="2" fill="#fff" opacity="0.5"/>
        <path d="M47 56 Q50 60 53 56" stroke={bg} strokeWidth="2.5" fill="none"/>
        <path d="M22 44 Q16 44 18 52 Q20 58 26 56" stroke={blue} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <circle cx="26" cy="56" r="4" fill={blue}/>
        <path d="M78 44 Q84 44 82 52 Q80 58 74 56" stroke={blue} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <circle cx="74" cy="56" r="4" fill={blue}/>
      </svg>
    ),
  },
  {
    id: 'hoot',
    label: 'Hoot',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={bg}/>
        <ellipse cx="33" cy="22" rx="7" ry="12" fill={w} transform="rotate(-20 33 22)"/>
        <ellipse cx="67" cy="22" rx="7" ry="12" fill={w} transform="rotate(20 67 22)"/>
        <ellipse cx="50" cy="58" rx="30" ry="30" fill={w}/>
        <ellipse cx="50" cy="62" rx="18" ry="20" fill="#e8e8e8"/>
        <path d="M36 56 Q50 54 64 56" stroke="#ccc" strokeWidth="1.5" fill="none"/>
        <path d="M34 62 Q50 60 66 62" stroke="#ccc" strokeWidth="1.5" fill="none"/>
        <path d="M36 68 Q50 66 64 68" stroke="#ccc" strokeWidth="1.5" fill="none"/>
        <circle cx="36" cy="44" r="13" fill={bg}/>
        <circle cx="64" cy="44" r="13" fill={bg}/>
        <circle cx="36" cy="44" r="10" fill={blue}/>
        <circle cx="64" cy="44" r="10" fill={blue}/>
        <circle cx="36" cy="44" r="5" fill="#0a2040"/>
        <circle cx="64" cy="44" r="5" fill="#0a2040"/>
        <circle cx="38" cy="40" r="3" fill="#fff" opacity="0.6"/>
        <circle cx="66" cy="40" r="3" fill="#fff" opacity="0.6"/>
        <polygon points="50,52 44,58 56,58" fill="#f4a620"/>
      </svg>
    ),
  },
  {
    id: 'frog-groove',
    label: 'Frog Groove',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={bg}/>
        <circle cx="34" cy="30" r="14" fill={w}/>
        <circle cx="66" cy="30" r="14" fill={w}/>
        <circle cx="34" cy="30" r="10" fill={blue}/>
        <circle cx="66" cy="30" r="10" fill={blue}/>
        <circle cx="34" cy="30" r="5" fill="#000"/>
        <circle cx="66" cy="30" r="5" fill="#000"/>
        <circle cx="36" cy="27" r="2.5" fill="#fff" opacity="0.7"/>
        <circle cx="68" cy="27" r="2.5" fill="#fff" opacity="0.7"/>
        <ellipse cx="50" cy="62" rx="32" ry="26" fill="#6ac47a"/>
        <ellipse cx="50" cy="62" rx="22" ry="18" fill="#82d492"/>
        <path d="M28 66 Q50 80 72 66" stroke={bg} strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M32 68 Q50 76 68 68" fill="#c0f0c8" stroke="none"/>
        <circle cx="44" cy="54" r="3" fill="#4a9458"/>
        <circle cx="56" cy="54" r="3" fill="#4a9458"/>
      </svg>
    ),
  },
  {
    id: 'fin-shark',
    label: 'Fin',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={bg}/>
        <polygon points="50,10 38,42 62,42" fill="#b0c4d8"/>
        <ellipse cx="50" cy="62" rx="32" ry="26" fill="#b0c4d8"/>
        <ellipse cx="50" cy="68" rx="22" ry="16" fill={w}/>
        <circle cx="36" cy="54" r="8" fill={bg}/>
        <circle cx="36" cy="54" r="6" fill={blue}/>
        <circle cx="36" cy="54" r="3" fill="#000"/>
        <circle cx="37" cy="52" r="1.5" fill="#fff" opacity="0.7"/>
        <path d="M30 68 Q50 80 70 68" fill={w} stroke={bg} strokeWidth="2"/>
        <line x1="38" y1="68" x2="38" y2="76" stroke={bg} strokeWidth="2"/>
        <line x1="46" y1="68" x2="46" y2="78" stroke={bg} strokeWidth="2"/>
        <line x1="54" y1="68" x2="54" y2="78" stroke={bg} strokeWidth="2"/>
        <line x1="62" y1="68" x2="62" y2="76" stroke={bg} strokeWidth="2"/>
        <ellipse cx="20" cy="65" rx="10" ry="6" fill="#a0b4c8" transform="rotate(-30 20 65)"/>
        <ellipse cx="80" cy="65" rx="10" ry="6" fill="#a0b4c8" transform="rotate(30 80 65)"/>
      </svg>
    ),
  },
  {
    id: 'luna-wolf',
    label: 'Luna Wolf',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={bg}/>
        <polygon points="24,46 16,8 42,34" fill="#c0c0c0"/>
        <polygon points="76,46 84,8 58,34" fill="#c0c0c0"/>
        <polygon points="26,44 20,14 40,32" fill={w}/>
        <polygon points="74,44 80,14 60,32" fill={w}/>
        <ellipse cx="50" cy="58" rx="28" ry="26" fill="#c8c8c8"/>
        <ellipse cx="50" cy="68" rx="16" ry="12" fill={w}/>
        <ellipse cx="50" cy="62" rx="5" ry="4" fill={bg}/>
        <path d="M42 70 Q50 76 58 70" stroke={bg} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <circle cx="38" cy="52" r="7" fill={blue}/>
        <circle cx="62" cy="52" r="7" fill={blue}/>
        <circle cx="38" cy="52" r="3.5" fill="#0a2040"/>
        <circle cx="62" cy="52" r="3.5" fill="#0a2040"/>
        <circle cx="39" cy="50" r="1.5" fill="#fff" opacity="0.7"/>
        <circle cx="63" cy="50" r="1.5" fill="#fff" opacity="0.7"/>
        <path d="M44 34 Q40 28 46 24 Q36 22 34 30 Q32 38 40 40 Q36 36 44 34Z" fill={blue}/>
      </svg>
    ),
  },
  {
    id: 'pixel',
    label: '8-Bit',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={bg}/>
        <rect x="26" y="18" width="48" height="8" rx="1" fill={w}/>
        <rect x="18" y="26" width="64" height="8" fill={w}/>
        <rect x="18" y="34" width="64" height="8" fill={w}/>
        <rect x="30" y="34" width="12" height="8" fill={blue}/>
        <rect x="58" y="34" width="12" height="8" fill={blue}/>
        <rect x="18" y="42" width="64" height="8" fill={w}/>
        <rect x="18" y="50" width="64" height="8" fill={w}/>
        <rect x="34" y="50" width="8" height="8" fill={bg}/>
        <rect x="50" y="50" width="16" height="8" fill={bg}/>
        <rect x="18" y="58" width="64" height="8" fill={w}/>
        <rect x="34" y="66" width="32" height="8" fill={w}/>
        <rect x="22" y="74" width="56" height="8" rx="2" fill={blue}/>
        <rect x="10" y="28" width="6" height="6" rx="1" fill={blue}/>
        <rect x="84" y="28" width="6" height="6" rx="1" fill={blue}/>
        <rect x="10" y="56" width="4" height="4" rx="1" fill={blue} opacity="0.6"/>
        <rect x="86" y="52" width="4" height="4" rx="1" fill={blue} opacity="0.6"/>
      </svg>
    ),
  },
  {
    id: 'dugo-mascot',
    label: 'Dugo',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={bg}/>
        <line x1="50" y1="8" x2="50" y2="20" stroke={blue} strokeWidth="3" strokeLinecap="round"/>
        <circle cx="50" cy="6" r="4" fill={blue}/>
        <path d="M32 20 L32 80 Q32 84 36 84 L54 84 Q78 84 78 52 Q78 20 54 20 L36 20 Q32 20 32 24Z" fill={w}/>
        <path d="M40 30 L40 74 L52 74 Q66 74 66 52 Q66 30 52 30 Z" fill={bg}/>
        <circle cx="54" cy="44" r="6" fill={blue}/>
        <circle cx="54" cy="44" r="3" fill="#fff"/>
        <circle cx="54" cy="60" r="4" fill={blue}/>
        <circle cx="54" cy="60" r="2" fill="#fff"/>
        <line x1="36" y1="44" x2="38" y2="44" stroke={blue} strokeWidth="2"/>
        <line x1="36" y1="50" x2="38" y2="50" stroke={blue} strokeWidth="2"/>
        <line x1="36" y1="56" x2="38" y2="56" stroke={blue} strokeWidth="2"/>
        <path d="M44 66 Q50 72 58 66" stroke={blue} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'comet',
    label: 'Comet',
    svg: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={bg}/>
        <path d="M20 80 Q35 60 60 50" stroke={blue} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4"/>
        <path d="M14 70 Q30 55 58 50" stroke={blue} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.25"/>
        <path d="M18 86 Q40 68 62 52" stroke={blue} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.2"/>
        <circle cx="68" cy="40" r="22" fill={w}/>
        <circle cx="68" cy="40" r="18" fill={blue} opacity="0.12"/>
        <circle cx="60" cy="36" r="6" fill={bg}/>
        <circle cx="76" cy="36" r="6" fill={bg}/>
        <circle cx="60" cy="36" r="4.5" fill={blue}/>
        <circle cx="76" cy="36" r="4.5" fill={blue}/>
        <circle cx="61" cy="34" r="2" fill="#fff" opacity="0.7"/>
        <circle cx="77" cy="34" r="2" fill="#fff" opacity="0.7"/>
        <path d="M57 46 Q68 54 79 46" stroke={bg} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <circle cx="22" cy="30" r="3" fill={blue}/>
        <circle cx="14" cy="50" r="2" fill={blue} opacity="0.6"/>
        <circle cx="30" cy="18" r="2" fill={blue} opacity="0.8"/>
      </svg>
    ),
  },
]

// Render an avatar by id
export function AvatarIcon({ id, size = 40, style = {} }) {
  const avatar = AVATARS.find((a) => a.id === id)
  if (!avatar) return null
  return React.cloneElement(avatar.svg, {
    width: size,
    height: size,
    style: { display: 'block', borderRadius: '50%', flexShrink: 0, ...style },
  })
}
