import type { BoardState, StickyNote, FilterState } from '../types';

/** Returns all unique authors from an array of notes. */
export function selectAllAuthors(notes: StickyNote[]): string[] {
  return Array.from(new Set(notes.map((n) => n.author))).sort();
}

/**
 * Applies active author + color filters and sort to a notes array.
 * Receives notes separately because TanStack Query owns that data.
 */
export function selectFilteredNotes(
  notes: StickyNote[],
  filters: FilterState,
  sort: BoardState['sort']
): StickyNote[] {
  let result = notes;

  if (filters.authors.length > 0) {
    result = result.filter((n) => filters.authors.includes(n.author));
  }

  if (filters.colors.length > 0) {
    result = result.filter((n) => filters.colors.includes(n.color));
  }

  return sortNotes(result, sort);
}

/** Returns true if any filter is currently active. */
export function selectHasActiveFilters(state: BoardState): boolean {
  return state.filters.authors.length > 0 || state.filters.colors.length > 0;
}

function sortNotes(notes: StickyNote[], sort: BoardState['sort']): StickyNote[] {
  const copy = [...notes];
  switch (sort) {
    case 'newest':
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'oldest':
      return copy.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case 'position-x':
      return copy.sort((a, b) => a.x - b.x);
    case 'position-y':
      return copy.sort((a, b) => a.y - b.y);
    default:
      return copy;
  }
}
