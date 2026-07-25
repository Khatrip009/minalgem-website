// src/api/auth.js
import { supabase } from '../lib/supabase'

/**
 * Register a new user.
 * Returns the Supabase user object.
 */
export const register = async ({ full_name, email, password }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },   // stored in user_metadata
    },
  })

  if (error) throw new Error(error.message)
  return data.user
}

/**
 * Sign in with email and password.
 * Returns the Supabase user object.
 */
export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw new Error(error.message)
  return data.user
}

/**
 * Sign out.
 */
export const logout = async () => {
  await supabase.auth.signOut()
  window.location.replace('/login?logout=1')
}

/**
 * Refresh the session token (if needed).
 * Supabase handles token refresh automatically, so this is a no-op.
 */
export const refreshToken = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

/**
 * Get the currently authenticated user.
 * Returns { user, profile } merged object (similar to old API).
 */
export const getMe = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  // Also fetch the profile for extra info (optional)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email,
    full_name: profile?.full_name || user.user_metadata?.full_name || '',
    avatar_url: profile?.avatar_url || '',
    role: profile?.role || 'customer',
  }
}

// The old setAccessToken and clearAccessToken are no longer needed,
// but if any code still imports them, provide empty stubs.
export const setAccessToken = (token) => {
  // Supabase manages the token internally.
}

export const clearAccessToken = () => {
  // Supabase manages the token internally.
}