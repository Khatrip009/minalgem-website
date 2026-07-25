import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { subscribeToPush } from '../utils/notifications'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const hasSubscribedRef = useRef(false)

  // Helper to subscribe to push notifications (once per session)
  const trySubscribe = useCallback(async (userData) => {
    if (!userData || hasSubscribedRef.current) return
    try {
      await subscribeToPush()
      hasSubscribedRef.current = true
      console.log('✅ Push notifications subscribed')
    } catch (err) {
      console.warn('Push subscription failed:', err)
    }
  }, [])

  // --- Session restoration on mount ---
  useEffect(() => {
    let cancelled = false

    const initSession = async () => {
      // Barrier 1: logout flag from previous session
      if (sessionStorage.getItem('logout-flag') === '1') {
        sessionStorage.removeItem('logout-flag')
        if (!cancelled) {
          setUser(null)
          setLoading(false)
        }
        return
      }

      // Barrier 2: URL logout parameter
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('logout') === '1') {
        window.history.replaceState({}, document.title, '/login')
        if (!cancelled) {
          setUser(null)
          setLoading(false)
        }
        return
      }

      try {
        // Get current session from Supabase
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          // Optionally fetch the profile to merge with user object
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          const enrichedUser = {
            ...session.user,
            full_name: profile?.full_name || session.user.user_metadata?.full_name || '',
            avatar_url: profile?.avatar_url || '',
            role: profile?.role || 'customer',
          }
          if (!cancelled) {
            setUser(enrichedUser)
            await trySubscribe(enrichedUser)
          }
        } else {
          if (!cancelled) setUser(null)
        }
      } catch (err) {
        console.error('Session restore error:', err)
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    initSession()
    return () => { cancelled = true }
  }, [trySubscribe])

  // --- Auth state listener (for live token refreshes) ---
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        const enrichedUser = {
          ...session.user,
          full_name: profile?.full_name || session.user.user_metadata?.full_name || '',
          avatar_url: profile?.avatar_url || '',
          role: profile?.role || 'customer',
        }
        setUser(enrichedUser)
        await trySubscribe(enrichedUser)
      }
      if (event === 'SIGNED_OUT') {
        setUser(null)
        hasSubscribedRef.current = false
      }
    })

    return () => subscription.unsubscribe()
  }, [trySubscribe])

  // --- Public methods ---
  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // User will be set by the onAuthStateChange listener
    return data.user
  }, [])

  const registerUser = useCallback(async (payload) => {
    const { full_name, email, password } = payload
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    })
    if (error) throw error
    // User will be set by the onAuthStateChange listener
    return data.user
  }, [])

  const logout = useCallback(async () => {
    // Set logout flag to prevent session restore on next load
    sessionStorage.setItem('logout-flag', '1')
    hasSubscribedRef.current = false

    // Sign out from Supabase
    await supabase.auth.signOut()

    // Redirect to login
    window.location.replace(`/login?logout=1&nocache=${Date.now()}`)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register: registerUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}