import type { ScheduleState } from '../types/schedule';

const KEY = 'training-program-schedule-v1';

export function loadSchedule(): ScheduleState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ScheduleState;
  } catch {
    return null;
  }
}

export function saveSchedule(state: ScheduleState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

