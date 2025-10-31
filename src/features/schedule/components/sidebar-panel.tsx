import React, { useEffect, useMemo, useState } from 'react';
import { MODALITY_OPTIONS } from '../../../types/schedule';
import type { DayFields, Modality } from '../../../types/schedule';

type Props = {
  open: boolean;
  selectionCount: number;
  initial?: DayFields;
  onClose: () => void;
  onApply: (values: Partial<DayFields>) => void;
  onLoadTemplate?: (fields: DayFields) => void;
};

const MAX = {
  subject: 20,
  trainer: 60,
  shortDescription: 280,
  notes: 500,
  customLocation: 100,
};

export const SidebarPanel: React.FC<Props> = ({ open, selectionCount, initial, onClose, onApply, onLoadTemplate }) => {
  const [subject, setSubject] = useState('');
  const [modality, setModality] = useState<Modality>('');
  const [trainer, setTrainer] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [customLocation, setCustomLocation] = useState('');

  useEffect(() => {
    if (open && initial) {
      setSubject(initial.subject ?? '');
      setModality(initial.modality ?? '');
      setTrainer(initial.trainer ?? '');
      setShortDescription(initial.shortDescription ?? '');
      setNotes(initial.notes ?? '');
      setCustomLocation(initial.customLocation ?? '');
    }
  }, [open, initial]);

  const showCustom = modality === 'Custom';
  const disabled = selectionCount === 0;

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    // Required only when applying to a single day OR when user filled value for bulk
    if (subject && subject.length > MAX.subject) e.subject = 'Max 20 tekens';
    if (trainer && trainer.length > MAX.trainer) e.trainer = 'Max 60 tekens';
    if (shortDescription && shortDescription.length > MAX.shortDescription) e.shortDescription = 'Max 280 tekens';
    if (notes && notes.length > MAX.notes) e.notes = 'Max 500 tekens';
    if (showCustom && customLocation && customLocation.length > MAX.customLocation) e.customLocation = 'Max 100 tekens';
    return e;
  }, [subject, trainer, shortDescription, notes, showCustom, customLocation]);

  const handleApply = () => {
    if (Object.keys(errors).length) return;
    const payload: Partial<DayFields> = {
      subject: subject || undefined,
      modality: modality || undefined,
      trainer: trainer || undefined,
      shortDescription: shortDescription || undefined,
      notes: notes || undefined,
      customLocation: showCustom ? (customLocation || '') : undefined,
    };
    onApply(payload);
  };

  if (!open) return null;
  return (
    <aside className="fixed top-0 right-0 h-full w-full max-w-md z-40 bg-black border-l border-white/10 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="heading-lg">{selectionCount} dag(en) geselecteerd</h2>
        <button className="btn btn-ghost" onClick={onClose}>Sluiten</button>
      </div>
      <div className="stack">
        <label className="col">
          <span className="eyebrow">Onderwerp (verplicht, max 20)</span>
          <input className="bg-black text-white border border-white/20 rounded-md p-2" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={MAX.subject} placeholder="Onderwerp" />
          {errors.subject && <span className="text-red-400 text-sm">{errors.subject}</span>}
        </label>

        <label className="col">
          <span className="eyebrow">Modus (verplicht)</span>
          <select className="bg-black text-white border border-white/20 rounded-md p-2" value={modality} onChange={(e) => setModality(e.target.value as Modality)}>
            {MODALITY_OPTIONS.map((m) => (
              <option key={m} value={m}>{m || 'Kies modus'}</option>
            ))}
          </select>
        </label>

        {showCustom && (
          <label className="col">
            <span className="eyebrow">Locatie (verplicht bij Custom, max 100)</span>
            <input className="bg-black text-white border border-white/20 rounded-md p-2" value={customLocation} onChange={(e) => setCustomLocation(e.target.value)} maxLength={MAX.customLocation} placeholder="Bijv. Createment, Eindhoven of Google Maps URL" />
            {errors.customLocation && <span className="text-red-400 text-sm">{errors.customLocation}</span>}
          </label>
        )}

        <label className="col">
          <span className="eyebrow">Trainer (verplicht, max 60)</span>
          <input className="bg-black text-white border border-white/20 rounded-md p-2" value={trainer} onChange={(e) => setTrainer(e.target.value)} maxLength={MAX.trainer} placeholder="Naam trainer" />
          {errors.trainer && <span className="text-red-400 text-sm">{errors.trainer}</span>}
        </label>

        <label className="col">
          <span className="eyebrow">Korte beschrijving (optioneel, max 280)</span>
          <textarea className="bg-black text-white border border-white/20 rounded-md p-2" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={MAX.shortDescription} placeholder="Korte beschrijving" />
          {errors.shortDescription && <span className="text-red-400 text-sm">{errors.shortDescription}</span>}
        </label>

        <label className="col">
          <span className="eyebrow">Notities (optioneel, max 500)</span>
          <textarea className="bg-black text-white border border-white/20 rounded-md p-2" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={MAX.notes} placeholder="Notities" />
          {errors.notes && <span className="text-red-400 text-sm">{errors.notes}</span>}
        </label>

        {onLoadTemplate && (
          <button
            className="btn btn-ghost w-full"
            onClick={() => {
              // Open templates manager - will be handled by parent
              const currentFields: DayFields = {
                subject,
                modality,
                trainer,
                shortDescription: shortDescription || undefined,
                notes: notes || undefined,
                customLocation: showCustom ? customLocation : undefined,
              };
              onLoadTemplate(currentFields);
            }}
          >
            Templates beheren
          </button>
        )}
        <div className="cta-bar pt-8">
          <button className="btn btn-primary" disabled={disabled} onClick={handleApply}>Toepassen</button>
          <button className="btn btn-ghost" onClick={onClose}>Annuleren</button>
        </div>
      </div>
    </aside>
  );
};


