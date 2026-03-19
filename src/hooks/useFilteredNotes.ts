import { useMemo } from 'react';
import { useBoardContext } from '../context/BoardContext';
import { selectFilteredNotes } from '../context/boardSelectors';
import { useNotes } from './useNotes';
import type { StickyNote } from '../types';

/**
 * Combines server data (TanStack Query) with UI filters/sort (Context).
 * Returns the filtered and sorted note list ready for rendering.
 */
export function useFilteredNotes(): {
  notes: StickyNote[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
} {
  const { state } = useBoardContext();
  const { data, isLoading, isError, error } = useNotes();

  const notes = useMemo(
    () => selectFilteredNotes(data ?? [], state.filters, state.sort),
    [data, state.filters, state.sort]
  );

  return { notes, isLoading, isError, error: error ?? null };
}
