import { supabase } from '@/lib/supabase/client';
import type { Program } from '@/types/database';

export async function getManagerIdByEmail(email: string): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('talent_managers')
      .select('id')
      .eq('email', email)
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid PGRST116 error when 0 rows
    if (error) {
      // Don't log 406 errors (Not Acceptable) or PGRST116 (0 rows) - these are expected
      const status = (error as any).status || (error as any).code;
      const errorCode = error.code;
      if (status !== 406 && errorCode !== 'PGRST116') {
        console.error('Error getting manager ID:', error);
      }
      return null;
    }
    return data?.id ?? null;
  } catch (error) {
    console.error('Exception getting manager ID:', error);
    return null;
  }
}

export async function getManagerNameByEmail(email: string): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('talent_managers')
      .select('name')
      .eq('email', email)
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid PGRST116 error when 0 rows
    if (error) {
      // Don't log 406 errors (Not Acceptable) or PGRST116 (0 rows) - these are expected
      const status = (error as any).status || (error as any).code;
      const errorCode = error.code;
      if (status !== 406 && errorCode !== 'PGRST116') {
        console.error('Error getting manager name:', error);
      }
      return null;
    }
    return data?.name ?? null;
  } catch (error) {
    console.error('Exception getting manager name:', error);
    return null;
  }
}

export async function listProgramsForManager(managerId: string): Promise<Program[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('talent_manager_id', managerId)
      .order('updated_at', { ascending: false });
    if (error) {
      // Don't log 406 errors (Not Acceptable) - these might happen during logout
      const status = (error as any).status || (error as any).code;
      if (status !== 406) {
        console.error('Error listing programs:', error);
      }
      return [];
    }
    if (!data) return [];
    return data as Program[];
  } catch (error) {
    console.error('Exception listing programs:', error);
    return [];
  }
}

export async function ensureTalentManagerExists(email: string, name?: string): Promise<string | null> {
  if (!supabase) return null;
  
  try {
    // First check if manager already exists
    const existing = await getManagerIdByEmail(email);
    if (existing) return existing;
    
    // If no name provided, derive from email (e.g., "john.doe@example.com" -> "John Doe")
    let managerName = name;
    if (!managerName) {
      const emailPart = email.split('@')[0];
      // Capitalize first letter of each part
      managerName = emailPart
        .split(/[._-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
    }
    
    const { data, error } = await supabase
      .from('talent_managers')
      .insert({
        email,
        name: managerName,
        role: 'talent_manager',
      })
      .select('id')
      .single();
    
    if (error) {
      // Don't log expected errors:
      // - 406: Not Acceptable (might happen during logout)
      // - 23505: Duplicate key (race condition - manager was created by another request)
      const status = (error as any).status || (error as any).code;
      const errorCode = error.code;
      if (status !== 406 && errorCode !== '23505') {
        console.error('Error creating talent manager:', error);
      }
      
      // If duplicate key error, try to fetch the existing manager
      if (errorCode === '23505') {
        const existing = await getManagerIdByEmail(email);
        return existing;
      }
      
      return null;
    }
    
    return data?.id ?? null;
  } catch (error) {
    console.error('Exception creating talent manager:', error);
    return null;
  }
}

export async function deleteProgramByTraineeEmail(traineeEmail: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    // First get the program ID to delete training days
    const { data: program, error: fetchError } = await supabase
      .from('programs')
      .select('id')
      .eq('trainee_email', traineeEmail)
      .single();

    if (fetchError || !program) {
      console.error('Error fetching program for deletion:', fetchError);
      return false;
    }

    // Delete training days first (though CASCADE should handle this)
    const { error: daysError } = await supabase
      .from('training_days')
      .delete()
      .eq('program_id', program.id);

    if (daysError) {
      console.error('Error deleting training days:', daysError);
      // Continue with program deletion even if days deletion fails
    }

    // Delete the program
    const { error: deleteError } = await supabase
      .from('programs')
      .delete()
      .eq('trainee_email', traineeEmail);

    if (deleteError) {
      console.error('Error deleting program:', deleteError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting program:', error);
    return false;
  }
}
