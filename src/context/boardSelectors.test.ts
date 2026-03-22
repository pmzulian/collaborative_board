import { describe, it, expect } from 'vitest';
import {
  selectAllAuthors,
  selectFilteredNotes,
  selectHasActiveFilters,
} from './boardSelectors';
import { initialState } from './boardReducer';
import type { BoardState, FilterState, StickyNote } from '../types';

const notes: StickyNote[] = [
  {
    id: 'note_1',
    text: 'First note',
    x: 300,
    y: 200,
    author: 'user_1',
    color: 'yellow',
    createdAt: '2026-03-10T09:00:00.000Z',
  },
  {
    id: 'note_2',
    text: 'Second note',
    x: 100,
    y: 400,
    author: 'user_2',
    color: 'blue',
    createdAt: '2026-03-11T10:00:00.000Z',
  },
  {
    id: 'note_3',
    text: 'Third note',
    x: 200,
    y: 100,
    author: 'user_1',
    color: 'pink',
    createdAt: '2026-03-12T08:00:00.000Z',
  },
  {
    id: 'note_4',
    text: 'Fourth note',
    x: 50,
    y: 300,
    author: 'user_3',
    color: 'yellow',
    createdAt: '2026-03-09T12:00:00.000Z',
  },
];

const emptyFilters: FilterState = { authors: [], colors: [] };


describe('selectAllAuthors', () => {
  it('Returns unique authors sorted alphabetically', () => {
    const authors = selectAllAuthors(notes);
    expect(authors).toEqual(['user_1', 'user_2', 'user_3']);
  });

  it('Deduplicates authors that appear on multiple notes', () => {
    const authors = selectAllAuthors(notes);
    // user_1 appears twice in fixtures but should appear once
    expect(authors.filter((a) => a === 'user_1')).toHaveLength(1);
  });

  it('Returns an empty array when given no notes', () => {
    expect(selectAllAuthors([])).toEqual([]);
  });
});


describe('selectFilteredNotes — author filter', () => {
  it('Returns all notes when no author filter is active', () => {
    const result = selectFilteredNotes(notes, emptyFilters, 'newest');
    expect(result).toHaveLength(notes.length);
  });

  it('Returns only notes from the selected author', () => {
    const filters: FilterState = { authors: ['user_1'], colors: [] };
    const result = selectFilteredNotes(notes, filters, 'newest');
    expect(result.every((n) => n.author === 'user_1')).toBe(true);
  });

  it('Returns notes from multiple selected authors', () => {
    const filters: FilterState = { authors: ['user_1', 'user_3'], colors: [] };
    const result = selectFilteredNotes(notes, filters, 'newest');
    expect(result.every((n) => ['user_1', 'user_3'].includes(n.author))).toBe(true);
    expect(result.some((n) => n.author === 'user_2')).toBe(false);
  });

  it('Returns an empty array when no notes match the author filter', () => {
    const filters: FilterState = { authors: ['user_999'], colors: [] };
    const result = selectFilteredNotes(notes, filters, 'newest');
    expect(result).toHaveLength(0);
  });
});

describe('selectFilteredNotes — color filter', () => {
  it('Returns only notes matching the selected color', () => {
    const filters: FilterState = { authors: [], colors: ['yellow'] };
    const result = selectFilteredNotes(notes, filters, 'newest');
    expect(result.every((n) => n.color === 'yellow')).toBe(true);
  });

  it('Returns notes matching any of the selected colors', () => {
    const filters: FilterState = { authors: [], colors: ['yellow', 'blue'] };
    const result = selectFilteredNotes(notes, filters, 'newest');
    expect(result.every((n) => ['yellow', 'blue'].includes(n.color))).toBe(true);
  });
});

describe('selectFilteredNotes — combined author + color filter', () => {
  it('Applies both filters simultaneously (AND logic)', () => {
    // user_1 has yellow (note_1) and pink (note_3); only yellow should survive
    const filters: FilterState = { authors: ['user_1'], colors: ['yellow'] };
    const result = selectFilteredNotes(notes, filters, 'newest');
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('note_1');
  });
});

describe('selectFilteredNotes — sort: newest', () => {
  it('Returns notes ordered from most recent to oldest', () => {
    const result = selectFilteredNotes(notes, emptyFilters, 'newest');
    const times = result.map((n) => new Date(n.createdAt).getTime());
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });
});

describe('selectFilteredNotes — sort: oldest', () => {
  it('Returns notes ordered from oldest to most recent', () => {
    const result = selectFilteredNotes(notes, emptyFilters, 'oldest');
    const times = result.map((n) => new Date(n.createdAt).getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });
});

describe('selectFilteredNotes — sort: position-x', () => {
  it('Returns notes ordered by ascending x coordinate', () => {
    const result = selectFilteredNotes(notes, emptyFilters, 'position-x');
    const xs = result.map((n) => n.x);
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
  });
});

describe('selectFilteredNotes — sort: position-y', () => {
  it('Returns notes ordered by ascending y coordinate', () => {
    const result = selectFilteredNotes(notes, emptyFilters, 'position-y');
    const ys = result.map((n) => n.y);
    expect(ys).toEqual([...ys].sort((a, b) => a - b));
  });
});

describe('selectFilteredNotes — immutability', () => {
  it('Does not mutate the original notes array', () => {
    const original = [...notes];
    selectFilteredNotes(notes, emptyFilters, 'oldest');
    expect(notes).toEqual(original);
  });
});

describe('selectHasActiveFilters', () => {
  it('Returns false when no filters are active', () => {
    expect(selectHasActiveFilters(initialState)).toBe(false);
  });

  it('Returns true when an author filter is active', () => {
    const state: BoardState = {
      ...initialState,
      filters: { authors: ['user_1'], colors: [] },
    };
    expect(selectHasActiveFilters(state)).toBe(true);
  });

  it('Returns true when a color filter is active', () => {
    const state: BoardState = {
      ...initialState,
      filters: { authors: [], colors: ['blue'] },
    };
    expect(selectHasActiveFilters(state)).toBe(true);
  });

  it('Returns true when both author and color filters are active', () => {
    const state: BoardState = {
      ...initialState,
      filters: { authors: ['user_1'], colors: ['pink'] },
    };
    expect(selectHasActiveFilters(state)).toBe(true);
  });
});
