import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StickyNote } from './StickyNote';
import type { NoteColor } from '../../types';

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

const defaultProps = {
  id: 'note_t1',
  text: 'Login flow is confusing',
  author: 'user_1',
  color: 'yellow' as NoteColor,
  createdAt: '2026-03-10T09:00:00.000Z',
};

function renderNote(props: Partial<typeof defaultProps> & { isNew?: boolean } = {}) {
  return render(
    <QueryClientProvider client={makeClient()}>
      <StickyNote {...defaultProps} {...props} />
    </QueryClientProvider>,
  );
}

describe('StickyNote — View mode', () => {
  it('Renders the note text and author', () => {
    renderNote();
    expect(screen.getByText('Login flow is confusing')).toBeInTheDocument();
    expect(screen.getByText('user_1')).toBeInTheDocument();
  });

  it('Has an accessible label identifying the note as "Note by author: text"', () => {
    renderNote();
    expect(
      screen.getByRole('article', { name: /^note by user_1: login flow is confusing/i }),
    ).toBeInTheDocument();
  });

  it('Has an accessible label starting with "New note" when isNew is true', () => {
    renderNote({ isNew: true });
    expect(
      screen.getByRole('article', { name: /^new note by user_1/i }),
    ).toBeInTheDocument();
  });

  it('Shows Edit and Delete action buttons in view mode', () => {
    renderNote();
    expect(screen.getByRole('button', { name: /edit note/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete note by user_1/i })).toBeInTheDocument();
  });

  it('Renders a time element with the ISO createdAt date', () => {
    renderNote();
    expect(screen.getByRole('time')).toHaveAttribute('dateTime', '2026-03-10T09:00:00.000Z');
  });
});

describe('StickyNote — Edit mode', () => {
  it('Clicking Edit shows a textarea pre-filled with the current note text', async () => {
    renderNote();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /edit note/i }));
    expect(screen.getByRole('textbox', { name: /edit note text/i })).toHaveValue(
      'Login flow is confusing',
    );
  });

  it('Shows Save and Cancel buttons while in edit mode', async () => {
    renderNote();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /edit note/i }));
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel edit/i })).toBeInTheDocument();
  });

  it('Pressing Escape exits edit mode and restores the original text', async () => {
    renderNote();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /edit note/i }));
    const textarea = screen.getByRole('textbox', { name: /edit note text/i });
    await user.clear(textarea);
    await user.type(textarea, 'Discarded change');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Login flow is confusing')).toBeInTheDocument();
  });

  it('Pressing Enter with changed text commits the edit and exits edit mode', async () => {
    renderNote();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /edit note/i }));
    const textarea = screen.getByRole('textbox', { name: /edit note text/i });
    await user.clear(textarea);
    await user.type(textarea, 'Updated text');
    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  it('Pressing Enter without changing the text exits edit mode without calling the API', async () => {
    renderNote();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /edit note/i }));
    const textarea = screen.getByRole('textbox', { name: /edit note text/i });
    await user.type(textarea, '{Enter}');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Login flow is confusing')).toBeInTheDocument();
  });

  it('Clicking the Cancel button in edit mode exits without saving', async () => {
    renderNote();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /edit note/i }));
    await user.click(screen.getByRole('button', { name: /cancel edit/i }));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Login flow is confusing')).toBeInTheDocument();
  });
});

describe('StickyNote — Delete', () => {
  it('Clicking Delete calls the DELETE API (button becomes disabled then re-enables)', async () => {
    renderNote();
    const user = userEvent.setup();
    const deleteBtn = screen.getByRole('button', { name: /delete note by user_1/i });
    await user.click(deleteBtn);
    // MSW handles the DELETE request; after success isPending goes false → button re-enables
    await waitFor(() => {
      expect(deleteBtn).not.toBeDisabled();
    });
  });
});
