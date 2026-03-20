export type NoteColor =
  | 'yellow'
  | 'pink'
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange';

export type SortOption = 'newest' | 'oldest' | 'position-x' | 'position-y';

export interface StickyNote {
  id: string;
  text: string;
  x: number;
  y: number;
  author: string;
  color: NoteColor;
  createdAt: string;
}

export interface FilterState {
  authors: string[];
  colors: NoteColor[];
}

/** UI-only state — notes live in TanStack Query, not here. */
export interface BoardState {
  filters: FilterState;
  sort: SortOption;
  /** IDs of notes created in the last 5 s — drives the "new note" highlight. */
  recentlyAddedIds: string[];
}

export type BoardAction =
  | { type: 'SET_AUTHOR_FILTER'; authors: string[] }
  | { type: 'TOGGLE_AUTHOR'; author: string }
  | { type: 'TOGGLE_COLOR'; color: NoteColor }
  | { type: 'SET_SORT'; sort: SortOption }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'ADD_RECENT_NOTE'; id: string }
  | { type: 'EXPIRE_RECENT_NOTE'; id: string };
