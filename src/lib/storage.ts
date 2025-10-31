import type { ScheduleState } from '../types/schedule';
import { loadProgramFromSupabase, saveProgramToSupabase } from './supabase/programs';

const KEY = 'training-program-schedule-v1';

// Fallback to localStorage if Supabase is not configured
function loadFromLocalStorage(): ScheduleState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ScheduleState;
  } catch {
    return null;
  }
}

function saveToLocalStorage(state: ScheduleState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

// Main load function - tries Supabase first, falls back to localStorage
export async function loadSchedule(traineeEmail?: string): Promise<ScheduleState | null> {
  if (traineeEmail) {
    // Try Supabase first if email provided
    const supabaseResult = await loadProgramFromSupabase(traineeEmail);
    if (supabaseResult) return supabaseResult;
  }
  // Fallback to localStorage
  return loadFromLocalStorage();
}

// Main save function - tries Supabase first, falls back to localStorage
export async function saveSchedule(state: ScheduleState): Promise<boolean> {
  // Try Supabase first if trainee email exists
  if (state.meta.traineeName) {
    const success = await saveProgramToSupabase(state);
    if (success) {
      // Also save to localStorage as backup
      saveToLocalStorage(state);
      return true;
    }
  }
  // Fallback to localStorage
  saveToLocalStorage(state);
  return true;
}

