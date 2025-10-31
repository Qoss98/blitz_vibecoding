import { supabase } from './client';
import type { Program, ProgramInsert, TrainingDay, TrainingDayInsert, TalentManager } from '../../types/database';
import type { DayFields, ScheduleState } from '../../types/schedule';
import { toIsoDate } from '../../utils/date';

// Convert database TrainingDay to app TrainingDay
function dbDayToAppDay(dbDay: TrainingDay, dateStr: string): import('../../types/schedule').TrainingDay {
  return {
    id: dateStr,
    date: dateStr,
    isWeekend: dbDay.is_weekend,
    fields: dbDay.is_weekend ? undefined : (dbDay.subject || dbDay.modality || dbDay.trainer ? {
      subject: dbDay.subject || '',
      modality: (dbDay.modality || '') as DayFields['modality'],
      trainer: dbDay.trainer || '',
      shortDescription: dbDay.short_description || undefined,
      notes: dbDay.notes || undefined,
      customLocation: dbDay.custom_location || undefined,
    } : undefined),
  };
}

// Convert app DayFields to database TrainingDayInsert
function appFieldsToDbDay(programId: string, dateStr: string, isWeekend: boolean, fields?: DayFields): TrainingDayInsert {
  return {
    program_id: programId,
    date: dateStr,
    is_weekend: isWeekend,
    subject: fields?.subject || null,
    modality: fields?.modality || null,
    trainer: fields?.trainer || null,
    short_description: fields?.shortDescription || null,
    notes: fields?.notes || null,
    custom_location: fields?.customLocation || null,
  };
}

// Load a program with all its days from Supabase
export async function loadProgramFromSupabase(traineeEmail: string): Promise<ScheduleState | null> {
  if (!supabase) return null;
  try {
    // Fetch program
    const { data: program, error: programError } = await supabase
      .from('programs')
      .select('*')
      .eq('trainee_email', traineeEmail)
      .single();

    if (programError || !program) {
      return null;
    }

    // Fetch all training days for this program
    const { data: days, error: daysError } = await supabase
      .from('training_days')
      .select('*')
      .eq('program_id', program.id)
      .order('date', { ascending: true });

    if (daysError) {
      console.error('Error loading days:', daysError);
      return null;
    }

    // Optionally load manager name
    let managerName = '';
    if (program.talent_manager_id) {
      const { data: manager } = await supabase
        .from('talent_managers')
        .select('name')
        .eq('id', program.talent_manager_id)
        .single();
      managerName = manager?.name ?? '';
    }

    // Convert to app format
    const appDays = days.map((d) => dbDayToAppDay(d, d.date));

    return {
      meta: {
        title: program.title,
        traineeName: program.trainee_email,
        startDate: program.start_date,
        endDate: program.end_date,
        talentManager: managerName,
        cohort: program.cohort || '',
        remarks: program.remarks || undefined,
      },
      days: appDays,
      selectedIds: [],
    };
  } catch (error) {
    console.error('Error loading program:', error);
    return null;
  }
}

// Save a program and its days to Supabase
export async function saveProgramToSupabase(state: ScheduleState): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { meta, days } = state;

    // Resolve talent manager id by name (optional)
    let managerId: string | null = null;
    if (meta.talentManager && meta.talentManager.trim()) {
      const { data: mgr } = await supabase
        .from('talent_managers')
        .select('id')
        .eq('name', meta.talentManager.trim())
        .single();
      managerId = mgr?.id ?? null;
    }

    // Check if program already exists
    const { data: existingProgram } = await supabase
      .from('programs')
      .select('id')
      .eq('trainee_email', meta.traineeName)
      .single();

    let programId: string;

    if (existingProgram) {
      // Update existing program
      const { data: updatedProgram, error: updateError } = await supabase
        .from('programs')
        .update({
          title: meta.title,
          start_date: meta.startDate,
          end_date: meta.endDate,
          talent_manager_id: managerId,
          cohort: meta.cohort || null,
          remarks: meta.remarks || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProgram.id)
        .select('id')
        .single();

      if (updateError || !updatedProgram) {
        console.error('Error updating program:', updateError);
        return false;
      }
      programId = updatedProgram.id;

      // Delete existing days to replace them
      await supabase
        .from('training_days')
        .delete()
        .eq('program_id', programId);
    } else {
      // Create new program
      const programInsert: ProgramInsert = {
        trainee_email: meta.traineeName,
        title: meta.title,
        start_date: meta.startDate,
        end_date: meta.endDate,
        talent_manager_id: managerId,
        cohort: meta.cohort || null,
        remarks: meta.remarks || null,
      };

      const { data: newProgram, error: insertError } = await supabase
        .from('programs')
        .insert(programInsert)
        .select('id')
        .single();

      if (insertError || !newProgram) {
        console.error('Error creating program:', insertError);
        return false;
      }
      programId = newProgram.id;
    }

    // Insert/update all days
    if (days.length > 0) {
      const daysToInsert: TrainingDayInsert[] = days.map((d) =>
        appFieldsToDbDay(programId, d.date, d.isWeekend, d.fields)
      );

      const { error: daysError } = await supabase
        .from('training_days')
        .insert(daysToInsert);

      if (daysError) {
        console.error('Error inserting days:', daysError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error saving program:', error);
    return false;
  }
}

