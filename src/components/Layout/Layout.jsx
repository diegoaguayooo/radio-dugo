import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import PlayerBar from './PlayerBar'
import QueuePanel from './QueuePanel'
import LyricsPanel from './LyricsPanel'
import DJDugo from './DJDugo'
import MobileNav from './MobileNav'
import { usePlayer } from '../../contexts/PlayerContext'
import { useIsMobile } from '../../hooks/useIsMobile'

export default function Layout() {
  const { currentTrack, showQueue, showLyrics } = usePlayer()
  const isMobile = useIsMobile()

  // On mobile: 60px bottom nav + 75px compact player (if playing). Desktop: 90px player.
  const bottomPad = isMobile
    ? `${60 + (currentTrack ? 75 : 0)}px`
    : currentTrack ? '90px' : '0'

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a', overflow: 'hidden' }}>
      {/* Sidebar — hidden on mobile */}
      {!isMobile && <Sidebar />}

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Scrollable page content */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: bottomPad }}>
          <Outlet />
        </div>
      </div>

      {/* Lyrics panel — desktop only */}
      {!isMobile && showLyrics && <LyricsPanel />}

      {/* Queue panel — desktop only */}
      {!isMobile && showQueue && <QueuePanel />}

      {/* Player bar */}
      {currentTrack && <PlayerBar />}

      {/* Mobile bottom nav */}
      {isMobile && <MobileNav />}

      {/* DJ Dugo — renders nothing, just speaks */}
      <DJDugo />
    </div>
  )
}
