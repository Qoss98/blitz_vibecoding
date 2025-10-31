import { supabase } from '@/lib/supabase/client';

export type AuthUser = {
  id: string;
  email: string;
};

export async function signInWithEmailPassword(email: string, password: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session ?? null;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  if (!u?.email) return null;
  return { id: u.id, email: u.email };
}

export async function signUpWithEmailPassword(email: string, password: string, _name: string) {
  if (!supabase) throw new Error('Supabase not configured');
  
  try {
    // Create auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) {
      // Provide more specific error messages
      if (authError.message.includes('429') || authError.message.includes('rate limit')) {
        throw new Error('Te veel pogingen. Probeer het over een moment opnieuw.');
      }
      if (authError.message.includes('already registered')) {
        throw new Error('Dit e-mailadres is al geregistreerd. Probeer in te loggen.');
      }
      throw authError;
    }
    
    // Note: Manager creation will happen automatically when user logs in
    // via ensureTalentManagerExists in auth-provider
    
    return authData.session ?? null;
  } catch (error: any) {
    // Re-throw with better error message
    if (error?.message) {
      throw error;
    }
    throw new Error('Registratie mislukt. Probeer het opnieuw.');
  }
}

// Magic link sign-in for trainees (passwordless)
export async function signInWithMagicLink(email: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
  // Magic link sends email, no session returned immediately
  return null;
}

