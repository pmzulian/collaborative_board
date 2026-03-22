// Smoke test
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BoardCanvas } from './BoardCanvas';
import { BoardProvider } from '../../context/BoardProvider';
import { server } from '../../mocks/server';
import { API_BASE } from '../../mocks/handlers';

function makeClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
}

function renderCanvas() {
  return render(
    <QueryClientProvider client={makeClient()}>
      <BoardProvider>
        <BoardCanvas />
      </BoardProvider>
    </QueryClientProvider>,
  );
}

describe('BoardCanvas — Smoke tests', () => {
  it('Shows a loading indicator before data arrives', () => {
    renderCanvas();
    expect(screen.getByRole('status')).toHaveTextContent(/loading notes/i);
  });

  it('Renders all notes returned by the API', async () => {
    renderCanvas();
    const articles = await screen.findAllByRole('article');
    expect(articles).toHaveLength(3);
  });

  it('Shows an empty-state message when the API returns no notes', async () => {
    server.use(http.get(`${API_BASE}/notes`, () => HttpResponse.json([])));
    renderCanvas();
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/no notes match/i);
    });
  });

  it('Shows an error message when the API fails', async () => {
    server.use(http.get(`${API_BASE}/notes`, () => new HttpResponse(null, { status: 500 })));
    renderCanvas();
    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to load notes/i);
  });
});
