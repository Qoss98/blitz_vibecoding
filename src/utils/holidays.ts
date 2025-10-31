// Free API: https://date.nager.at - supports Netherlands holidays
const HOLIDAYS_API_BASE = 'https://date.nager.at/api/v3';

interface Holiday {
  date: string; // ISO date format
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

// Cache holidays by year to avoid repeated API calls
const holidaysCache = new Map<number, Holiday[]>();

export async function fetchDutchHolidays(year: number): Promise<Holiday[]> {
  // Check cache first
  if (holidaysCache.has(year)) {
    return holidaysCache.get(year)!;
  }

  try {
    const response = await fetch(`${HOLIDAYS_API_BASE}/PublicHolidays/${year}/NL`);
    if (!response.ok) {
      throw new Error(`Failed to fetch holidays: ${response.statusText}`);
    }
    const holidays: Holiday[] = await response.json();
    holidaysCache.set(year, holidays);
    return holidays;
  } catch (error) {
    console.error('Error fetching holidays:', error);
    // Return empty array on error (don't block the app)
    return [];
  }
}

export function isHoliday(date: Date, holidays: Holiday[]): boolean {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return holidays.some((h) => h.date === dateStr);
}

// Pre-fetch holidays for a date range (useful when generating schedules)
export async function prefetchHolidaysForRange(startDate: Date, endDate: Date): Promise<void> {
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  const promises: Promise<void>[] = [];
  for (let year = startYear; year <= endYear; year++) {
    if (!holidaysCache.has(year)) {
      promises.push(fetchDutchHolidays(year).then(() => {}));
    }
  }

  await Promise.all(promises);
}

