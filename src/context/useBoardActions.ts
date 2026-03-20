import { useCallback } from 'react';
import { useBoardContext } from './BoardContext';
import type { NoteColor, SortOption } from '../types';

const HIGHLIGHT_DURATION_MS = 30_000;

/** Provides stable, memoized action dispatchers for board interactions. */
export function useBoardActions() {
  const { dispatch } = useBoardContext();

  const toggleAuthor = useCallback(
    (author: string) => dispatch({ type: 'TOGGLE_AUTHOR', author }),
    [dispatch]
  );

  const toggleColor = useCallback(
    (color: NoteColor) => dispatch({ type: 'TOGGLE_COLOR', color }),
    [dispatch]
  );

  const setSort = useCallback(
    (sort: SortOption) => dispatch({ type: 'SET_SORT', sort }),
    [dispatch]
  );

  const clearFilters = useCallback(
    () => dispatch({ type: 'CLEAR_FILTERS' }),
    [dispatch]
  );

  const markNoteAsRecent = useCallback(
    (id: string) => {
      dispatch({ type: 'ADD_RECENT_NOTE', id });
      setTimeout(() => dispatch({ type: 'EXPIRE_RECENT_NOTE', id }), HIGHLIGHT_DURATION_MS);
    },
    [dispatch]
  );

  return { toggleAuthor, toggleColor, setSort, clearFilters, markNoteAsRecent };
}
