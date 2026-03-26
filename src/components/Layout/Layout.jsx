import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import PlayerBar from './PlayerBar'
import QueuePanel from './QueuePanel'
import LyricsPanel from './LyricsPanel'
import DJDugo from './DJDugo'
import { usePlayer } from '../../contexts/PlayerContext'

export default function Layout() {
  const { currentTrack, showQueue, showLyrics } = usePlayer()

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Scrollable page content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingBottom: currentTrack ? '90px' : '0',
          }}
        >
          <Outlet />
        </div>
      </div>

      {/* Lyrics panel */}
      {showLyrics && <LyricsPanel />}

      {/* Queue panel (slides in from right) */}
      {showQueue && <QueuePanel />}

      {/* Player bar */}
      {currentTrack && <PlayerBar />}

      {/* DJ Dugo — renders nothing, just speaks */}
      <DJDugo />
    </div>
  )
}
