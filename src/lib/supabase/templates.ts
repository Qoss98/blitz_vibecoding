import { supabase } from './client';
import type { TrainingTemplate, TrainingTemplateInsert } from '../../types/database';
import type { DayFields } from '../../types/schedule';

// Load all templates (optionally filtered by creator)
export async function loadTemplates(createdById?: string): Promise<TrainingTemplate[]> {
  if (!supabase) return [];
  try {
    // Resolve talent manager id by name (if provided)
    let managerId: string | null = null;
    if (createdById && createdById.trim()) {
      const { data: mgr } = await supabase
        .from('talent_managers')
        .select('id')
        .eq('name', createdById.trim())
        .single();
      managerId = mgr?.id ?? null;
    }

    let query = supabase.from('training_templates').select('*').order('name', { ascending: true });
    
    if (managerId) {
      query = query.eq('created_by', managerId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading templates:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error loading templates:', error);
    return [];
  }
}

// Save a template
export async function saveTemplate(
  name: string,
  fields: DayFields,
  createdById?: string
): Promise<TrainingTemplate | null> {
  if (!supabase) return null;
  try {
    // Resolve talent manager id by name (if provided)
    let managerId: string | null = null;
    if (createdById && createdById.trim()) {
      const { data: mgr } = await supabase
        .from('talent_managers')
        .select('id')
        .eq('name', createdById.trim())
        .single();
      managerId = mgr?.id ?? null;
    }

    const templateInsert: TrainingTemplateInsert = {
      name,
      subject: fields.subject || null,
      modality: fields.modality || null,
      trainer: fields.trainer || null,
      short_description: fields.shortDescription || null,
      notes: fields.notes || null,
      custom_location: fields.customLocation || null,
      created_by: managerId,
    };

    const { data, error } = await supabase
      .from('training_templates')
      .insert(templateInsert)
      .select()
      .single();

    if (error) {
      console.error('Error saving template:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error saving template:', error);
    return null;
  }
}

// Delete a template
export async function deleteTemplate(templateId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('training_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      console.error('Error deleting template:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting template:', error);
    return false;
  }
}

// Convert template to DayFields
export function templateToDayFields(template: TrainingTemplate): DayFields {
  return {
    subject: template.subject || '',
    modality: (template.modality || '') as DayFields['modality'],
    trainer: template.trainer || '',
    shortDescription: template.short_description || undefined,
    notes: template.notes || undefined,
    customLocation: template.custom_location || undefined,
  };
}

