import type { NoteColor } from '../types';

export const NOTE_COLOR_VAR: Record<NoteColor, string> = {
  yellow: 'var(--color-note-yellow)',
  pink:   'var(--color-note-pink)',
  blue:   'var(--color-note-blue)',
  green:  'var(--color-note-green)',
  purple: 'var(--color-note-purple)',
  orange: 'var(--color-note-orange)',
} as const;

export const NOTE_COLORS = [
  'yellow', 'pink', 'blue', 'green', 'purple', 'orange',
] as const satisfies readonly NoteColor[];
