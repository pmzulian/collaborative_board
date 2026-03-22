import { http, HttpResponse } from 'msw';
import type { StickyNote } from '../types';

export const API_BASE = 'http://localhost:3001';

// Testing data and MSW handlers for intercepting API requests in tests.
export const mockNotes: StickyNote[] = [
  {
    id: 'note_t1',
    text: 'Login flow is confusing',
    x: 100,
    y: 100,
    author: 'user_1',
    color: 'yellow',
    createdAt: '2026-03-10T09:00:00.000Z',
  },
  {
    id: 'note_t2',
    text: 'Add keyboard shortcuts',
    x: 300,
    y: 100,
    author: 'user_2',
    color: 'blue',
    createdAt: '2026-03-10T10:00:00.000Z',
  },
  {
    id: 'note_t3',
    text: 'Color coding helps categorization',
    x: 200,
    y: 250,
    author: 'user_1',
    color: 'pink',
    createdAt: '2026-03-11T09:00:00.000Z',
  },
];

export const handlers = [
  http.get(`${API_BASE}/notes`, () => {
    return HttpResponse.json(mockNotes);
  }),

  http.post(`${API_BASE}/notes`, async ({ request }) => {
    const body = (await request.json()) as Omit<StickyNote, 'id'>;
    const created: StickyNote = {
      id: `note_t${Date.now()}`,
      ...body,
    };
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch(`${API_BASE}/notes/:id`, async ({ params, request }) => {
    const note = mockNotes.find((n) => n.id === params['id']);
    if (!note) return new HttpResponse(null, { status: 404 });
    const patch = (await request.json()) as Partial<StickyNote>;
    return HttpResponse.json({ ...note, ...patch });
  }),

  http.delete(`${API_BASE}/notes/:id`, ({ params }) => {
    const exists = mockNotes.some((n) => n.id === params['id']);
    if (!exists) return new HttpResponse(null, { status: 404 });
    return new HttpResponse(null, { status: 200 });
  }),
];
