import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StudentProfile } from '../types';
import { SafeStorage } from '../lib/storage';
import { supabase } from '../supabaseClient';

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
    async function restoreSession() {
      setIsProfileLoading(true);
      
      let resolvedUserId: string | null = null;
      let resolvedEmail: string | null = null;
      let resolvedName: string | null = null;

      // 1. Try MERN JWT Cookie Session (via auth status)
      try {
        const res = await fetch('/api/auth/status', { credentials: 'include' });
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          if (data && data.authenticated && data.user) {
            const resolvedRole = (data.user.email && data.user.email.toLowerCase() === 'shivaganeshmummadi7@gmail.com') || (data.user.role === 'admin') ? 'admin' : 'customer';
            setUserState({
              id: data.user.id,
              name: data.user.fullName || 'Student',
              email: data.user.email || '',
              role: resolvedRole
            });
            setStudentProfile({
              id: data.user.id,
              email: data.user.email,
              fullName: data.user.fullName,
              rollNumber: data.user.rollNumber,
              rollNo: data.user.rollNumber, // Frontend compatibility
              branch: data.user.branch,
              academicYear: data.user.academicYear,
              year: data.user.academicYear as any, // Frontend compatibility
              phoneNumber: data.user.phoneNumber,
              contactNo: data.user.phoneNumber, // Frontend compatibility
              isVerified: data.user.isVerified
            });
            setIsProfileLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("[UserContext] status session restore failed:", err);
      }

      // 2. Fallback to Firebase Auth (if initialized and active)
      try {
        const { auth: firebaseAuth } = await import('../firebase/config');
        if (firebaseAuth && firebaseAuth.currentUser) {
          const fUser = firebaseAuth.currentUser;
          resolvedUserId = fUser.uid;
          resolvedEmail = fUser.email;
          resolvedName = fUser.displayName;
          console.log("[UserContext] Restored session from Firebase Auth:", resolvedUserId);
        }
      } catch (err) {
        // Firebase might not be initialized or configured yet
      }

      // 3. Fallback to safe whitelisted user ID string
      if (!resolvedUserId) {
        resolvedUserId = SafeStorage.getItem('canteen_user_id');
        if (resolvedUserId) {
          console.log("[UserContext] Restored session from SafeStorage ID:", resolvedUserId);
        }
      }

      if (resolvedUserId) {
        // We have a logged-in user! Now fetch their student profile from the database
        try {
          const res = await fetch(`/api/student/profile/${resolvedUserId}${resolvedEmail ? `?email=${encodeURIComponent(resolvedEmail)}` : ''}`, { credentials: 'include' });
          if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
            const profileData = await res.json();
            if (profileData && Object.keys(profileData).length > 0) {
              const rawProfile = profileData.profile || profileData;
              const mappedProfile = {
                ...rawProfile,
                id: rawProfile.id || rawProfile._id?.toString(),
                rollNo: rawProfile.rollNo || rawProfile.rollNumber,
                rollNumber: rawProfile.rollNumber || rawProfile.rollNo,
                year: rawProfile.year || rawProfile.academicYear,
                academicYear: rawProfile.academicYear || rawProfile.year,
                contactNo: rawProfile.contactNo || rawProfile.phoneNumber,
                phoneNumber: rawProfile.phoneNumber || rawProfile.contactNo
              };
              setStudentProfile(mappedProfile);
              // Construct UserState in memory
              const resolvedRole = (resolvedEmail && resolvedEmail.toLowerCase() === 'shivaganeshmummadi7@gmail.com') || (profileData.email && profileData.email.toLowerCase() === 'shivaganeshmummadi7@gmail.com') ? 'admin' : 'customer';
              setUserState({
                id: resolvedUserId,
                name: profileData.fullName || resolvedName || 'Student',
                email: profileData.email || resolvedEmail || '',
                role: resolvedRole
              });
            } else {
              // Fallback default in-memory state if profile not fully created yet
              const resolvedRole = (resolvedEmail && resolvedEmail.toLowerCase() === 'shivaganeshmummadi7@gmail.com') ? 'admin' : 'customer';
              setUserState({
                id: resolvedUserId,
                name: resolvedName || 'Student',
                email: resolvedEmail || '',
                role: resolvedRole
              });
            }
          } else {
            // Reconstruct minimal memory UserState if profile query fails but we have ID
            const resolvedRole = (resolvedEmail && resolvedEmail.toLowerCase() === 'shivaganeshmummadi7@gmail.com') ? 'admin' : 'customer';
            setUserState({
              id: resolvedUserId,
              name: resolvedName || 'Student',
              email: resolvedEmail || '',
              role: resolvedRole
            });
          }
        } catch (err) {
          console.error("[UserContext] Failed to fetch profile on restore:", err);
          // Reconstruct minimal memory UserState
          const resolvedRole = (resolvedEmail && resolvedEmail.toLowerCase() === 'shivaganeshmummadi7@gmail.com') ? 'admin' : 'customer';
          setUserState({
            id: resolvedUserId,
            name: resolvedName || 'Student',
            email: resolvedEmail || '',
            role: resolvedRole
          });
        }
      }
      setIsProfileLoading(false);
    }

    restoreSession();
  }, []);

  const setUser = useCallback((u: UserState | null) => {
    setUserState(u);
    if (u) {
      // Security enforcement: Store ONLY the user ID string, never the email/name object!
      SafeStorage.setItem('canteen_user_id', u.id);
    } else {
      SafeStorage.removeItem('canteen_user_id');
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
      const res = await fetch(`/api/student/profile/${user.id}?email=${encodeURIComponent(user.email || '')}`, { credentials: 'include' });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          const rawProfile = data.profile || data;
          const mappedProfile = {
            ...rawProfile,
            id: rawProfile.id || rawProfile._id?.toString(),
            rollNo: rawProfile.rollNo || rawProfile.rollNumber,
            rollNumber: rawProfile.rollNumber || rawProfile.rollNo,
            year: rawProfile.year || rawProfile.academicYear,
            academicYear: rawProfile.academicYear || rawProfile.year,
            contactNo: rawProfile.contactNo || rawProfile.phoneNumber,
            phoneNumber: rawProfile.phoneNumber || rawProfile.contactNo
          };
          setStudentProfile(mappedProfile);
        } else {
          setStudentProfile(null);
        }
      }
      lastFetchedUserId.current = user.id;
    } catch (err) {
      console.error("[UserContext] fetchStudentProfile failed:", err);
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
    fetch(`/api/student/profile/${user.id}?email=${encodeURIComponent(user.email || '')}`, { credentials: 'include' })
      .then(async (res) => {
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          if (data && Object.keys(data).length > 0) {
            const rawProfile = data.profile || data;
            const mappedProfile = {
              ...rawProfile,
              id: rawProfile.id || rawProfile._id?.toString(),
              rollNo: rawProfile.rollNo || rawProfile.rollNumber,
              rollNumber: rawProfile.rollNumber || rawProfile.rollNo,
              year: rawProfile.year || rawProfile.academicYear,
              academicYear: rawProfile.academicYear || rawProfile.year,
              contactNo: rawProfile.contactNo || rawProfile.phoneNumber,
              phoneNumber: rawProfile.phoneNumber || rawProfile.contactNo
            };
            setStudentProfile(mappedProfile);
          }
        }
        lastFetchedUserId.current = user.id;
      })
      .catch(() => { /* noop */ })
      .finally(() => { fetchInFlight.current = false; });
  }, [user, studentProfile]);

  const logout = useCallback(() => {
    SafeStorage.removeItem('canteen_user_id');
    // Call backend logout endpoint to clear HTTP-only cookies
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(err => console.error("Backend logout error:", err));

    // Also sign out from Supabase Auth if logged in
    if (supabase) {
      supabase.auth.signOut().catch(err => console.error("Supabase signOut error:", err));
    }
    // Also sign out from Firebase Auth if logged in
    try {
      import('../firebase/config').then(({ auth: firebaseAuth }) => {
        if (firebaseAuth) firebaseAuth.signOut().catch(err => console.error("Firebase signOut error:", err));
      });
    } catch (e) {
      // Firebase might not be configured
    }

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
