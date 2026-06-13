import { createClient } from '@supabase/supabase-js';

// Retrieve public environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create and export the Supabase Client conditionally to prevent app startup crash when keys are missing
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Executes a Supabase Google OAuth sign in flow.
 * Configured with skipBrowserRedirect: true to retrieve the authorization URL for easy iframe popup context.
 */
export async function signInWithGoogle() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase public environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) are not configured.");
  }
  
  const redirectUri = `${window.location.origin}/api/auth/callback`;
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: true
    }
  });

  if (error) {
    throw error;
  }

  return data;
}
