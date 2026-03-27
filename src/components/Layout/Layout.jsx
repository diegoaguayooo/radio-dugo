import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import PlayerBar from './PlayerBar'
import QueuePanel from './QueuePanel'
import DJDugo from './DJDugo'
import MobileNav from './MobileNav'
import MobileHeader from './MobileHeader'
import MobileSidebar from './MobileSidebar'
import WelcomeModal from '../shared/WelcomeModal'
import { usePlayer } from '../../contexts/PlayerContext'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useAuth } from '../../contexts/AuthContext'

export default function Layout() {
  const { currentTrack, showQueue } = usePlayer()
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (!user) return
    const key = `rdwelcome_${user.uid}`
    if (!localStorage.getItem(key)) {
      setShowWelcome(true)
    }
  }, [user])

  const dismissWelcome = () => {
    if (user) localStorage.setItem(`rdwelcome_${user.uid}`, '1')
    setShowWelcome(false)
  }

  // On mobile: 60px bottom nav + 75px compact player (if playing). Desktop: 90px player.
  const bottomPad = isMobile
    ? `${60 + (currentTrack ? 75 : 0)}px`
    : currentTrack ? '90px' : '0'

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a', overflow: 'hidden' }}>
      {/* Sidebar — hidden on mobile */}
      {!isMobile && <Sidebar />}

      {/* Mobile fixed header */}
      {isMobile && <MobileHeader onAvatarTap={() => setMobileSidebarOpen(true)} />}

      {/* Mobile slide-in sidebar */}
      {isMobile && (
        <MobileSidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Scrollable page content */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: bottomPad, paddingTop: isMobile ? '52px' : '0' }}>
          <Outlet />
        </div>
      </div>

      {/* Queue panel */}
      {showQueue && <QueuePanel />}

      {/* Player bar */}
      {currentTrack && <PlayerBar />}

      {/* Mobile bottom nav */}
      {isMobile && <MobileNav />}

      {/* DJ Dugo — renders nothing, just speaks */}
      <DJDugo />

      {/* First-login welcome modal */}
      {showWelcome && <WelcomeModal onClose={dismissWelcome} />}
    </div>
  )
}
