// Database table types (matching Supabase schema)
export interface TalentManager {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  trainee_email: string;
  title: string;
  talent_manager_id: string | null;
  cohort: string | null;
  remarks: string | null;
  start_date: string; // ISO date
  end_date: string; // ISO date
  created_at: string;
  updated_at: string;
}

export interface TrainingDay {
  id: string;
  program_id: string;
  date: string; // ISO date
  is_weekend: boolean;
  subject: string | null;
  modality: '' | 'Op locatie' | 'Online' | 'Custom' | null;
  trainer: string | null;
  short_description: string | null;
  notes: string | null;
  custom_location: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingTemplate {
  id: string;
  name: string;
  subject: string | null;
  modality: '' | 'Op locatie' | 'Online' | 'Custom' | null;
  trainer: string | null;
  short_description: string | null;
  notes: string | null;
  custom_location: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Insert types (for creating new records)
export type ProgramInsert = Omit<Program, 'id' | 'created_at' | 'updated_at'>;
export type TrainingDayInsert = Omit<TrainingDay, 'id' | 'created_at' | 'updated_at'>;
export type TrainingTemplateInsert = Omit<TrainingTemplate, 'id' | 'created_at' | 'updated_at'>;
export type TalentManagerInsert = Omit<TalentManager, 'id' | 'created_at' | 'updated_at'>;

