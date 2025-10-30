const NL_LOCALE = 'nl-NL';

export function toIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromIsoDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function firstMondayOfMonth(anyDate: Date): Date {
  const d = new Date(anyDate.getFullYear(), anyDate.getMonth(), 1);
  // getDay: 0=Sun, 1=Mon
  const delta = (1 - d.getDay() + 7) % 7; // days to next Monday
  d.setDate(d.getDate() + delta);
  return d;
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const targetMonth = d.getMonth() + months;
  d.setMonth(targetMonth);
  return d;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// End date rule: ends the day BEFORE the same numeric day two months later
export function computeEndDate(startFirstMonday: Date): Date {
  const twoMonthsLater = addMonths(startFirstMonday, 2);
  const end = new Date(twoMonthsLater);
  end.setDate(end.getDate() - 1);
  return end;
}

export function eachDayInclusive(start: Date, end: Date): Date[] {
  const out: Date[] = [];
  const d = new Date(start);
  while (d <= end) {
    out.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export function groupIntoWeeks(dates: Date[]): Date[][] {
  const weeks: Date[][] = [];
  let current: Date[] = [];
  dates.forEach((d) => {
    if (current.length === 0) {
      current.push(d);
    } else {
      const prev = current[current.length - 1];
      const diffDays = (d.getTime() - prev.getTime()) / 86400000;
      if (diffDays === 1) {
        current.push(d);
      } else {
        weeks.push(current);
        current = [d];
      }
    }
  });
  if (current.length) weeks.push(current);
  return weeks;
}

export function formatDateNL(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const fmt = new Intl.DateTimeFormat(NL_LOCALE, options ?? {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });
  return fmt.format(date);
}

