import React, { useCallback } from 'react';
import type { TrainingDay } from '../../../types/schedule';
import { formatDateNL } from '../../../utils/date';

type Props = {
  weekDays: TrainingDay[]; // length 7 if full week range
  selectedIds: string[];
  onToggleSelect: (id: string, withRange: boolean, multi: boolean) => void;
};

export const WeekGrid: React.FC<Props> = ({ weekDays, selectedIds, onToggleSelect }) => {
  const handleClick = useCallback(
    (e: React.MouseEvent, id: string, isWeekend: boolean) => {
      if (isWeekend) return;
      const withRange = e.shiftKey;
      const multi = e.metaKey || e.ctrlKey;
      onToggleSelect(id, withRange, multi);
    },
    [onToggleSelect]
  );

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((d) => {
        const selected = selectedIds.includes(d.id);
        const baseCls = d.isWeekend
          ? 'opacity-60 pointer-events-none bg-neutral-900 text-white'
          : selected
          ? 'border-4 border-blitz shadow-xl'
          : 'border border-transparent';
        return (
          <div
            key={d.id}
            className={`card p-3 min-h-40 ${baseCls}`}
            role="button"
            onClick={(e) => handleClick(e, d.id, d.isWeekend)}
          >
            <div className="text-sm font-semibold mb-2">
              {formatDateNL(new Date(d.date), { weekday: 'short', day: '2-digit', month: '2-digit' })}
            </div>
            {d.isWeekend ? (
              <div className="text-xs text-gray-300">Weekend</div>
            ) : (
              <div className="space-y-1 text-sm">
                <div className="font-semibold truncate">{d.fields?.subject || '—'}</div>
                <div className="text-gray-300">{d.fields?.modality || '—'}</div>
                <div className="text-gray-300 truncate">{d.fields?.trainer || '—'}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};


