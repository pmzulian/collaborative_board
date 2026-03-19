import { useBoardContext } from '../../context/BoardContext';
import { useBoardActions } from '../../context/useBoardActions';
import type { SortOption } from '../../types';
import styles from './SortControl.module.css';

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest',     label: 'Newest first' },
  { value: 'oldest',     label: 'Oldest first' },
  { value: 'position-x', label: 'Position (left → right)' },
  { value: 'position-y', label: 'Position (top → bottom)' },
];

export function SortControl() {
  const { state } = useBoardContext();
  const { setSort } = useBoardActions();

  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor="sort-select">
        Sort by
      </label>
      <select
        id="sort-select"
        className={styles.select}
        value={state.sort}
        onChange={(e) => setSort(e.target.value as SortOption)}
        aria-label="Sort notes"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
