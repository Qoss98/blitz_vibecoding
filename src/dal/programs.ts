import { supabase } from '@/lib/supabase/client';
import type { Program } from '@/types/database';

export async function getManagerIdByEmail(email: string): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('talent_managers')
      .select('id')
      .eq('email', email)
      .single();
    if (error) {
      // Don't log 406 errors (Not Acceptable) - these might happen during logout
      const status = (error as any).status || (error as any).code;
      if (status !== 406) {
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
      .single();
    if (error) {
      // Don't log 406 errors (Not Acceptable) - these might happen during logout
      const status = (error as any).status || (error as any).code;
      if (status !== 406) {
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
