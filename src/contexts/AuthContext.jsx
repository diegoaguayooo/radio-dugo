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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

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
    await updateDoc(doc(db, 'users', user.uid), data)
    setUserProfile((prev) => ({ ...(prev || {}), ...data }))
  }

  // Primary auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        await fetchProfile(u.uid)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsub
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
