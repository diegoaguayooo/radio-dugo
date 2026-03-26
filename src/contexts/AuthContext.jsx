import React, { createContext, useContext, useEffect, useState } from 'react'
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

  const fetchProfile = async (uid) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid))
      if (snap.exists()) setUserProfile(snap.data())
    } catch (e) {
      console.error('Error fetching profile:', e)
    }
  }

  const signup = async (email, password, firstName, lastName = '') => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: firstName })
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      firstName,
      lastName,
      createdAt: serverTimestamp(),
      settings: { soundcloudClientId: '' },
    })
    await fetchProfile(cred.user.uid)
    return cred
  }

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const logout = () => signOut(auth)

  const resetPassword = (email) => sendPasswordResetEmail(auth, email)

  const updateUserProfile = async (data) => {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid), data)
    setUserProfile((prev) => ({ ...prev, ...data }))
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) await fetchProfile(u.uid)
      else setUserProfile(null)
      setLoading(false)
    })
    return unsub
  }, [])

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
