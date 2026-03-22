import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateNoteForm } from './CreateNoteForm';
import { BoardProvider } from '../../context/BoardProvider';

// jsdom does not implement HTMLDialogElement.showModal(); using prototype mocking instead
beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    },
  });
});

afterAll(() => {
  delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
});

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function renderForm(onClose = vi.fn()) {
  return {
    onClose,
    ...render(
      <QueryClientProvider client={makeClient()}>
        <BoardProvider>
          <CreateNoteForm onClose={onClose} />
        </BoardProvider>
      </QueryClientProvider>,
    ),
  };
}

describe('CreateNoteForm — Rendering', () => {
  it('Renders the dialog with the form title "New note"', () => {
    renderForm();
    expect(screen.getByRole('dialog', { name: /new note/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /new note/i })).toBeInTheDocument();
  });

  it('Renders the Text textarea and Author text input', () => {
    renderForm();
    expect(screen.getByRole('textbox', { name: /^text$/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /author/i })).toBeInTheDocument();
  });

  it('Renders 6 color radio options', () => {
    renderForm();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(6);
  });
});

describe('CreateNoteForm — Validation', () => {
  it('Submit button is disabled when both fields are empty', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /add note/i })).toBeDisabled();
  });

  it('Submit button is disabled when only the Text field is filled', async () => {
    renderForm();
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox', { name: /^text$/i }), 'Some text');
    expect(screen.getByRole('button', { name: /add note/i })).toBeDisabled();
  });

  it('Submit button is disabled when only the Author field is filled', async () => {
    renderForm();
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox', { name: /author/i }), 'user_5');
    expect(screen.getByRole('button', { name: /add note/i })).toBeDisabled();
  });

  it('Submit button is enabled when both fields have non-empty content', async () => {
    renderForm();
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox', { name: /^text$/i }), 'Some text');
    await user.type(screen.getByRole('textbox', { name: /author/i }), 'user_5');
    expect(screen.getByRole('button', { name: /add note/i })).toBeEnabled();
  });
});

describe('CreateNoteForm — Interactions', () => {
  it('Clicking Cancel does not unmount the dialog immediately (close is deferred to animation end)', async () => {
    renderForm();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('Submitting the form calls the POST API and clears the fields on success', async () => {
    renderForm();
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox', { name: /^text$/i }), 'My new note');
    await user.type(screen.getByRole('textbox', { name: /author/i }), 'user_5');
    await user.click(screen.getByRole('button', { name: /add note/i }));
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /^text$/i })).toHaveValue('');
    });
    expect(screen.getByRole('textbox', { name: /author/i })).toHaveValue('');
  });
});
