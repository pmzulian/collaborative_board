import type { BoardState, BoardAction, NoteColor } from '../types';

export const initialState: BoardState = {
  filters: {
    authors: [],
    colors: [],
  },
  sort: 'newest',
  recentlyAddedIds: [],
};

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'SET_AUTHOR_FILTER':
      return {
        ...state,
        filters: { ...state.filters, authors: action.authors },
      };

    case 'TOGGLE_AUTHOR': {
      const authors = state.filters.authors.includes(action.author)
        ? state.filters.authors.filter((a) => a !== action.author)
        : [...state.filters.authors, action.author];
      return { ...state, filters: { ...state.filters, authors } };
    }

    case 'TOGGLE_COLOR': {
      const colors = state.filters.colors.includes(action.color)
        ? state.filters.colors.filter((c) => c !== action.color)
        : [...state.filters.colors, action.color as NoteColor];
      return { ...state, filters: { ...state.filters, colors } };
    }

    case 'SET_SORT':
      return { ...state, sort: action.sort };

    case 'CLEAR_FILTERS':
      return { ...state, filters: { authors: [], colors: [] } };

    case 'ADD_RECENT_NOTE':
      return { ...state, recentlyAddedIds: [...state.recentlyAddedIds, action.id] };

    case 'EXPIRE_RECENT_NOTE':
      return { ...state, recentlyAddedIds: state.recentlyAddedIds.filter((id) => id !== action.id) };

    default:
      return state;
  }
}
