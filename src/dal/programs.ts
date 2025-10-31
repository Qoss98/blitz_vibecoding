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
