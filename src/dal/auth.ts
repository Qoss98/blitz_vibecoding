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
    
    // Don't create talent_manager during signup - let ensureTalentManagerExists handle it on first login
    // This avoids race conditions and duplicate key errors (409)
    // The ensureTalentManagerExists function will create it when user first logs in
    // Note: _name parameter is not used here but kept for API consistency
    // In the future, we could store it somewhere to use during manager creation
    
    return authData.session ?? null;
  } catch (error: any) {
    // Re-throw with better error message
    if (error?.message) {
      throw error;
    }
    throw new Error('Registratie mislukt. Probeer het opnieuw.');
  }
}

