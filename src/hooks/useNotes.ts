import { useQuery } from '@tanstack/react-query';
import { fetchNotes } from '../services/api.service';
import type { StickyNote } from '../types';

export const NOTES_QUERY_KEY = ['notes'] as const;

/**
 * Fetches all notes from json-server.
 * Loading and error states are exposed directly from the query result.
 */
export function useNotes() {
  return useQuery<StickyNote[], Error>({
    queryKey: NOTES_QUERY_KEY,
    queryFn: fetchNotes,
  });
}
