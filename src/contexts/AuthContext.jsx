import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from '../firebase'

// ── Client-side auth rate limiter (5 attempts / 15 min / email) ──────────────
const AUTH_RL_PREFIX = 'rd_auth_rl_'
const AUTH_MAX_ATTEMPTS = 5
const AUTH_WINDOW_MS = 15 * 60 * 1000

export function checkAuthRateLimit(email) {
  try {
    const key = AUTH_RL_PREFIX + email.toLowerCase().trim()
    const raw = localStorage.getItem(key)
    if (!raw) return { allowed: true, remaining: AUTH_MAX_ATTEMPTS }
    const { count, resetAt } = JSON.parse(raw)
    if (Date.now() > resetAt) {
      localStorage.removeItem(key)
      return { allowed: true, remaining: AUTH_MAX_ATTEMPTS }
    }
    if (count >= AUTH_MAX_ATTEMPTS) {
      const resetIn = Math.ceil((resetAt - Date.now()) / 1000 / 60)
      return { allowed: false, remaining: 0, resetIn }
    }
    return { allowed: true, remaining: AUTH_MAX_ATTEMPTS - count }
  } catch {
    return { allowed: true, remaining: AUTH_MAX_ATTEMPTS }
  }
}

export function recordFailedAuthAttempt(email) {
  try {
    const key = AUTH_RL_PREFIX + email.toLowerCase().trim()
    const raw = localStorage.getItem(key)
    if (!raw || Date.now() > JSON.parse(raw).resetAt) {
      localStorage.setItem(key, JSON.stringify({ count: 1, resetAt: Date.now() + AUTH_WINDOW_MS }))
    } else {
      const data = JSON.parse(raw)
      localStorage.setItem(key, JSON.stringify({ ...data, count: data.count + 1 }))
    }
  } catch { /* non-critical */ }
}

export function clearAuthAttempts(email) {
  try {
    localStorage.removeItem(AUTH_RL_PREFIX + email.toLowerCase().trim())
  } catch { /* non-critical */ }
}
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// Read Firebase Auth's localStorage cache synchronously.
// Firebase (with LOCAL persistence) stores the current user under
// "firebase:authUser:<apiKey>:[DEFAULT]". If that key exists we know
// the user was previously signed in, so we can skip the loading gate
// entirely and let onAuthStateChanged confirm in the background.
function hasCachedFirebaseUser() {
  try {
    return Object.keys(localStorage).some((k) => k.startsWith('firebase:authUser:'))
  } catch {
    return false
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  // Skip the loading gate if a cached session exists — renders instantly.
  const [loading, setLoading] = useState(!hasCachedFirebaseUser())

  const fetchProfile = useCallback(async (uid) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid))
      if (snap.exists()) {
        setUserProfile(snap.data())
      }
    } catch (e) {
      console.error('Error fetching profile:', e)
    }
  }, [])

  const signup = async (email, password, firstName, lastName = '') => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: firstName })
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      firstName,
      lastName,
      createdAt: serverTimestamp(),
      settings: {},
    })
    await fetchProfile(cred.user.uid)
    return cred
  }

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const logout = () => {
    setUserProfile(null)
    return signOut(auth)
  }

  const resetPassword = (email) => sendPasswordResetEmail(auth, email)

  const updateUserProfile = async (data) => {
    if (!user) return
    // Optimistic update — reflect change in UI immediately, then persist
    setUserProfile((prev) => ({ ...(prev || {}), ...data }))
    await updateDoc(doc(db, 'users', user.uid), data)
  }

  // Primary auth state listener — set loading=false immediately so the app
  // renders as soon as Firebase Auth resolves, then fetch profile in background.
  // A 5-second failsafe ensures a Firebase hang never keeps the user on a blank screen.
  useEffect(() => {
    const failsafe = setTimeout(() => setLoading(false), 5000)
    const unsub = onAuthStateChanged(auth, (u) => {
      clearTimeout(failsafe)
      setUser(u)
      if (u) {
        fetchProfile(u.uid) // non-blocking — profile loads in background
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return () => { clearTimeout(failsafe); unsub() }
  }, [fetchProfile])

  // Retry profile fetch if user is authenticated but profile didn't load
  useEffect(() => {
    if (user && !userProfile && !loading) {
      fetchProfile(user.uid)
    }
  }, [user, userProfile, loading, fetchProfile])

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signup,
        login,
        logout,
        resetPassword,
        updateUserProfile,
        fetchProfile,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}
