import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { DEFAULT_TIME_LABEL } from '../../../types/schedule';
import type { ScheduleState, TrainingDay } from '../../../types/schedule';
import type { DayFields } from '../../../types/schedule';
import { computeEndDate, eachDayInclusive, firstMondayOfMonth, formatDateNL, isWeekend, toIsoDate } from '../../../utils/date';
import { loadSchedule, saveSchedule } from '../../../lib/storage';
import { prefetchHolidaysForRange, fetchDutchHolidays, isHoliday, getHolidayName } from '../../../utils/holidays';
import { WeekGrid } from '../components/week-grid';
import { SidebarPanel } from '../components/sidebar-panel';
import { TemplatesManager } from '../components/templates-manager';
import { Modal } from '../../../components/modal';
import { useAuth } from '../../auth/containers/auth-provider';
import { getManagerNameByEmail, deleteProgramByTraineeEmail } from '../../../dal/programs';

async function buildInitialDays(start: Date): Promise<TrainingDay[]> {
  const startMonday = firstMondayOfMonth(start);
  const end = computeEndDate(startMonday);
  
  // Fetch holidays for the date range
  await prefetchHolidaysForRange(startMonday, end);
  const year = startMonday.getFullYear();
  const holidays = await fetchDutchHolidays(year);
  if (end.getFullYear() !== year) {
    const nextYearHolidays = await fetchDutchHolidays(end.getFullYear());
    holidays.push(...nextYearHolidays);
  }
  
  const days = eachDayInclusive(startMonday, end).map((d) => {
    const iso = toIsoDate(d);
    const weekend = isWeekend(d);
    const holiday = !weekend && isHoliday(d, holidays);
    const holidayName = holiday ? getHolidayName(d, holidays) : undefined;
    return {
      id: iso,
      date: iso,
      isWeekend: weekend || holiday, // Mark holidays as non-training days (weekend-like)
      holidayName: holidayName || undefined,
      fields: (weekend || holiday) ? undefined : undefined,
    } satisfies TrainingDay;
  });
  return days;
}

