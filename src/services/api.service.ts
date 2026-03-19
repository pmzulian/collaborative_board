import type { StickyNote, NoteColor } from '../types';

const BASE_URL = 'http://localhost:3001';

export interface CreateNoteInput {
  text: string;
  x: number;
  y: number;
  author: string;
  color: NoteColor;
}

export interface UpdateNoteInput {
  id: string;
  text?: string;
  x?: number;
  y?: number;
  color?: NoteColor;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}


export async function fetchNotes(): Promise<StickyNote[]> {
  const res = await fetch(`${BASE_URL}/notes`);
  return handleResponse<StickyNote[]>(res);
}

export async function createNote(input: CreateNoteInput): Promise<StickyNote> {
  const body: Omit<StickyNote, 'id'> = {
    ...input,
    createdAt: new Date().toISOString(),
  };
  const res = await fetch(`${BASE_URL}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<StickyNote>(res);
}

export async function updateNote({ id, ...patch }: UpdateNoteInput): Promise<StickyNote> {
  const res = await fetch(`${BASE_URL}/notes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return handleResponse<StickyNote>(res);
}

export async function deleteNote(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/notes/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
}
