export type PaceStatus = 'ahead' | 'on_track' | 'behind' | 'done' | 'not_started' | 'no_target';

export interface DayTotal { date: string; target: number; achieved: number; percent: number | null; met: boolean; custom?: boolean; offDay?: boolean }

export interface ProductionBoardData {
    date: string;
    isToday: boolean;
    item: string;
    target: number;
    targetNote: string;
    customTarget: boolean;
    achieved: number;
    remaining: number;
    percent: number;
    pace: { expected: number; status: PaceStatus; neededPerHour: number; minutesLeft: number };
    shift: { start: string; end: string };
    hourly: { hour: string; quantity: number; cumulative: number }[];
    lastEntry: { time: string | null; quantity: number; item: string } | null;
    byItem: { item: string; quantity: number }[];
    week: DayTotal[];
    streak: number;
    best: { date: string; achieved: number } | null;
    month: { achieved: number; target: number; daysMet: number; workingDays: number };
    peopleAtWork: number;
    holiday: { name: string; observed: boolean; poya: boolean } | null;
    nextHoliday: { date: string; name: string; poya: boolean; observed: boolean } | null;
    message: string;
    updatedAt: string;
}

export interface ProductionSettings {
    dailyProductionTarget: number;
    productionItem: string;
    productionShiftStart: string;
    productionShiftEnd: string;
    productionBoardMessage: string;
}

/** "2026-10-07" → "Wed 7 Oct" (dates are calendar days, so they are read as UTC). */
export const shortDay = (day: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }) =>
    new Date(`${day}T00:00:00Z`).toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' });
