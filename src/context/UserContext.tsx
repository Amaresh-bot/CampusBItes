import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StudentProfile } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserState {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

interface UserContextValue {
  user: UserState | null;
  setUser: (u: UserState | null) => void;
  studentProfile: StudentProfile | null;
  setStudentProfile: (p: StudentProfile | null) => void;
  isProfileLoading: boolean;
  /** Trigger a profile fetch (deduped — will no-op if already in-flight) */
  fetchStudentProfile: () => Promise<void>;
  /** Prefetch in background without setting loading state (for hover prefetch) */
  prefetchStudentProfile: () => void;
  logout: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const UserContext = createContext<UserContextValue | null>(null);

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUserState] = useState<UserState | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // Lock to prevent duplicate concurrent profile fetches
  const fetchInFlight = useRef(false);
  // Track last fetched user id to avoid re-fetching for the same user
  const lastFetchedUserId = useRef<string | null>(null);

  // Restore session + profile from localStorage on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem('canteen_user');
    if (cachedUser) {
      try {
        const parsed: UserState = JSON.parse(cachedUser);
        setUserState(parsed);
        // Instantly restore profile from cache (SWR pattern)
        const cachedProfile = localStorage.getItem(`student_profile_${parsed.id}`);
        if (cachedProfile) {
          try {
            setStudentProfile(JSON.parse(cachedProfile));
            setIsProfileLoading(false);
          } catch {
            setIsProfileLoading(false);
          }
        } else {
          setIsProfileLoading(false);
        }
      } catch {
        setIsProfileLoading(false);
      }
    } else {
      setIsProfileLoading(false);
    }
  }, []);

  const setUser = useCallback((u: UserState | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('canteen_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('canteen_user');
    }
  }, []);

  const fetchStudentProfile = useCallback(async () => {
    if (!user) {
      setIsProfileLoading(false);
      return;
    }
    // Dedup guard: skip if the same user is already being fetched or was just fetched
    if (fetchInFlight.current) return;
    if (lastFetchedUserId.current === user.id && studentProfile !== null) return;

    fetchInFlight.current = true;
    setIsProfileLoading(true);

    try {
      const res = await fetch(`/api/student/profile/${user.id}?email=${encodeURIComponent(user.email || '')}`);
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setStudentProfile(data);
          localStorage.setItem(`student_profile_${user.id}`, JSON.stringify(data));
        } else {
          // Fallback to localStorage cache
          const localRaw = localStorage.getItem(`student_profile_${user.id}`);
          if (localRaw) {
            try { setStudentProfile(JSON.parse(localRaw)); } catch { /* noop */ }
          } else {
            setStudentProfile(null);
          }
        }
      } else {
        // Network/non-200: use cache
        const localRaw = localStorage.getItem(`student_profile_${user.id}`);
        if (localRaw) {
          try { setStudentProfile(JSON.parse(localRaw)); } catch { /* noop */ }
        }
      }
      lastFetchedUserId.current = user.id;
    } catch {
      const localRaw = localStorage.getItem(`student_profile_${user.id}`);
      if (localRaw) {
        try { setStudentProfile(JSON.parse(localRaw)); } catch { /* noop */ }
      }
    } finally {
      fetchInFlight.current = false;
      setIsProfileLoading(false);
    }
  }, [user, studentProfile]);

  /**
   * Silent background prefetch — does NOT set loading state, so the UI
   * does not flicker. Called on hover over the Profile nav tab.
   */
  const prefetchStudentProfile = useCallback(() => {
    if (!user) return;
    if (fetchInFlight.current) return;
    if (lastFetchedUserId.current === user.id && studentProfile !== null) return;
    // Fire and forget — no loading state
    fetchInFlight.current = true;
    fetch(`/api/student/profile/${user.id}?email=${encodeURIComponent(user.email || '')}`)
      .then(async (res) => {
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          if (data && Object.keys(data).length > 0) {
            setStudentProfile(data);
            localStorage.setItem(`student_profile_${user.id}`, JSON.stringify(data));
          }
        }
        lastFetchedUserId.current = user.id;
      })
      .catch(() => { /* noop */ })
      .finally(() => { fetchInFlight.current = false; });
  }, [user, studentProfile]);

  const logout = useCallback(() => {
    localStorage.removeItem('canteen_user');
    setUserState(null);
    setStudentProfile(null);
    lastFetchedUserId.current = null;
    fetchInFlight.current = false;
  }, []);

  const value = useMemo<UserContextValue>(() => ({
    user,
    setUser,
    studentProfile,
    setStudentProfile,
    isProfileLoading,
    fetchStudentProfile,
    prefetchStudentProfile,
    logout,
  }), [user, setUser, studentProfile, isProfileLoading, fetchStudentProfile, prefetchStudentProfile, logout]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
