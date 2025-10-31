import React, { useMemo, useRef, useState } from 'react';
import { DEFAULT_TIME_LABEL } from '../../../types/schedule';
import type { DayFields, ScheduleState, TrainingDay } from '../../../types/schedule';
import { computeEndDate, eachDayInclusive, firstMondayOfMonth, formatDateNL, isWeekend, toIsoDate } from '../../../utils/date';
import { loadSchedule, saveSchedule } from '../../../lib/storage';
import { WeekGrid } from '../components/week-grid';
import { SidebarPanel } from '../components/sidebar-panel';
import { Modal } from '../../../components/modal';

function buildInitialDays(start: Date): TrainingDay[] {
  const startMonday = firstMondayOfMonth(start);
  const end = computeEndDate(startMonday);
  const days = eachDayInclusive(startMonday, end).map((d) => {
    const iso = toIsoDate(d);
    const weekend = isWeekend(d);
    return {
      id: iso,
      date: iso,
      isWeekend: weekend,
      fields: weekend ? undefined : undefined,
    } satisfies TrainingDay;
  });
  return days;
}

export const SchedulePage: React.FC = () => {
  const [metaTitle, setMetaTitle] = useState('');
  const [metaTrainee, setMetaTrainee] = useState('');
  const [metaManager, setMetaManager] = useState('');
  const [metaCohort, setMetaCohort] = useState('');
  const [metaRemarks, setMetaRemarks] = useState('');

  const [dateInput, setDateInput] = useState<string>('');

  const [days, setDays] = useState<TrainingDay[]>(() => {
    const loaded = loadSchedule();
    if (loaded) return loaded.days;
    const now = new Date();
    return buildInitialDays(now);
  });

  const [selectedIds, setSelectedIds] = useState<string[]>(() => loadSchedule()?.selectedIds ?? []);
  const lastSelectedRef = useRef<string | null>(null);

  const startDate = useMemo(() => (days.length ? new Date(days[0].date) : new Date()), [days]);
  const endDate = useMemo(() => (days.length ? new Date(days[days.length - 1].date) : new Date()), [days]);

  const weeks = useMemo(() => {
    const out: TrainingDay[][] = [];
    let buf: TrainingDay[] = [];
    days.forEach((d) => {
      buf.push(d);
      if (buf.length === 7) {
        out.push(buf);
        buf = [];
      }
    });
    if (buf.length) out.push(buf);
    return out;
  }, [days]);

  const handleGenerate = () => {
    if (!dateInput) return;
    const inputDate = new Date(dateInput);
    const firstMon = firstMondayOfMonth(inputDate);
    const newDays = buildInitialDays(firstMon);
    setDays(newDays);
    setSelectedIds([]);
  };

  const toggleSelect = (id: string, withRange: boolean, multi: boolean) => {
    const idx = days.findIndex((d) => d.id === id);
    if (idx === -1) return;
    if (withRange && lastSelectedRef.current) {
      const a = days.findIndex((d) => d.id === lastSelectedRef.current);
      const [lo, hi] = [Math.min(a, idx), Math.max(a, idx)];
      const range = days.slice(lo, hi + 1).filter((d) => !d.isWeekend).map((d) => d.id);
      const set = new Set(multi ? selectedIds : []);
      range.forEach((r) => set.add(r));
      setSelectedIds(Array.from(set));
    } else {
      const set = new Set(selectedIds);
      if (set.has(id)) set.delete(id); else set.add(id);
      setSelectedIds(Array.from(set));
      lastSelectedRef.current = id;
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingApply, setPendingApply] = useState<Partial<DayFields> | null>(null);

  const openEdit = () => setSidebarOpen(true);

  const applySidebar = (values: Partial<DayFields>) => {
    setPendingApply(values);
    setConfirmOpen(true);
  };

  const performApply = () => {
    if (!pendingApply) return;
    const sel = new Set(selectedIds);
    const next = days.map((d) => {
      if (!sel.has(d.id) || d.isWeekend) return d;
      const prev = d.fields ?? ({} as DayFields);
      const merged: DayFields = {
        subject: pendingApply.subject !== undefined ? pendingApply.subject : prev.subject ?? '',
        modality: pendingApply.modality !== undefined ? pendingApply.modality : prev.modality ?? '',
        trainer: pendingApply.trainer !== undefined ? pendingApply.trainer : prev.trainer ?? '',
        shortDescription: pendingApply.shortDescription !== undefined ? pendingApply.shortDescription : prev.shortDescription,
        notes: pendingApply.notes !== undefined ? pendingApply.notes : prev.notes,
        customLocation: pendingApply.customLocation !== undefined ? pendingApply.customLocation : prev.customLocation,
      };
      return { ...d, fields: merged };
    });
    setDays(next);
    setConfirmOpen(false);
    setPendingApply(null);
    setSidebarOpen(false);
  };

  const saveAll = () => {
    const meta = {
      title: metaTitle,
      traineeName: metaTrainee,
      startDate: toIsoDate(startDate),
      endDate: toIsoDate(endDate),
      talentManager: metaManager,
      cohort: metaCohort,
      remarks: metaRemarks || undefined,
    };
    const payload: ScheduleState = { meta, days, selectedIds };
    // Overwrite warning is handled at apply stage; save directly
    saveSchedule(payload);
  };

  const printWeeks = () => {
    window.print();
  };

  return (
    <main className="container section">
      {/* Print-only PDF export: white, black, table, centered, one week per page, no styling */}
      <div className="print-only-export" style={{ display: 'none' }}>
        {weeks.map((week, idx) => (
          <section key={idx} className="print-week-page" style={{ pageBreakAfter: 'always' }}>
            {/* Print-only header info */}
            <div style={{ textAlign: 'center', margin: '12px 0', fontSize: '1.2em', fontWeight: 600 }}>
              <div>Naam trainee: {metaTrainee || '(onbekend)'}</div>
              <div>Talent manager: {metaManager || '(onbekend)'}</div>
              <div>Titel: {metaTitle || '(onbekend)'}</div>
            </div>
            {/* Printable table, centered on page */}
            <table style={{ background: '#fff', color: '#000', margin: '0 auto', width: '80%', borderCollapse: 'collapse', fontSize: '0.97em' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '6px 8px' }}>Datum</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px' }}>Modus</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px' }}>Trainer</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px' }}>Onderwerp</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px' }}>Tijd</th>
                </tr>
              </thead>
              <tbody>
                {week.map((day, colIdx) => (
                  <tr key={day.id} style={day.isWeekend ? { background: '#e9e9e9', color: '#888' } : {}}>
                    <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'center' }}>{
                      new Date(day.date).toLocaleDateString('nl-NL', { weekday: 'short', day: '2-digit', month: '2-digit' })
                    }</td>
                    <td style={{ border: '1px solid #000', padding: '4px 8px' }}>{
                      day.isWeekend ? 'Weekend' : (day.fields?.modality === 'Custom' ? day.fields?.customLocation : day.fields?.modality) || '—'
                    }</td>
                    <td style={{ border: '1px solid #000', padding: '4px 8px' }}>{day.isWeekend ? '' : day.fields?.trainer || '—'}</td>
                    <td style={{ border: '1px solid #000', padding: '4px 8px' }}>{day.isWeekend ? '' : day.fields?.subject || '—'}</td>
                    <td style={{ border: '1px solid #000', padding: '4px 8px' }}>{day.isWeekend ? '' : '09:00–17:00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
      {/* Everything below this (in main) hidden on print! */}
      <div className="print:hidden">
        <header className="mb-6">
          <h1 className="heading-xl mb-2">Trainingsprogramma</h1>
          <p className="lead">{formatDateNL(startDate)} – {formatDateNL(endDate)}</p>
        </header>

        {/* Start date and actions section */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row wrap gap-4 items-end">
              <label className="col">
                <span className="eyebrow">Startdatum (snapt naar eerste maandag)</span>
                <input type="date" className="bg-black text-white border border-white/20 rounded-md p-2" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
              </label>
              <button className="btn btn-primary" onClick={handleGenerate}>Genereer</button>

              <button className="btn btn-ghost" onClick={openEdit} disabled={selectedIds.length === 0}>Bewerken ({selectedIds.length})</button>
              <button className="btn btn-ghost" onClick={printWeeks}>Exporteer PDF</button>
              <button className="btn btn-primary" onClick={saveAll}>Opslaan</button>
            </div>
          </div>
        </div>
        {/* Program meta card below start section */}
        <div className="card mb-6">
          <div className="card-body col">
            <span className="eyebrow">Programma</span>
            <input className="bg-black text-white border border-white/20 rounded-md p-2" placeholder="Titel" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
            <input className="bg-black text-white border border-white/20 rounded-md p-2" placeholder="Trainee naam" value={metaTrainee} onChange={(e) => setMetaTrainee(e.target.value)} />
            <input className="bg-black text-white border border-white/20 rounded-md p-2" placeholder="Talent manager" value={metaManager} onChange={(e) => setMetaManager(e.target.value)} />
            <input className="bg-black text-white border border-white/20 rounded-md p-2" placeholder="Cohort/Batch" value={metaCohort} onChange={(e) => setMetaCohort(e.target.value)} />
            <textarea className="bg-black text-white border border-white/20 rounded-md p-2" placeholder="Opmerkingen (optioneel)" value={metaRemarks} onChange={(e) => setMetaRemarks(e.target.value)} />
            <div className="text-sm text-gray-300">Tijd: {DEFAULT_TIME_LABEL}</div>
          </div>
        </div>

        <div className="space-y-6 print:space-y-0">
          {weeks.map((week, idx) => (
            <section key={idx} className="space-y-2 print:break-after-page">
              <div className="eyebrow">Week {idx + 1}</div>
              <WeekGrid weekDays={week} selectedIds={selectedIds} onToggleSelect={toggleSelect} />
            </section>
          ))}
        </div>

        <SidebarPanel
          open={sidebarOpen}
          selectionCount={selectedIds.length}
          onClose={() => setSidebarOpen(false)}
          onApply={applySidebar}
        />

        <Modal
          open={confirmOpen}
          title="Bevestig overschrijven"
          onClose={() => setConfirmOpen(false)}
          actions={(
            <>
              <button className="btn btn-ghost" onClick={() => setConfirmOpen(false)}>Annuleren</button>
              <button className="btn btn-primary" onClick={performApply}>Bevestigen</button>
            </>
          )}
        >
          <p>Je staat op het punt gegevens van geselecteerde dagen te overschrijven. Weet je het zeker?</p>
        </Modal>
      </div>
    </main>
  );
};


