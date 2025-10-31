import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ScheduleState, TrainingDay } from '../../../types/schedule';
import { formatDateNL, toIsoDate } from '../../../utils/date';
import { loadSchedule } from '../../../lib/storage';
import { WeekGrid } from '../components/week-grid';
import { Modal } from '../../../components/modal';
import { useAuth } from '../../auth/containers/auth-provider';
import type { DayFields } from '../../../types/schedule';
import { DEFAULT_TIME_LABEL } from '../../../types/schedule';

export const TraineeSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const [metaTitle, setMetaTitle] = useState('');
  const [metaTraineeName, setMetaTraineeName] = useState('');
  const [metaManager, setMetaManager] = useState('');
  const [metaCohort, setMetaCohort] = useState('');
  const [metaRemarks, setMetaRemarks] = useState('');

  const [days, setDays] = useState<TrainingDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<TrainingDay | null>(null);
  const [dayDetailOpen, setDayDetailOpen] = useState(false);

  // Load schedule on mount
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const loaded = await loadSchedule(user?.email);
      if (loaded) {
        setDays(loaded.days);
        setMetaTitle(loaded.meta.title);
        setMetaTraineeName(loaded.meta.traineeName);
        setMetaManager(loaded.meta.talentManager);
        setMetaCohort(loaded.meta.cohort || '');
        setMetaRemarks(loaded.meta.remarks || '');
      }
      setIsLoading(false);
    }
    load();
  }, [user?.email]);

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

  const handleDayDoubleClick = (day: TrainingDay) => {
    setSelectedDay(day);
    setDayDetailOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    }
  };

  const printWeeks = () => {
    window.print();
  };

  return (
    <main className="container section">
      {/* Print-only PDF export */}
      <div className="print-only-export" style={{ display: 'none' }}>
        {weeks.map((week, idx) => (
          <section key={idx} className="print-week-page" style={{ pageBreakAfter: 'always' }}>
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

      <div className="print:hidden">
        <header className="mb-6">
          <div className="row items-center gap-4 mb-2">
            <h1 className="heading-xl">Mijn trainingsprogramma</h1>
            <div className="ml-auto row gap-2">
              <button className="btn btn-ghost" onClick={printWeeks}>Exporteer PDF</button>
              <button className="btn btn-ghost" onClick={handleSignOut}>Uitloggen</button>
            </div>
          </div>
          <p className="lead">{formatDateNL(startDate)} – {formatDateNL(endDate)}</p>
        </header>

        {/* Program meta card */}
        <div className="card mb-6">
          <div className="card-body col">
            <div className="row items-center justify-between mb-2">
              <span className="eyebrow">Programma-informatie</span>
            </div>
            <div className="text-sm space-y-1">
              {metaTitle && <div><strong>Titel:</strong> {metaTitle}</div>}
              {metaTraineeName && <div><strong>Naam:</strong> {metaTraineeName}</div>}
              {metaManager && <div><strong>Talent manager:</strong> {metaManager}</div>}
              {metaCohort && <div><strong>Cohort:</strong> {metaCohort}</div>}
              {metaRemarks && <div className="mt-2"><strong>Opmerkingen:</strong> {metaRemarks}</div>}
              <div className="text-gray-300"><strong>Tijd:</strong> {DEFAULT_TIME_LABEL}</div>
            </div>
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
                <WeekGrid 
                  weekDays={week} 
                  selectedIds={[]} 
                  onToggleSelect={() => {}} 
                  readOnly={true}
                  onDayDoubleClick={handleDayDoubleClick}
                />
              </section>
            ))}
          </div>
        )}

        {/* Day detail modal */}
        {selectedDay && (
          <Modal
            open={dayDetailOpen}
            title={formatDateNL(new Date(selectedDay.date))}
            onClose={() => {
              setDayDetailOpen(false);
              setSelectedDay(null);
            }}
            actions={(
              <button className="btn btn-primary" onClick={() => {
                setDayDetailOpen(false);
                setSelectedDay(null);
              }}>Sluiten</button>
            )}
          >
            <div className="space-y-4">
              <DayField label="Onderwerp" value={selectedDay.fields?.subject} />
              <DayField label="Modus" value={selectedDay.fields?.modality === 'Custom' ? selectedDay.fields?.customLocation : selectedDay.fields?.modality} />
              <DayField label="Trainer" value={selectedDay.fields?.trainer} />
              {selectedDay.fields?.shortDescription && (
                <DayField label="Korte beschrijving" value={selectedDay.fields.shortDescription} multiline />
              )}
              {selectedDay.fields?.notes && (
                <DayField label="Notities" value={selectedDay.fields.notes} multiline />
              )}
            </div>
          </Modal>
        )}
      </div>
    </main>
  );
};

// Helper component for displaying day fields
const DayField: React.FC<{ label: string; value?: string; multiline?: boolean }> = ({ label, value, multiline }) => {
  if (!value) return null;
  return (
    <div>
      <div className="eyebrow text-gray-400">{label}</div>
      {multiline ? (
        <div className="text-white whitespace-pre-wrap">{value}</div>
      ) : (
        <div className="text-white">{value}</div>
      )}
    </div>
  );
};

