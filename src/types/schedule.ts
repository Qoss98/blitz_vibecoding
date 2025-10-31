export type Modality = '' | 'Op locatie' | 'Online' | 'Custom';

export interface DayFields {
  subject: string; // required, max 20
  modality: Modality; // required
  trainer: string; // required, max 60
  shortDescription?: string; // optional, max 280
  notes?: string; // optional, max 500
  customLocation?: string; // required when modality === 'Custom', max 100, URL allowed
}

export interface TrainingDay {
  id: string; // yyyy-MM-dd
  date: string; // ISO date yyyy-MM-dd
  isWeekend: boolean;
  holidayName?: string; // Name of the holiday if this day is a holiday
  fields?: DayFields; // undefined for weekends or unfilled days
}

export interface ProgramMeta {
  title: string;
  traineeEmail: string;
  traineeName: string;
  startDate: string; // ISO date (snapped)
  endDate: string; // ISO date
  talentManager: string;
  cohort: string;
  remarks?: string;
}

export interface ScheduleState {
  meta: ProgramMeta;
  days: TrainingDay[];
  selectedIds: string[]; // set of day ids (weekends excluded)
}

export const DEFAULT_TIME_LABEL = '09:00–17:00 (pauze 12:00–13:00)';

export const MODALITY_OPTIONS: Modality[] = ['', 'Op locatie', 'Online', 'Custom'];

