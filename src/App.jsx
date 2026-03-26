import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PlayerProvider } from './contexts/PlayerContext'
import Landing from './components/Landing/Landing'
import AuthPage from './components/Auth/AuthPage'
import Layout from './components/Layout/Layout'
import Home from './components/Pages/Home'
import Search from './components/Pages/Search'
import Library from './components/Pages/Library'
import LikedSongs from './components/Pages/LikedSongs'
import RecentlyPlayed from './components/Pages/RecentlyPlayed'
import PlaylistView from './components/Pages/PlaylistView'
import Settings from './components/Pages/Settings'
import Stats from './components/Pages/Stats'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/app/home" replace />
  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<GuestRoute><Landing /></GuestRoute>} />
      <Route path="/login" element={<GuestRoute><AuthPage mode="login" /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><AuthPage mode="signup" /></GuestRoute>} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="library" element={<Library />} />
        <Route path="liked" element={<LikedSongs />} />
        <Route path="recent" element={<RecentlyPlayed />} />
        <Route path="playlist/:id" element={<PlaylistView />} />
        <Route path="settings" element={<Settings />} />
        <Route path="stats" element={<Stats />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

const App = () => (
  <AuthProvider>
    <PlayerProvider>
      <AppRoutes />
    </PlayerProvider>
  </AuthProvider>
)

export default App
