import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  getMe,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  refreshToken,
} from '../api/auth';
import { clearAccessToken } from '../api/client';
import { subscribeToPush } from '../utils/notifications';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasSubscribedRef = useRef(false);

  // Helper to subscribe to push notifications (only once per user session)
  const trySubscribe = useCallback(async (userData) => {
    if (!userData || hasSubscribedRef.current) return;
    try {
      await subscribeToPush();
      hasSubscribedRef.current = true;
      console.log('✅ Push notifications subscribed');
    } catch (err) {
      console.warn('Push subscription failed:', err);
      // Do not block the user experience
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initSession = async () => {
      // Barrier 1: sessionStorage flag set during logout
      if (sessionStorage.getItem('logout-flag') === '1') {
        sessionStorage.removeItem('logout-flag');
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      // Barrier 2: URL logout parameter
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('logout') === '1') {
        window.history.replaceState({}, document.title, '/login');
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      // Normal session restore
      try {
        await refreshToken();
        const { user: fetchedUser } = await getMe();
        if (!cancelled) {
          setUser(fetchedUser);
          // Subscribe to push notifications after restore
          await trySubscribe(fetchedUser);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initSession();
    return () => { cancelled = true; };
  }, [trySubscribe]);

  const login = useCallback(async (email, password) => {
    const loggedInUser = await apiLogin(email, password);
    setUser(loggedInUser);
    await trySubscribe(loggedInUser);
    return loggedInUser;
  }, [trySubscribe]);

  const registerUser = useCallback(async (payload) => {
    const newUser = await apiRegister(payload);
    setUser(newUser);
    await trySubscribe(newUser);
    return newUser;
  }, [trySubscribe]);

  const logout = useCallback(async () => {
    // 1. Remove access token from memory
    clearAccessToken();

    // 2. Set a flag that will block any future refresh attempt
    sessionStorage.setItem('logout-flag', '1');

    // 3. Call the backend logout (deletes session in DB)
    try {
      await apiLogout();
    } catch (e) {
      console.warn('Logout request failed', e);
    }

    // 4. Reset subscription flag
    hasSubscribedRef.current = false;

    // 5. Wipe user state and redirect with a unique cache-buster
    setUser(null);
    window.location.replace(`/login?logout=1&nocache=${Date.now()}`);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register: registerUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}