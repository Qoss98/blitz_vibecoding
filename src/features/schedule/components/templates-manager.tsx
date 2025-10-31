import React, { useEffect, useState } from 'react';
import { loadTemplates, saveTemplate, deleteTemplate, templateToDayFields } from '../../../lib/supabase/templates';
import type { TrainingTemplate } from '../../../types/database';
import type { DayFields } from '../../../types/schedule';
import { Modal } from '../../../components/modal';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (fields: DayFields) => void;
  fieldsToSave?: DayFields | null; // Fields to save as template (set by parent)
  currentTalentManagerId?: string;
};

export const TemplatesManager: React.FC<Props> = ({
  open,
  onClose,
  onSelectTemplate,
  fieldsToSave,
  currentTalentManagerId,
}) => {
  const [templates, setTemplates] = useState<TrainingTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    if (open) {
      loadTemplatesList();
      if (fieldsToSave) {
        setTemplateName(''); // Reset name when opening with fields to save
      }
    }
  }, [open, currentTalentManagerId, fieldsToSave]);

  const loadTemplatesList = async () => {
    setIsLoading(true);
    const loaded = await loadTemplates(currentTalentManagerId);
    setTemplates(loaded);
    setIsLoading(false);
  };

  const handleSelect = (template: TrainingTemplate) => {
    const fields = templateToDayFields(template);
    onSelectTemplate(fields);
    onClose();
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Weet je zeker dat je deze template wilt verwijderen?')) return;
    const success = await deleteTemplate(templateId);
    if (success) {
      await loadTemplatesList();
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim() || !fieldsToSave) return;
    await saveTemplate(templateName.trim(), fieldsToSave, currentTalentManagerId);
    setTemplateName('');
    await loadTemplatesList();
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      title="Training Templates"
      onClose={onClose}
      actions={
        <button className="btn btn-ghost" onClick={onClose}>Sluiten</button>
      }
    >
      <div className="space-y-4">
        {/* Save current selection as template */}
        {fieldsToSave && (
          <div className="card p-4 mb-4">
            <h3 className="font-semibold mb-2">Opslaan als template</h3>
            <div className="col">
              <input
                className="bg-black text-white border border-white/20 rounded-md p-2"
                placeholder="Template naam"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <div className="row gap-2 mt-2">
                <button
                  className="btn btn-primary"
                  onClick={handleSaveAsTemplate}
                  disabled={!templateName.trim()}
                >
                  Opslaan
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setTemplateName('');
                    onClose();
                  }}
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates list */}
        {isLoading ? (
          <div>Laden...</div>
        ) : templates.length === 0 ? (
          <div className="text-gray-400">Geen templates beschikbaar</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {templates.map((template) => (
              <div key={template.id} className="card p-3 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold">{template.name}</div>
                  <div className="text-sm text-gray-300">
                    {template.subject} • {template.modality} • {template.trainer}
                  </div>
                </div>
                <div className="row gap-2">
                  <button
                    className="btn btn-ghost text-sm"
                    onClick={() => handleSelect(template)}
                  >
                    Gebruiken
                  </button>
                  <button
                    className="btn btn-ghost text-sm text-red-400"
                    onClick={() => handleDelete(template.id)}
                  >
                    Verwijderen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

