import { useMemo } from 'react';
import { useBoardContext } from '../../context/BoardContext';
import { useBoardActions } from '../../context/useBoardActions';
import { selectHasActiveFilters } from '../../context/boardSelectors';
import { AuthorList } from './AuthorList';
import { ColorSwatches } from './ColorSwatches';
import styles from './FilterPanel.module.css';

/** Compound component root — manages no internal state; reads from BoardContext. */
export function FilterPanel() {
  const { state } = useBoardContext();
  const { clearFilters } = useBoardActions();
  const hasFilters = useMemo(() => selectHasActiveFilters(state), [state]);

  return (
    <aside className={styles.panel} aria-label="Filter controls">
      <div className={styles.header}>
        <h2 className={styles.title}>Filters</h2>
        {hasFilters && (
          <button
            className={styles.clearBtn}
            onClick={clearFilters}
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        )}
      </div>
      <FilterPanel.AuthorList />
      <FilterPanel.ColorSwatches />
    </aside>
  );
}

// Compound component namespacing
FilterPanel.AuthorList = AuthorList;
FilterPanel.ColorSwatches = ColorSwatches;
