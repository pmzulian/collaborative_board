// Smoke test
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActivityTimeline } from './ActivityTimeline';
import { BoardProvider } from '../../context/BoardProvider';
import { server } from '../../mocks/server';
import { API_BASE } from '../../mocks/handlers';

function makeClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
}

function renderTimeline() {
  return render(
    <QueryClientProvider client={makeClient()}>
      <BoardProvider>
        <ActivityTimeline />
      </BoardProvider>
    </QueryClientProvider>,
  );
}

describe('ActivityTimeline — Smoke tests', () => {
  it('Shows a loading indicator before data arrives', () => {
    renderTimeline();
    expect(screen.getByRole('status')).toHaveTextContent(/loading activity/i);
  });

  it('Renders one article card per note returned by the API', async () => {
    renderTimeline();
    const articles = await screen.findAllByRole('article');
    expect(articles).toHaveLength(3);
  });

  it('Shows an empty-state message when the API returns no notes', async () => {
    server.use(http.get(`${API_BASE}/notes`, () => HttpResponse.json([])));
    renderTimeline();
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/no activity matches/i);
    });
  });

  it('Shows an error message when the API fails', async () => {
    server.use(http.get(`${API_BASE}/notes`, () => new HttpResponse(null, { status: 500 })));
    renderTimeline();
    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to load notes/i);
  });
});
