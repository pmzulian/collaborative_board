import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FilterPanel } from './FilterPanel';
import { BoardProvider } from '../../context/BoardProvider';

function renderFilterPanel() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return render(
    <QueryClientProvider client={client}>
      <BoardProvider>
        <FilterPanel />
      </BoardProvider>
    </QueryClientProvider>
  );
}

describe('FilterPanel — Initial structure', () => {
  it('Renders the panel with its accessible landmark', () => {
    renderFilterPanel();
    expect(screen.getByRole('complementary', { name: /filter controls/i })).toBeInTheDocument();
  });

  it('Shows the collapse button as expanded by default', () => {
    renderFilterPanel();
    const btn = screen.getByRole('button', { name: /collapse filters sidebar/i });
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('Shows all three sections expanded by default', () => {
    renderFilterPanel();
    expect(screen.getByRole('button', { name: /author/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /color/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /sort by/i })).toHaveAttribute('aria-expanded', 'true');
  });

  it('Does not show the "Clear all" button when no filters are active', () => {
    renderFilterPanel();
    expect(screen.queryByRole('button', { name: /clear all filters/i })).not.toBeInTheDocument();
  });
});

describe('FilterPanel — Panel collapse', () => {
  it('Collapses the panel when the collapse button is clicked', async () => {
    renderFilterPanel();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /collapse filters sidebar/i }));

    expect(screen.getByRole('button', { name: /expand filters sidebar/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('Expands the panel when the expand button is clicked while collapsed', async () => {
    renderFilterPanel();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /collapse filters sidebar/i }));
    await user.click(screen.getByRole('button', { name: /expand filters sidebar/i }));

    expect(screen.getByRole('button', { name: /collapse filters sidebar/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('Expands the panel when any collapsed-mode shortcut is clicked', async () => {
    renderFilterPanel();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /collapse filters sidebar/i }));
    await user.click(screen.getByRole('button', { name: /expand to filter by author/i }));

    expect(screen.getByRole('button', { name: /collapse filters sidebar/i })).toBeInTheDocument();
  });
});

describe('FilterPanel — Section accordion', () => {
  it('Hides the Author section content when collapsed', async () => {
    renderFilterPanel();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /author/i }));

    expect(screen.queryByRole('group', { name: /author/i })).not.toBeInTheDocument();
  });

  it('Shows the Author section content again when re-expanded', async () => {
    renderFilterPanel();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /author/i }));
    await user.click(screen.getByRole('button', { name: /author/i }));

    expect(await screen.findByRole('group', { name: /author/i })).toBeInTheDocument();
  });

  it('Collapsing one section does not affect the others', async () => {
    renderFilterPanel();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /author/i }));

    expect(screen.getByRole('button', { name: /color/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /sort by/i })).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('FilterPanel — Author filter', () => {
  it('Renders one checkbox per unique author returned by the API', async () => {
    renderFilterPanel();

    const checkboxes = await screen.findAllByRole('checkbox');
    // mockNotes has user_1 and user_2 as unique authors
    expect(checkboxes).toHaveLength(2);
  });

  it('Author checkboxes are unchecked by default', async () => {
    renderFilterPanel();

    const checkboxes = await screen.findAllByRole('checkbox');
    checkboxes.forEach((cb) => expect(cb).not.toBeChecked());
  });

  it('Checking an author activates its checkbox', async () => {
    renderFilterPanel();
    const user = userEvent.setup();

    const checkbox = await screen.findByRole('checkbox', { name: /filter by user_1/i });
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it('Unchecking an active author deselects it', async () => {
    renderFilterPanel();
    const user = userEvent.setup();

    const checkbox = await screen.findByRole('checkbox', { name: /filter by user_1/i });
    await user.click(checkbox);
    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
  });

  it('Multiple authors can be selected simultaneously', async () => {
    renderFilterPanel();
    const user = userEvent.setup();

    const cb1 = await screen.findByRole('checkbox', { name: /filter by user_1/i });
    const cb2 = screen.getByRole('checkbox', { name: /filter by user_2/i });

    await user.click(cb1);
    await user.click(cb2);

    expect(cb1).toBeChecked();
    expect(cb2).toBeChecked();
  });

  it('Shows the "Clear all" button when an author filter is activated', async () => {
    renderFilterPanel();
    const user = userEvent.setup();

    const checkbox = await screen.findByRole('checkbox', { name: /filter by user_1/i });
    await user.click(checkbox);

    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
  });
});

describe('FilterPanel — Color filter', () => {
  it('Renders buttons for all 6 available colors', () => {
    renderFilterPanel();
    const swatchRegion = screen.getByRole('group', { name: /color/i });
    const swatches = within(swatchRegion).getAllByRole('listitem');
    expect(swatches).toHaveLength(6);
  });

  it('Color swatches have aria-pressed="false" by default', () => {
    renderFilterPanel();
    const swatchRegion = screen.getByRole('group', { name: /color/i });
    const swatches = within(swatchRegion).getAllByRole('button');
    swatches.forEach((s) => expect(s).toHaveAttribute('aria-pressed', 'false'));
  });

  it('Activating a color swatch sets aria-pressed to "true"', async () => {
    renderFilterPanel();
    const user = userEvent.setup();

    const yellowBtn = screen.getByRole('button', { name: /filter by yellow notes/i });
    await user.click(yellowBtn);

    expect(yellowBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('Deactivating an active swatch resets aria-pressed to "false"', async () => {
    renderFilterPanel();
    const user = userEvent.setup();

    const yellowBtn = screen.getByRole('button', { name: /filter by yellow notes/i });
    await user.click(yellowBtn);
    await user.click(yellowBtn);

    expect(yellowBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('Shows the "Clear all" button when a color filter is activated', async () => {
    renderFilterPanel();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /filter by blue notes/i }));

    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
  });
});

describe('FilterPanel — Clear all button', () => {
  it('Clear all deselects all active author filters', async () => {
    renderFilterPanel();
    const user = userEvent.setup();

    const checkbox = await screen.findByRole('checkbox', { name: /filter by user_1/i });
    await user.click(checkbox);
    await user.click(screen.getByRole('button', { name: /clear all filters/i }));

    expect(checkbox).not.toBeChecked();
  });

  it('Clear all deselects all active color swatches', async () => {
    renderFilterPanel();
    const user = userEvent.setup();

    const yellowBtn = screen.getByRole('button', { name: /filter by yellow notes/i });
    await user.click(yellowBtn);
    await user.click(screen.getByRole('button', { name: /clear all filters/i }));

    expect(yellowBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('Clear all disappears after all filters are cleared', async () => {
    renderFilterPanel();
    const user = userEvent.setup();

    const checkbox = await screen.findByRole('checkbox', { name: /filter by user_1/i });
    await user.click(checkbox);

    const clearBtn = screen.getByRole('button', { name: /clear all filters/i });
    await user.click(clearBtn);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /clear all filters/i })).not.toBeInTheDocument();
    });
  });
});

describe('FilterPanel — Sort control', () => {
  it('Renders the sort select with "Newest first" by default', () => {
    renderFilterPanel();
    const select = screen.getByRole('combobox', { name: /sort notes by/i });
    expect(select).toHaveValue('newest');
  });

  it('Changing the select updates the selected option', async () => {
    renderFilterPanel();
    const user = userEvent.setup();

    const select = screen.getByRole('combobox', { name: /sort notes by/i });
    await user.selectOptions(select, 'oldest');

    expect(select).toHaveValue('oldest');
  });

  it('Exposes all 4 sort options', () => {
    renderFilterPanel();
    const select = screen.getByRole('combobox', { name: /sort notes by/i });
    const options = within(select as HTMLElement).getAllByRole('option');
    expect(options).toHaveLength(4);
  });
});
