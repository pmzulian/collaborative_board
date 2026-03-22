import { describe, it, expect } from 'vitest';
import { boardReducer, initialState } from './boardReducer';
import type { BoardState } from '../types';

const stateWithFilters: BoardState = {
  filters: { authors: ['user_1', 'user_2'], colors: ['yellow', 'blue'] },
  sort: 'oldest',
  recentlyAddedIds: [],
};

describe('boardReducer — SET_AUTHOR_FILTER', () => {
  it('Replaces the authors array with the provided list', () => {
    const next = boardReducer(initialState, {
      type: 'SET_AUTHOR_FILTER',
      authors: ['user_1', 'user_3'],
    });
    expect(next.filters.authors).toEqual(['user_1', 'user_3']);
  });

  it('Clears authors when an empty array is dispatched', () => {
    const next = boardReducer(stateWithFilters, {
      type: 'SET_AUTHOR_FILTER',
      authors: [],
    });
    expect(next.filters.authors).toEqual([]);
  });

  it('Does not mutate color filters', () => {
    const next = boardReducer(stateWithFilters, {
      type: 'SET_AUTHOR_FILTER',
      authors: ['user_1'],
    });
    expect(next.filters.colors).toEqual(stateWithFilters.filters.colors);
  });
});

describe('boardReducer — TOGGLE_AUTHOR', () => {
  it('Adds an author when not already in the filter', () => {
    const next = boardReducer(initialState, { type: 'TOGGLE_AUTHOR', author: 'user_1' });
    expect(next.filters.authors).toContain('user_1');
  });

  it('Removes an author that is already in the filter', () => {
    const state: BoardState = {
      ...initialState,
      filters: { authors: ['user_1', 'user_2'], colors: [] },
    };
    const next = boardReducer(state, { type: 'TOGGLE_AUTHOR', author: 'user_1' });
    expect(next.filters.authors).not.toContain('user_1');
    expect(next.filters.authors).toContain('user_2');
  });

  it('Does not duplicate an author toggled on twice', () => {
    const after1 = boardReducer(initialState, { type: 'TOGGLE_AUTHOR', author: 'user_1' });
    const after2 = boardReducer(after1, { type: 'TOGGLE_AUTHOR', author: 'user_1' });
    // Second toggle removes it — list must be empty
    expect(after2.filters.authors).toEqual([]);
  });
});

describe('boardReducer — TOGGLE_COLOR', () => {
  it('Adds a color when not already in the filter', () => {
    const next = boardReducer(initialState, { type: 'TOGGLE_COLOR', color: 'yellow' });
    expect(next.filters.colors).toContain('yellow');
  });

  it('Removes a color that is already in the filter', () => {
    const state: BoardState = {
      ...initialState,
      filters: { authors: [], colors: ['yellow', 'pink'] },
    };
    const next = boardReducer(state, { type: 'TOGGLE_COLOR', color: 'yellow' });
    expect(next.filters.colors).not.toContain('yellow');
    expect(next.filters.colors).toContain('pink');
  });

  it('Does not affect author filters', () => {
    const state: BoardState = {
      ...initialState,
      filters: { authors: ['user_1'], colors: [] },
    };
    const next = boardReducer(state, { type: 'TOGGLE_COLOR', color: 'blue' });
    expect(next.filters.authors).toEqual(['user_1']);
  });
});

describe('boardReducer — SET_SORT', () => {
  it('Updates the sort option', () => {
    const next = boardReducer(initialState, { type: 'SET_SORT', sort: 'oldest' });
    expect(next.sort).toBe('oldest');
  });

  it('Accepts all valid sort options', () => {
    const options = ['newest', 'oldest', 'position-x', 'position-y'] as const;
    for (const sort of options) {
      const next = boardReducer(initialState, { type: 'SET_SORT', sort });
      expect(next.sort).toBe(sort);
    }
  });

  it('Does not affect active filters when changing sort', () => {
    const next = boardReducer(stateWithFilters, { type: 'SET_SORT', sort: 'newest' });
    expect(next.filters).toEqual(stateWithFilters.filters);
  });
});

describe('boardReducer — CLEAR_FILTERS', () => {
  it('Resets authors and colors to empty arrays', () => {
    const next = boardReducer(stateWithFilters, { type: 'CLEAR_FILTERS' });
    expect(next.filters.authors).toEqual([]);
    expect(next.filters.colors).toEqual([]);
  });

  it('Preserves the current sort option when clearing filters', () => {
    const next = boardReducer(stateWithFilters, { type: 'CLEAR_FILTERS' });
    expect(next.sort).toBe(stateWithFilters.sort);
  });
});


describe('boardReducer — ADD_RECENT_NOTE', () => {
  it('Appends the note id to recentlyAddedIds', () => {
    const next = boardReducer(initialState, { type: 'ADD_RECENT_NOTE', id: 'note_1' });
    expect(next.recentlyAddedIds).toContain('note_1');
  });

  it('Accumulates multiple recent note ids', () => {
    const after1 = boardReducer(initialState, { type: 'ADD_RECENT_NOTE', id: 'note_1' });
    const after2 = boardReducer(after1, { type: 'ADD_RECENT_NOTE', id: 'note_2' });
    expect(after2.recentlyAddedIds).toEqual(['note_1', 'note_2']);
  });
});

describe('boardReducer — EXPIRE_RECENT_NOTE', () => {
  it('Removes the expired note id from recentlyAddedIds', () => {
    const state: BoardState = {
      ...initialState,
      recentlyAddedIds: ['note_1', 'note_2'],
    };
    const next = boardReducer(state, { type: 'EXPIRE_RECENT_NOTE', id: 'note_1' });
    expect(next.recentlyAddedIds).not.toContain('note_1');
    expect(next.recentlyAddedIds).toContain('note_2');
  });

  it('Is a no-op if the id is not in the list', () => {
    const state: BoardState = { ...initialState, recentlyAddedIds: ['note_1'] };
    const next = boardReducer(state, { type: 'EXPIRE_RECENT_NOTE', id: 'note_999' });
    expect(next.recentlyAddedIds).toEqual(['note_1']);
  });
});

describe('boardReducer — immutability', () => {
  it('Returns a new state reference on every action', () => {
    const next = boardReducer(initialState, { type: 'TOGGLE_AUTHOR', author: 'user_1' });
    expect(next).not.toBe(initialState);
  });

  it('Returns the same reference for unknown actions (default branch)', () => {
    // Cast to bypass TypeScript, simulates an unrecognised action at runtime
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const next = boardReducer(initialState, { type: '__UNKNOWN__' } as any);
    expect(next).toBe(initialState);
  });
});
