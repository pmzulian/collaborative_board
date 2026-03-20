import type { StickyNote } from '../types';

export interface DayGroup {
  label: string;
  isoDate: string;
  notes: StickyNote[];
}

export function groupNotesByDay(notes: StickyNote[]): DayGroup[] {
  const map = new Map<string, StickyNote[]>();

  for (const note of notes) {
    const isoDate = note.createdAt.slice(0, 10); // "YYYY-MM-DD"
    const existing = map.get(isoDate);
    if (existing) {
      existing.push(note);
    } else {
      map.set(isoDate, [note]);
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([isoDate, notes]) => ({
      isoDate,
      label: formatDayLabel(isoDate),
      notes,
    }));
}

/** Formats Mar 10, 2026 */
export function formatDayLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Formats 9:05 AM */
export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