export const SchedulePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [metaTitle, setMetaTitle] = useState('');
  const [metaTraineeEmail, setMetaTraineeEmail] = useState('');
  const [metaTraineeName, setMetaTraineeName] = useState('');
  const [metaManager, setMetaManager] = useState('');
  const [metaCohort, setMetaCohort] = useState('');
  const [metaRemarks, setMetaRemarks] = useState('');

  const [dateInput, setDateInput] = useState<string>('');

  const [days, setDays] = useState<TrainingDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load schedule on mount
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const isNew = location.pathname === '/schedule/new';
      
      // If it's a new schedule, initialize with empty fields and pre-fill manager name
      if (isNew) {
        // Clear all fields
        setMetaTitle('');
        setMetaTraineeEmail('');
        setMetaTraineeName('');
        setMetaCohort('');
        setMetaRemarks('');
        
        // Pre-fill manager name from logged-in user
        if (user?.email) {
          const managerName = await getManagerNameByEmail(user.email);
          if (managerName) {
            setMetaManager(managerName);
          } else {
            setMetaManager('');
          }
        } else {
          setMetaManager('');
        }
        
        // Initialize with empty days
        const now = new Date();
        const initialDays = await buildInitialDays(now);
        setDays(initialDays);
        setIsLoading(false);
        return;
      }
      
      // Otherwise, try to load existing schedule
      const emailFromUrl = new URLSearchParams(window.location.search).get('traineeEmail');
      const traineeEmail = emailFromUrl || undefined;
      
      if (traineeEmail) {
        setMetaTraineeEmail(traineeEmail);
      }
      
      const loaded = await loadSchedule(traineeEmail);
      if (loaded) {
        setDays(loaded.days);
        setMetaTitle(loaded.meta.title);
        setMetaTraineeEmail(loaded.meta.traineeEmail);
        setMetaTraineeName(loaded.meta.traineeName);
        setMetaManager(loaded.meta.talentManager);
        setMetaCohort(loaded.meta.cohort || '');
        setMetaRemarks(loaded.meta.remarks || '');
      } else {
        // Initialize with empty days if no data found
        const now = new Date();
        const initialDays = await buildInitialDays(now);
        setDays(initialDays);
      }
      setIsLoading(false);
    }
    load();
  }, [location.pathname, user?.email]); // Use location.pathname and user.email as dependencies

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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

  const handleGenerate = async () => {
    if (!dateInput) return;
    setIsLoading(true);
    const inputDate = new Date(dateInput);
    const firstMon = firstMondayOfMonth(inputDate);
    const newDays = await buildInitialDays(firstMon);
    setDays(newDays);
    setSelectedIds([]);
    setIsLoading(false);
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
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templateSaveFields, setTemplateSaveFields] = useState<DayFields | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const openEdit = () => setSidebarOpen(true);

  const applySidebar = (values: Partial<DayFields>) => {
    // Check if any selected day has actual data (not just placeholders/empty)
    const sel = new Set(selectedIds);
    const hasExistingData = days.some((d) => {
      if (!sel.has(d.id) || d.isWeekend) return false;
      const fields = d.fields;
      if (!fields) return false;
      // Check if any required field has actual content (not empty string)
      return Boolean(
        (fields.subject && fields.subject.trim()) ||
        (fields.modality && fields.modality.trim()) ||
        (fields.trainer && fields.trainer.trim())
      );
    });

    setPendingApply(values);
    // Only show confirmation if there's actual data to overwrite
    if (hasExistingData) {
      setConfirmOpen(true);
    } else {
      // No existing data, apply directly without confirmation
      performApplyDirect(values);
    }
  };

  const performApplyDirect = (values: Partial<DayFields>) => {
    if (!values) return;
    const sel = new Set(selectedIds);
    const next = days.map((d) => {
      if (!sel.has(d.id) || d.isWeekend) return d;
      const prev = d.fields ?? ({} as DayFields);
      const merged: DayFields = {
        subject: values.subject !== undefined ? values.subject : prev.subject ?? '',
        modality: values.modality !== undefined ? values.modality : prev.modality ?? '',
        trainer: values.trainer !== undefined ? values.trainer : prev.trainer ?? '',
        shortDescription: values.shortDescription !== undefined ? values.shortDescription : prev.shortDescription,
        notes: values.notes !== undefined ? values.notes : prev.notes,
        customLocation: values.customLocation !== undefined ? values.customLocation : prev.customLocation,
      };
      return { ...d, fields: merged };
    });
    setDays(next);
    setSelectedIds([]); // Deselect all days after applying changes
    setSidebarOpen(false);
  };

  const performApply = () => {
    if (!pendingApply) return;
    performApplyDirect(pendingApply);
    setConfirmOpen(false);
    setPendingApply(null);
  };

  const saveAll = async () => {
    const meta = {
      title: metaTitle,
      traineeEmail: metaTraineeEmail,
      traineeName: metaTraineeName,
      startDate: toIsoDate(startDate),
      endDate: toIsoDate(endDate),
      talentManager: metaManager,
      cohort: metaCohort,
      remarks: metaRemarks || undefined,
    };
    const payload: ScheduleState = { meta, days, selectedIds };
    // Overwrite warning is handled at apply stage; save directly
    await saveSchedule(payload);
    // Show success feedback (optional - can add toast/notification later)
    alert('Programma opgeslagen!');
  };

  const printWeeks = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (!metaTraineeEmail) return;
    
    const success = await deleteProgramByTraineeEmail(metaTraineeEmail);
    if (success) {
      alert('Programma verwijderd!');
      navigate('/plans');
    } else {
      alert('Fout bij verwijderen van programma');
    }
    setDeleteConfirmOpen(false);
  };

  const isNewSchedule = location.pathname === '/schedule/new';
  const hasExistingSchedule = !isNewSchedule && metaTraineeEmail;

  return (
    <main className="container section">
      {/* Print-only PDF export: white, black, table, centered, one week per page, no styling */}
      <div className="print-only-export" style={{ display: 'none' }}>
        {weeks.map((week, idx) => (
          <section key={idx} className="print-week-page" style={{ pageBreakAfter: 'always' }}>
            {/* Print-only header info */}
            <div style={{ 
              textAlign: 'center', 
              margin: '12px 0 60px 0', 
              padding: '20px',
              borderRadius: '8px',
              fontSize: '1.2em', 
              fontWeight: 600,
              background: 'linear-gradient(180deg, #0B35F4 0%, #6B46C1 100%)',
              color: '#FFFFFF',
              fontFamily: 'system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans","Liberation Sans",sans-serif'
            }}>
              <div>Naam trainee: {metaTraineeName || '(onbekend)'}</div>
              <div>Talent manager: {metaManager || '(onbekend)'}</div>
              <div>Titel: {metaTitle || '(onbekend)'}</div>
            </div>
            {/* Printable table, centered on page */}
            <table style={{ background: '#fff', color: '#000', margin: '0 auto', width: '80%', borderCollapse: 'separate', borderSpacing: '0', fontSize: '0.97em', borderRadius: '8px', overflow: 'hidden', border: '4px solid #0B35F4', fontFamily: 'system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans","Liberation Sans",sans-serif' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #0B35F4', borderTop: 'none', borderLeft: 'none', padding: '6px 8px', background: '#0B35F4', color: '#FFFFFF', fontWeight: 600 }}>Datum</th>
                  <th style={{ border: '1px solid #0B35F4', borderTop: 'none', padding: '6px 8px', background: '#0B35F4', color: '#FFFFFF', fontWeight: 600 }}>Modus</th>
                  <th style={{ border: '1px solid #0B35F4', borderTop: 'none', padding: '6px 8px', background: '#0B35F4', color: '#FFFFFF', fontWeight: 600 }}>Trainer</th>
                  <th style={{ border: '1px solid #0B35F4', borderTop: 'none', padding: '6px 8px', background: '#0B35F4', color: '#FFFFFF', fontWeight: 600 }}>Onderwerp</th>
                  <th style={{ border: '1px solid #0B35F4', borderTop: 'none', borderRight: 'none', padding: '6px 8px', background: '#0B35F4', color: '#FFFFFF', fontWeight: 600 }}>Tijd</th>
                </tr>
              </thead>
              <tbody>
                {week.map((day) => (
                  <tr key={day.id} style={day.isWeekend ? { background: '#e9e9e9', color: '#888' } : {}}>
                    <td style={{ border: '1px solid #0B35F4', borderTop: 'none', borderLeft: 'none', padding: '4px 8px', textAlign: 'center' }}>{
                      new Date(day.date).toLocaleDateString('nl-NL', { weekday: 'short', day: '2-digit', month: '2-digit' })
                    }</td>
                    <td style={{ border: '1px solid #0B35F4', borderTop: 'none', padding: '4px 8px' }}>{
                      day.isWeekend ? (day.holidayName || 'Weekend') : (day.fields?.modality === 'Custom' ? day.fields?.customLocation : day.fields?.modality) || '—'
                    }</td>
                    <td style={{ border: '1px solid #0B35F4', borderTop: 'none', padding: '4px 8px' }}>{day.isWeekend ? '' : day.fields?.trainer || '—'}</td>
                    <td style={{ border: '1px solid #0B35F4', borderTop: 'none', padding: '4px 8px' }}>{day.isWeekend ? '' : day.fields?.subject || '—'}</td>
                    <td style={{ 
                      border: '1px solid #0B35F4', 
                      borderTop: 'none', 
                      borderRight: 'none', 
                      padding: '4px 8px' 
                    }}>{day.isWeekend ? '' : '09:00–17:00'}</td>
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
          <div className="row items-center gap-4 mb-2">
            <Link className="btn btn-ghost" to="/plans">
              ← Terug naar Plannen
            </Link>
          </div>
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
              {hasExistingSchedule && (
                <button 
                  className="btn" 
                  onClick={() => setDeleteConfirmOpen(true)}
                  style={{ 
                    background: '#dc2626', 
                    color: '#ffffff',
                    border: '1px solid #dc2626'
                  }}
                >
                  Verwijderen
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Program meta card below start section */}
        <div className="card mb-6">
          <div className="card-body col">
            <span className="eyebrow">Programma</span>
            <input className="bg-black text-white border border-white/20 rounded-md p-2" placeholder="Titel" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
            <input type="email" className="bg-black text-white border border-white/20 rounded-md p-2" placeholder="Trainee e-mail" value={metaTraineeEmail} onChange={(e) => setMetaTraineeEmail(e.target.value)} />
            <input className="bg-black text-white border border-white/20 rounded-md p-2" placeholder="Trainee naam" value={metaTraineeName} onChange={(e) => setMetaTraineeName(e.target.value)} />
            <input className="bg-black text-white border border-white/20 rounded-md p-2" placeholder="Talent manager" value={metaManager} onChange={(e) => setMetaManager(e.target.value)} />
            <input className="bg-black text-white border border-white/20 rounded-md p-2" placeholder="Cohort/Batch" value={metaCohort} onChange={(e) => setMetaCohort(e.target.value)} />
            <textarea className="bg-black text-white border border-white/20 rounded-md p-2" placeholder="Opmerkingen (optioneel)" value={metaRemarks} onChange={(e) => setMetaRemarks(e.target.value)} />
            <div className="text-sm text-gray-300">Tijd: {DEFAULT_TIME_LABEL}</div>
          </div>
        </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-400">Laden...</div>
        </div>
      ) : (
        <div className="space-y-6 print:space-y-0">
          {weeks.map((week, idx) => (
            <section key={idx} className="space-y-2 print:break-after-page">
              <div className="eyebrow">Week {idx + 1}</div>
              <WeekGrid weekDays={week} selectedIds={selectedIds} onToggleSelect={toggleSelect} />
            </section>
          ))}
        </div>
      )}

      <SidebarPanel
        open={sidebarOpen}
        selectionCount={selectedIds.length}
        onClose={() => setSidebarOpen(false)}
        onApply={applySidebar}
        onLoadTemplate={(fields) => {
          setTemplateSaveFields(fields);
          setTemplatesOpen(true);
        }}
      />

      <TemplatesManager
        open={templatesOpen}
        onClose={() => {
          setTemplatesOpen(false);
          setTemplateSaveFields(null);
        }}
        onSelectTemplate={(fields) => {
          // Load template into sidebar form
          const partial: Partial<DayFields> = {
            subject: fields.subject,
            modality: fields.modality,
            trainer: fields.trainer,
            shortDescription: fields.shortDescription,
            notes: fields.notes,
            customLocation: fields.customLocation,
          };
          applySidebar(partial);
        }}
        fieldsToSave={templateSaveFields}
        currentTalentManagerId={metaManager || undefined}
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

        <Modal
          open={deleteConfirmOpen}
          title="Programma verwijderen"
          onClose={() => setDeleteConfirmOpen(false)}
          actions={(
            <>
              <button className="btn btn-ghost" onClick={() => setDeleteConfirmOpen(false)}>Annuleren</button>
              <button 
                className="btn" 
                onClick={handleDelete}
                style={{ 
                  background: '#dc2626', 
                  color: '#ffffff',
                  border: '1px solid #dc2626'
                }}
              >
                Verwijderen
              </button>
            </>
          )}
        >
          <p>Weet je zeker dat je dit programma wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.</p>
          {metaTitle && (
            <p className="text-gray-400 mt-2">Programma: <strong>{metaTitle}</strong></p>
          )}
          {metaTraineeEmail && (
            <p className="text-gray-400">Trainee: <strong>{metaTraineeEmail}</strong></p>
          )}
        </Modal>
      </div>
    </main>
  );
};


